// @implements FA2.4
#include "VisualFeedback.h"
#include "BLEStreamer.h"

// RGB LED Pins des XIAO nRF52840 (LOW = An, HIGH = Aus)
static const int RED_ledPin = LEDR;
static const int BLUE_ledPin = LEDB;
static const int GREEN_ledPin = LEDG;

static void cooldownDelay(unsigned long ms) {
    unsigned long start = millis();
    while (millis() - start < ms) {
        pollBLE();
        delay(10);
    }
}

// @implements FA2.4
void initFeedback() {
    
    // LEDs initial ausschalten
    pinMode(RED_ledPin, OUTPUT);
    pinMode(BLUE_ledPin, OUTPUT);
    pinMode(GREEN_ledPin, OUTPUT);
    digitalWrite(RED_ledPin, HIGH);
    digitalWrite(BLUE_ledPin, HIGH);
    digitalWrite(GREEN_ledPin, HIGH);
}

static unsigned long cooldownUntil = 0;

// @implements FA2.4
bool isFeedbackInCooldown() {
    if (!isBLEConnected()) return false;
    return millis() < cooldownUntil;
}

// @implements FA2.4
void updateFeedback(const String& best_label, float best_val, float anomaly_score) {

    if (!isBLEConnected()) {
        // Solange kein Bluetooth verbunden ist: Langsames Blinken (Blau an/aus)
        static bool blinkState = false;
        blinkState = !blinkState;
        digitalWrite(RED_ledPin, HIGH);
        digitalWrite(GREEN_ledPin, HIGH);
        digitalWrite(BLUE_ledPin, blinkState ? LOW : HIGH);
        
        String dispLabel = (best_label == "LateralRaises") ? "LateralRaises" : "idle";
        sendJsonToPC(dispLabel, best_val, anomaly_score, "Warte auf Bluetooth-Verbindung...");
        cooldownDelay(500);
        return;
    }

    if (best_label == "idle" || best_label == "LateralRaises" || best_val < 0.6) {
        // Ruhemodus / Seitheben -> LED dauerhaft Blau
        digitalWrite(RED_ledPin, HIGH);
        digitalWrite(BLUE_ledPin, LOW); 
        digitalWrite(GREEN_ledPin, HIGH);
        
        String dispLabel = (best_label == "LateralRaises") ? "LateralRaises" : "idle";
        String dispTipp = (best_label == "LateralRaises") ? "Seitheben erkannt" : "Bereit";
        sendJsonToPC(dispLabel, best_val, anomaly_score, dispTipp);
        streamInferenceResult(dispLabel, best_val, anomaly_score, dispTipp);
        cooldownUntil = millis() + 1000;
    } 
    else if (best_label == "CURL" || best_label == "curl_sauber") {
        // Sauberer Curl -> LED Grün
        digitalWrite(RED_ledPin, HIGH);
        digitalWrite(BLUE_ledPin, HIGH);
        digitalWrite(GREEN_ledPin, LOW);
        
        sendJsonToPC(best_label, best_val, anomaly_score, "Super Ausfuehrung!");
        streamInferenceResult(best_label, best_val, anomaly_score, "Super Ausfuehrung!");
        cooldownUntil = millis() + 1500; // Cooldown um Doppel-Erkennung des gleichen Curls zu verhindern
    }
    else {
        // Irgendein Fehler erkannt (z.B. "fehler_rotation" oder "fehler_ellbogen") -> LED Rot
        digitalWrite(RED_ledPin, LOW);
        digitalWrite(BLUE_ledPin, HIGH);
        digitalWrite(GREEN_ledPin, HIGH);
 
        // Dynamischer Tipp je nach Fehlerklasse
        String tipp = "Bewegung korrigieren";
        if (best_label.indexOf("rotation") >= 0) tipp = "Handgelenk stabil halten!";
        if (best_label.indexOf("ellbogen") >= 0) tipp = "Ellbogen fixieren!";
 
        sendJsonToPC(best_label, best_val, anomaly_score, tipp);
        streamInferenceResult(best_label, best_val, anomaly_score, tipp);
        cooldownUntil = millis() + 1500; // Cooldown
    }
}

// @implements FA2.4
void sendJsonToPC(String label, float confidence, float anomaly, String tipp) {
    Serial.print("{\"event\": \"inferenz_ergebnis\", ");
    Serial.print("\"klasse\": \"" + label + "\", ");
    Serial.print("\"wahrscheinlichkeit\": " + String(confidence, 3) + ", ");
    Serial.print("\"anomalie_score\": " + String(anomaly, 3) + ", ");
    Serial.println("\"tipp\": \"" + tipp + "\"}");
}
