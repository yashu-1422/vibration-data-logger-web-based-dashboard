# Vibration Data Logging System with Web Dashboard

This project is a complete end-to-end vibration data logging system designed for machine condition monitoring. It features a Python script to simulate or read sensor data, a Spring Boot Java backend to process and store the data, and a real-time responsive web dashboard to visualize the machine condition.

## Features
- **Real-Time Python Sensor Reader**: Can run in `mock` mode to simulate data or `serial` mode to read from an Arduino/ESP via a COM port.
- **Spring Boot Backend**: RESTful API to ingest data and serve historical logs.
- **MySQL Database**: Persistent storage for historical vibration readings.
- **Dynamic Web Dashboard**:
  - Live charts using `Chart.js` for overall magnitude and individual X/Y/Z axes.
  - **Dynamic Alert Thresholds**: Customize what constitutes a Warning or Critical machine state in real-time.
  - **Date-Range Exports**: Download targeted history logs as Excel (`.xlsx`) or PDF reports by selecting specific start and end dates.
  - **Customizable Experience**: Toggle between a premium dark-mode glassmorphism theme and a clean light mode.
  - **Adjustable Polling Rate**: Control how often the dashboard pulls live data (from 1 second to 10 seconds).

## Prerequisites
- Java 17 or higher
- Maven (`mvn` available in the PATH)
- Python 3.x
- MySQL Server running locally

## Setup Instructions

### 1. Database Setup
1. Open your MySQL client and create the database:
   ```sql
   CREATE DATABASE vibration_db;
   ```
2. The Spring Boot application is configured to connect to `localhost:3306` with the username `root` and an empty password. If yours differ, update `src/main/resources/application.properties`.

### 2. Run the Spring Boot Backend
1. Open a terminal in the project root directory.
2. Build and run the server using Maven:
   ```bash
   mvn spring-boot:run
   ```
   *(Note: The server runs on port `8081` to avoid common conflicts).*

### 3. Run the Python Sensor Script
1. Open a separate terminal and navigate to the `python_client` folder:
   ```bash
   cd python_client
   ```
2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the script in **mock mode** to generate simulated data:
   ```bash
   python sensor_reader.py --mode mock
   ```
   *(To use real hardware, connect your Arduino and run: `python sensor_reader.py --mode serial --port COM3`)*

### 4. View the Dashboard
1. Open your web browser.
2. Navigate to [http://localhost:8081](http://localhost:8081).
3. You will see the real-time dashboard updating as the Python script sends data.

## Usage Details & New Features

Once the application is running, you can access the powerful built-in functionalities:

### ⚙️ System Settings
Navigate to the **Settings** tab in the sidebar:
- **Appearance Theme**: Switch the dashboard between "Dark Mode (Glassmorphism)" and "Light Mode (Clean)".
- **Auto-Refresh Rate**: Throttle the API calls from `1 Second (Live)` up to `10 Seconds (Very Slow)` depending on your network and monitoring needs.
- **Alert Thresholds**: Adjust the default bounds!
  - **Warning Threshold (g)**: Magnitudes exceeding this value will trigger a warning.
  - **Critical Threshold (g)**: Magnitudes exceeding this value signify critical danger to the monitored machine.
  - Note: These thresholds update dynamically in the Spring Boot backend (`SettingsService`) without requiring a server reboot.

### 📊 Data Export (Excel & PDF)
Instead of downloading bulk data indiscriminately, you can extract exact events:
1. Click **Export Excel** or **Export PDF** on the Dashboard header.
2. A modal will prompt you to select a `Start Date & Time` and an `End Date & Time`.
3. Click **Download**. The backend (`/api/vibration/range`) fetches only the requested time window and the frontend immediately generates the `.xlsx` or `.pdf` file.

## Project Structure
- `/src/main/java/.../model/`: JPA Entity defining the database schema.
- `/src/main/java/.../repository/`: Spring Data JPA interface.
- `/src/main/java/.../service/`: Business logic for calculating magnitude ($V = \sqrt{Ax^2 + Ay^2 + Az^2}$) and setting status. Includes the new `SettingsService` for memory management.
- `/src/main/java/.../controller/`: REST API endpoints (`/api/vibration` and `/api/settings`).
- `/src/main/resources/static/`: Frontend files (HTML, CSS, JS).
- `/python_client/`: Python scripts for sensor integration.
