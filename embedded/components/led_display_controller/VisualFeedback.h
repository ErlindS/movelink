#ifndef VISUAL_FEEDBACK_H
#define VISUAL_FEEDBACK_H

#include <Arduino.h>

// @implements FA2.4
void initFeedback();

// @implements FA2.4
void updateFeedback(const String& best_label, float best_val, float anomaly_score);

// @implements FA2.4
bool isFeedbackInCooldown();

// @implements FA2.4
void sendJsonToPC(String label, float confidence, float anomaly, String tipp);

#endif // VISUAL_FEEDBACK_H
