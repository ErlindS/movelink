/* 
 * @implements FA2.1, FA2.2, FA2.3, FA2.4, FA2.5, NF1
 * Includes ---------------------------------------------------------------- */
#include <Erlind-project-1_inferencing.h> // For model parameters/defines
#include "IMUReader.h"
#include "VisualFeedback.h"
#include "BLEStreamer.h"

bool runModelInference(float* buffer, String& outLabel, float& outConfidence, float& outAnomaly);

static float dsp_buffer[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE] = { 0 };

void setup()
{
    Serial.begin(115200);
    initFeedback();
    
    // Warte kurz, damit der Serielle Monitor bereit ist
    delay(1000);

    if (!initIMU()) {
        Serial.println("Failed to initialize IMU!");
    } else {
        Serial.println("IMU initialized");
    }

    if (!initBLE()) {
        Serial.println("Failed to initialize BLE!");
    } else {
        Serial.println("BLE initialized");
    }

    // SICHERHEITSCHECK: Prüfen ob das Modell wirklich für 6 Achsen trainiert wurde
    if (EI_CLASSIFIER_RAW_SAMPLES_PER_FRAME != 6) {
        Serial.print("ERR: EI_CLASSIFIER_RAW_SAMPLES_PER_FRAME sollte 6 sein (Accel + Gyro)!\n");
        return;
    }
}

void loop()
{
    // Da wir 6 Achsen haben, springen wir in 6er-Schritten durch den DSP Puffer
    size_t sample_count = EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE / 6;
    size_t send_interval = (sample_count > 20) ? (sample_count / 5) : 2;

    for (size_t ix = 0; ix < EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE; ix += 6) {
        uint64_t next_tick = micros() + (EI_CLASSIFIER_INTERVAL_MS * 1000);

        readSensorData(dsp_buffer, ix);

        // Jedes N-te Sample per BLE senden (~10 pro Zyklus für glatte Kurven)
        size_t sample_idx = ix / 6;
        if (sample_idx % send_interval == 0 || ix + 6 >= EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE) {
            streamIMUData(dsp_buffer[ix], dsp_buffer[ix + 1], dsp_buffer[ix + 2],
                          dsp_buffer[ix + 3], dsp_buffer[ix + 4], dsp_buffer[ix + 5]);
        }

        if (next_tick > micros()) {
            delayMicroseconds(next_tick - micros());
        }
    }

    // BLE-Polling vor Inferenz, damit Verbindungsaufbau nicht abbricht
    pollBLE();

    // Klassifikator nur ausführen, wenn wir nicht im Cooldown sind
    if (!isFeedbackInCooldown()) {
        String label;
        float confidence = 0.0;
        float anomaly = 0.0;
        
        if (runModelInference(dsp_buffer, label, confidence, anomaly)) {
            // BLE-Polling nach Inferenz (die ~200-500ms gedauert hat)
            pollBLE();
            // Display-Aktualisierung & LED Logik
            updateFeedback(label, confidence, anomaly);
        } else {
            pollBLE();
        }
    } else {
        pollBLE();
    }
}

bool runModelInference(float* buffer, String& outLabel, float& outConfidence, float& outAnomaly) {
    // Signal aus Puffer erstellen
    signal_t signal;
    int err = numpy::signal_from_buffer(buffer, EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE, &signal);
    if (err != 0) {
        return false;
    }

    // Klassifikator ausführen
    ei_impulse_result_t result = { 0 };
    bool debug_nn = false;
    err = run_classifier(&signal, &result, debug_nn);
    if (err != EI_IMPULSE_OK) {
        return false;
    }

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
#if defined(EI_CLASSIFIER_HAS_ANOMALY) && (EI_CLASSIFIER_HAS_ANOMALY > 0)
    anomaly_score = result.anomaly;
#endif

    Serial.print("Label: ");
    Serial.print(result.classification[best_idx].label);
    Serial.print(" | Conf: ");
    Serial.print(best_val, 3);
    Serial.print(" | Anomaly: ");
    Serial.println(anomaly_score, 3);

    outLabel = String(result.classification[best_idx].label);
    outConfidence = best_val;
    outAnomaly = anomaly_score;

    return true;
}