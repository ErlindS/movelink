#!/bin/bash
# BLE Connection Test for MoveLink Sensor
DEVICE="E4:BB:A0:8D:EF:07"

bluetoothctl <<EOF
power on
scan on
EOF

echo ">>> Scanning for 8 seconds..."
sleep 8

bluetoothctl <<EOF
scan off
connect $DEVICE
EOF

echo ">>> Waiting 10 seconds for connection..."
sleep 10

bluetoothctl <<EOF
info $DEVICE
disconnect $DEVICE
exit
EOF
