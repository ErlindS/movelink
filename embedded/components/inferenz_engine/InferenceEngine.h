#ifndef INFERENCE_ENGINE_H
#define INFERENCE_ENGINE_H

#include <Arduino.h>

// @implements FA5, FA9
bool runModelInference(float* buffer, String& outLabel, float& outConfidence, float& outAnomaly);

#endif // INFERENCE_ENGINE_H
