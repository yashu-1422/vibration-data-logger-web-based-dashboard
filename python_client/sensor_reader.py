import argparse
import time
import random
import requests
import serial
import json

API_URL = "http://localhost:8081/api/vibration"

def send_data(ax, ay, az):
    payload = {
        "ax": ax,
        "ay": ay,
        "az": az
    }
    try:
        response = requests.post(API_URL, json=payload)
        if response.status_code == 200:
            print(f"Successfully sent data: {payload}")
        else:
            print(f"Failed to send data: {response.status_code} - {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to backend API: {e}")

def run_mock_mode():
    print("Starting in MOCK mode. Generating random vibration values...")
    while True:
        # Generate some baseline noise (normal)
        ax = random.uniform(-0.5, 0.5)
        ay = random.uniform(-0.5, 0.5)
        az = random.uniform(0.5, 1.2) # Gravity + some noise

        # Occasionally spike the values to simulate Warning or Critical
        spike_chance = random.random()
        if spike_chance > 0.95:
            print("--- CRITICAL SPIKE SIMULATED ---")
            ax = random.uniform(1.5, 3.0)
            ay = random.uniform(1.5, 3.0)
        elif spike_chance > 0.85:
            print("--- WARNING SPIKE SIMULATED ---")
            ax = random.uniform(1.0, 1.5)
            ay = random.uniform(1.0, 1.5)

        send_data(round(ax, 3), round(ay, 3), round(az, 3))
        time.sleep(1) # Send data every 1 second

def run_serial_mode(port, baudrate):
    print(f"Starting in SERIAL mode. Connecting to {port} at {baudrate} baud...")
    try:
        ser = serial.Serial(port, baudrate, timeout=1)
        time.sleep(2) # Wait for serial connection to establish
        print("Connected.")
        while True:
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8').strip()
                try:
                    # Expected format: "ax,ay,az" (comma-separated values)
                    # e.g., "0.02,0.01,0.98"
                    parts = line.split(',')
                    if len(parts) == 3:
                        ax = float(parts[0])
                        ay = float(parts[1])
                        az = float(parts[2])
                        send_data(ax, ay, az)
                    else:
                        print(f"Ignored malformed line from serial: {line}")
                except Exception as e:
                    print(f"Error parsing serial data: {line} - Error: {e}")
    except serial.SerialException as e:
        print(f"Serial port error: {e}")
    except KeyboardInterrupt:
        print("Stopping serial reader...")
    finally:
        if 'ser' in locals() and ser.is_open:
            ser.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Vibration Sensor Data Reader")
    parser.add_argument("--mode", type=str, choices=["mock", "serial"], default="mock", help="Run mode: 'mock' for randomized data or 'serial' to read from Arduino/ESP")
    parser.add_argument("--port", type=str, default="COM3", help="Serial port (e.g., COM3 or /dev/ttyUSB0) - used in serial mode")
    parser.add_argument("--baudrate", type=int, default=115200, help="Baud rate for serial connection")

    args = parser.parse_args()

    if args.mode == "mock":
        run_mock_mode()
    elif args.mode == "serial":
        run_serial_mode(args.port, args.baudrate)
