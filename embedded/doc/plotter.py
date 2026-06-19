import serial
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from collections import deque

# --- CONFIGURATION ---
# Change this to the port your Arduino is connected to!
SERIAL_PORT = 'COM5' 
BAUD_RATE = 9600
MAX_SAMPLES = 120 # Matches your Arduino's numSamples

# Initialize data arrays to hold the live data
aY_data = deque(maxlen=MAX_SAMPLES)
gZ_data = deque(maxlen=MAX_SAMPLES)

# Connect to the Arduino
try:
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    print(f"Connected to {SERIAL_PORT}. Waiting for movement...")
except Exception as e:
    print(f"Error opening serial port: {e}")
    print("Make sure the Arduino IDE Serial Monitor/Plotter is CLOSED.")
    exit()

# Set up the live graphing window
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 6))
fig.canvas.manager.set_window_title('Live Bicep Curl Tracker')

def update(frame):
    # Read all available lines from the Arduino
    while ser.in_waiting:
        try:
            # Read raw bytes first to catch baud rate gibberish
            raw_line = ser.readline()
            line = raw_line.decode('utf-8').strip()
            
            # --- UNCOMMENT THE LINE BELOW TO SEE EXACTLY WHAT IS COMING IN ---
            # print(f"Raw data: {line}") 
            
            # Skip empty lines or the text header your Arduino prints
            if not line or "aX" in line or "error" in line:
                continue
            
            vals = line.split(',')
            
            # If we received a full row of 6 data points
            if len(vals) == 6:
                # Based on your Arduino print order: vals[1] is aY, vals[5] is gZ
                aY_data.append(float(vals[1]))
                gZ_data.append(float(vals[5]))
            else:
                # Let's see if the data is split incorrectly
                print(f"Warning: Expected 6 values, but got {len(vals)}. Data: '{line}'")
                
        except UnicodeDecodeError:
            print(f"Decode error! This usually means the Baud Rate is wrong. Raw bytes: {raw_line}")
        except ValueError:
            print(f"Value error (likely trying to convert a letter to a float). Data: '{line}'")
    
    # Redraw Accelerometer plot (Looking for the 7G jerk)
    ax1.clear()
    ax1.plot(aY_data, label='Accel Y (G) - Watch for jerks', color='blue', linewidth=2)
    ax1.axhline(1.15, color='red', linestyle='--', label='Start Threshold') # The threshold we discussed!
    ax1.set_ylabel('Force (G)')
    ax1.set_ylim(-3, 8) # Scaled to catch that 7G spike
    ax1.legend(loc='upper right')
    ax1.set_title('Live Sensor Data')

    # Redraw Gyroscope plot (Looking for the wrist twist)
    ax2.clear()
    ax2.plot(gZ_data, label='Gyro Z (dps) - Watch for wrist twist', color='orange', linewidth=2)
    ax2.set_ylabel('Rotation (dps)')
    ax2.set_ylim(-800, 200) # Scaled to catch your 600 dps twists
    ax2.legend(loc='upper right')

# Run the animation loop
ani = FuncAnimation(fig, update, interval=50, cache_frame_data=False)

plt.tight_layout()
plt.show()

# Clean up when the window is closed
ser.close()