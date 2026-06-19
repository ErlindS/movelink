/* Includes ---------------------------------------------------------------- */
#include <Erlind-project-1_inferencing.h> // Deine exportierte Edge Impulse Bibliothek
#include <LSM6DS3.h>
#include <U8g2lib.h>
#include <U8X8lib.h>
#include <Wire.h>

/* Constant defines -------------------------------------------------------- */
#define CONVERT_G_TO_MS2    9.80665f
#define MAX_ACCEPTED_RANGE  2.0f 

U8X8_SSD1306_64X48_ER_HW_I2C u8x8(/* reset=*/ U8X8_PIN_NONE); 

/* Private variables ------------------------------------------------------- */
static bool debug_nn = false;
LSM6DS3 myIMU(I2C_MODE, 0x6A);

// RGB LED Pins des XIAO nRF52840 (Achtung: Die LEDs sind Low-Active, LOW = An, HIGH = Aus)
const int RED_ledPin =  11;
const int BLUE_ledPin =  12;
const int GREEN_ledPin =  13; 

void setup()
{
    Serial.begin(115200);
    u8x8.begin();
    
    // LEDs initial ausschalten
    pinMode(RED_ledPin, OUTPUT);
    pinMode(BLUE_ledPin, OUTPUT);
    pinMode(GREEN_ledPin, OUTPUT);
    digitalWrite(RED_ledPin, HIGH);
    digitalWrite(BLUE_ledPin, HIGH);
    digitalWrite(GREEN_ledPin, HIGH);

    // Warte kurz, damit der Serielle Monitor bereit ist
    delay(1000);

    if (!myIMU.begin()) {
        ei_printf("Failed to initialize IMU!\r\n");
    } else {
        ei_printf("IMU initialized\r\n");
    }

    // SICHERHEITSCHECK: Prüfen ob das Modell wirklich für 6 Achsen trainiert wurde
    if (EI_CLASSIFIER_RAW_SAMPLES_PER_FRAME != 6) {
        ei_printf("ERR: EI_CLASSIFIER_RAW_SAMPLES_PER_FRAME sollte 6 sein (Accel + Gyro)!\n");
        ei_printf("Aktuell erwartet das Modell: %d Achsen.\n", EI_CLASSIFIER_RAW_SAMPLES_PER_FRAME);
        return;
    }
}

float ei_get_sign(float number) {
    return (number >= 0.0) ? 1.0 : -1.0;
}

void loop()
{
    // Wir verzichten auf das delay(2000) im Loop, um flüssiger zu samplen.
    // Stattdessen füllen wir den Puffer kontinuierlich in der vorgegebenen Frequenz.
    
    float buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE] = { 0 };

    // Da wir 6 Achsen haben, springen wir in 6er-Schritten durch den DSP Puffer
    for (size_t ix = 0; ix < EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE; ix += 6) {
        uint64_t next_tick = micros() + (EI_CLASSIFIER_INTERVAL_MS * 1000);

        // 1. Beschleunigung einlesen
        buffer[ix + 0] = myIMU.readFloatAccelX();
        buffer[ix + 1] = myIMU.readFloatAccelY();
        buffer[ix + 2] = myIMU.readFloatAccelZ();

        // 2. Gyroskop einlesen
        buffer[ix + 3] = myIMU.readFloatGyroX();
        buffer[ix + 4] = myIMU.readFloatGyroY();
        buffer[ix + 5] = myIMU.readFloatGyroZ();

        // Clamping & Umrechnung nur für die Beschleunigungs-Achsen (Index 0 bis 2)
        for (int i = 0; i < 3; i++) {
            if (fabs(buffer[ix + i]) > MAX_ACCEPTED_RANGE) {
                buffer[ix + i] = ei_get_sign(buffer[ix + i]) * MAX_ACCEPTED_RANGE;
            }
            buffer[ix + i] *= CONVERT_G_TO_MS2;
        }

        // Das Gyroskop (Index 3 bis 5) belassen wir in Grad/Sekunde (dps), 
        // da Edge Impulse direkt damit arbeitet.

        delayMicroseconds(next_tick - micros());
    }

    // Signal aus Puffer erstellen
    signal_t signal;
    int err = numpy::signal_from_buffer(buffer, EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE, &signal);
    if (err != 0) {
        return;
    }

    // Klassifikator ausführen
    ei_impulse_result_t result = { 0 };
    err = run_classifier(&signal, &result, debug_nn);
    if (err != EI_IMPULSE_OK) {
        return;
    }

    // --- AUSWERTUNG & JSON OUTPUT FÜR DEN PC ---
    
    // Variablen für den besten Treffer
    int best_idx = 0;
    float best_val = 0.0;
    for (size_t ix = 0; ix < EI_CLASSIFIER_LABEL_COUNT; ix++) {
        if (result.classification[ix].value > best_val) {
            best_val = result.classification[ix].value;
            best_idx = ix;
        }
    }

    // Anomalie-Score abgreifen (falls der K-means Block aktiv ist)
    float anomaly_score = 0.0;
#if EI_CLASSIFIER_HAS_ANOMALY == 1
    anomaly_score = result.anomaly;
#endif

    // Label-Name des besten Treffers
    String best_label = String(result.classification[best_idx].label);

    // Display-Aktualisierung & LED Logik (angepasst auf deine Curl-Klassen)
    // ACHTUNG: Passe die String-Vergleiche an deine exakten Edge-Impulse Labelnamen an!
    
    u8x8.clear();
    u8x8.setFont(u8x8_font_amstrad_cpc_extended_r);

    if (best_label == "idle" || best_val < 0.6) {
        // Ruhemodus -> LED Blau, kein JSON senden um PC-Spam zu vermeiden
        digitalWrite(RED_ledPin, HIGH);
        digitalWrite(BLUE_ledPin, LOW); 
        digitalWrite(GREEN_ledPin, HIGH);
        u8x8.drawString(0, 2, "Status:");
        u8x8.drawString(0, 4, "IDLE");
    } 
    else if (best_label == "curl_sauber") {
        // Sauberer Curl -> LED Grün
        digitalWrite(RED_ledPin, HIGH);
        digitalWrite(BLUE_ledPin, HIGH);
        digitalWrite(GREEN_ledPin, LOW);
        u8x8.drawString(0, 2, "Curl:");
        u8x8.drawString(0, 4, "PERFEKT");
        
        send_json_to_pc(best_label, best_val, anomaly_score, "Super Ausfuehrung!");
        delay(1500); // Cooldown um Doppel-Erkennung des gleichen Curls zu verhindern
    }
    else {
        // Irgendein Fehler erkannt (z.B. "fehler_rotation" oder "fehler_ellbogen") -> LED Rot
        digitalWrite(RED_ledPin, LOW);
        digitalWrite(BLUE_ledPin, HIGH);
        digitalWrite(GREEN_ledPin, HIGH);
        u8x8.drawString(0, 2, "Achtung:");
        u8x8.drawString(0, 4, "FEHLER");

        // Dynamischer Tipp je nach Fehlerklasse
        String tipp = "Bewegung korrigieren";
        if (best_label.indexOf("rotation") >= 0) tipp = "Handgelenk stabil halten!";
        if (best_label.indexOf("ellbogen") >= 0) tipp = "Ellbogen fixieren!";

        send_json_to_pc(best_label, best_val, anomaly_score, tipp);
        delay(1500); // Cooldown
    }

    u8x8.refreshDisplay();
}

/**
 * @brief Hilfsfunktion um sauberes JSON an das PC-Dashboard zu senden
 */
void send_json_to_pc(String label, float confidence, float anomaly, String tipp) {
    Serial.print("{\"event\": \"inferenz_ergebnis\", ");
    Serial.print("\"klasse\": \"" + label + "\", ");
    Serial.print("\"wahrscheinlichkeit\": " + String(confidence, 3) + ", ");
    Serial.print("\"anomalie_score\": " + String(anomaly, 3) + ", ");
    Serial.println("\"tipp\": \"" + tipp + "\"}");
}