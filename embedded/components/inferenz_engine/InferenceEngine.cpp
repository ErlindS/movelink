// C4-Ebene: Code
#include "InferenceEngine.h"
#include <Erlind-project-1_inferencing.h>

// @implements FA2.2, FA2.3
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

    // Anomalie-Score abgreifen
    float anomaly_score = result.anomaly;

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
