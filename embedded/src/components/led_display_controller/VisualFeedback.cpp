// @implements FA2.4
#include "VisualFeedback.h"
#include "../ble_streamer/BLEStreamer.h"

// RGB LED Pins des XIAO nRF52840 (LOW = An, HIGH = Aus)
#ifndef LEDR
#define LEDR LED_RED
#endif
#ifndef LEDB
#define LEDB LED_BLUE
#endif
#ifndef LEDG
#define LEDG LED_GREEN
#endif

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
        
        String dispLabel = (best_label == "LateralRaise" || best_label == "LateralRaises") ? "LateralRaise" : "Idle";
        sendJsonToPC(dispLabel, best_val, anomaly_score, "Warte auf Bluetooth-Verbindung...");
        cooldownDelay(500);
        return;
    }

    if (best_label == "Idle" || best_label == "idle" || best_val < 0.6) {
        // Ruhemodus -> LED dauerhaft Blau
        digitalWrite(RED_ledPin, HIGH);
        digitalWrite(BLUE_ledPin, LOW); 
        digitalWrite(GREEN_ledPin, HIGH);
        
        sendJsonToPC("idle", best_val, anomaly_score, "Bereit");
        streamInferenceResult("idle", best_val, anomaly_score, "Bereit");
        cooldownUntil = millis() + 1000;
    } 
    else if (best_label == "ShoulderPress" || best_label == "shoulderpress") {
        // Schulterdrücken -> LED Magenta/Lila (Rot + Blau)
        digitalWrite(RED_ledPin, LOW);
        digitalWrite(BLUE_ledPin, LOW); 
        digitalWrite(GREEN_ledPin, HIGH);
        
        sendJsonToPC("ShoulderPress", best_val, anomaly_score, "Schulterdruecken erkannt");
        streamInferenceResult("ShoulderPress", best_val, anomaly_score, "Schulterdruecken erkannt");
        cooldownUntil = millis() + 1500;
    }
    else if (best_label == "lateralraise" || best_label == "LateralRaise" || best_label == "LateralRaises") {
        // Seitheben -> LED Türkis (Blau + Grün)
        digitalWrite(RED_ledPin, HIGH);
        digitalWrite(BLUE_ledPin, LOW); 
        digitalWrite(GREEN_ledPin, LOW);
        
        sendJsonToPC("lateralraise", best_val, anomaly_score, "Seitheben erkannt");
        streamInferenceResult("lateralraise", best_val, anomaly_score, "Seitheben erkannt");
        cooldownUntil = millis() + 1500;
    }
    else if (best_label == "curl" || best_label == "Curl" || best_label == "CURL" || best_label == "curl_sauber") {
        // Sauberer Curl -> LED Grün
        digitalWrite(RED_ledPin, HIGH);
        digitalWrite(BLUE_ledPin, HIGH);
        digitalWrite(GREEN_ledPin, LOW);
        
        sendJsonToPC("curl", best_val, anomaly_score, "Super Ausfuehrung!");
        streamInferenceResult("curl", best_val, anomaly_score, "Super Ausfuehrung!");
        cooldownUntil = millis() + 1500; // Cooldown um Doppel-Erkennung des gleichen Curls zu verhindern
    }
    else {
        // Fallback: Irgendein Fehler oder unbekannte Klasse -> LED Rot
        digitalWrite(RED_ledPin, LOW);
        digitalWrite(BLUE_ledPin, HIGH);
        digitalWrite(GREEN_ledPin, HIGH);
 
        sendJsonToPC(best_label, best_val, anomaly_score, "Bewegung korrigieren");
        streamInferenceResult(best_label, best_val, anomaly_score, "Bewegung korrigieren");
        cooldownUntil = millis() + 1500;
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
