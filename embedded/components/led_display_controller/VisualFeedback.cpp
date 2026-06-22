// @implements FA2.4
#include "VisualFeedback.h"
#include <U8X8lib.h>

static U8X8_SSD1306_64X48_ER_HW_I2C u8x8(/* reset=*/ U8X8_PIN_NONE);

// RGB LED Pins des XIAO nRF52840 (LOW = An, HIGH = Aus)
static const int RED_ledPin = 11;
static const int BLUE_ledPin = 12;
static const int GREEN_ledPin = 13;

// @implements FA2.4
void initFeedback() {
    u8x8.begin();
    
    // LEDs initial ausschalten
    pinMode(RED_ledPin, OUTPUT);
    pinMode(BLUE_ledPin, OUTPUT);
    pinMode(GREEN_ledPin, OUTPUT);
    digitalWrite(RED_ledPin, HIGH);
    digitalWrite(BLUE_ledPin, HIGH);
    digitalWrite(GREEN_ledPin, HIGH);
}

// @implements FA2.4
void updateFeedback(const String& best_label, float best_val, float anomaly_score) {
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
        
        sendJsonToPC(best_label, best_val, anomaly_score, "Super Ausfuehrung!");
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

        sendJsonToPC(best_label, best_val, anomaly_score, tipp);
        delay(1500); // Cooldown
    }

    u8x8.refreshDisplay();
}

// @implements FA2.4
void sendJsonToPC(String label, float confidence, float anomaly, String tipp) {
    Serial.print("{\"event\": \"inferenz_ergebnis\", ");
    Serial.print("\"klasse\": \"" + label + "\", ");
    Serial.print("\"wahrscheinlichkeit\": " + String(confidence, 3) + ", ");
    Serial.print("\"anomalie_score\": " + String(anomaly, 3) + ", ");
    Serial.println("\"tipp\": \"" + tipp + "\"}");
}
