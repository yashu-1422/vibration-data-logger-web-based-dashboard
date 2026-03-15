

# Vibration Data Logging & Monitoring System

An end-to-end IoT solution for real-time machine condition monitoring. This system integrates a Python-based sensor layer, a Spring Boot REST API, and a dynamic web dashboard featuring glassmorphism design and live data visualization.

## 🚀 Features

* **Hybrid Sensor Integration**: Python script supports `mock` mode for testing or `serial` mode for Arduino/ESP32 hardware.
* **Spring Boot Backend**: Robust Java API for data ingestion, historical logging, and system settings management.
* **Live Visualization**: Real-time X/Y/Z axis and overall magnitude charts powered by `Chart.js`.
* **Dynamic Alerting**: User-definable "Warning" and "Critical" thresholds updated on-the-fly without server restarts.
* **Targeted Reporting**: Export filtered data ranges to **Excel (.xlsx)** or **PDF** directly from the UI.
* **Customizable UI**: Toggle between a high-end "Glassmorphism" Dark Mode and a functional Light Mode.

---

## 🛠️ Technical Architecture

The system calculates the overall vibration magnitude ($V$) using the Euclidean norm of the three orthogonal axes:

$$V = \sqrt{A_x^2 + A_y^2 + A_z^2}$$

* **Backend**: Java 17, Spring Boot, Spring Data JPA, Maven.
* **Frontend**: HTML5, CSS3 (Glassmorphism), JavaScript (ES6+), Chart.js.
* **Database**: MySQL 8.0+.
* **Data Source**: Python 3.x (PySerial for hardware interfacing).

---

## ⚙️ Setup Instructions

### 1. Database Configuration

1. Log into your MySQL instance:
```sql
CREATE DATABASE vibration_db;

```


2. *(Optional)* Update `src/main/resources/application.properties` if you use a custom MySQL username or password.

### 2. Launch the Backend

1. Navigate to the project root:
```bash
mvn clean spring-boot:run

```


*The server will start on port `8081`.*

### 3. Initialize the Python Client

1. Open a new terminal and enter the client directory:
```bash
cd python_client
pip install -r requirements.txt

```


2. **Run in Mock Mode** (Simulated data):
```bash
python sensor_reader.py --mode mock

```


3. **Run in Serial Mode** (Hardware):
```bash
python sensor_reader.py --mode serial --port COM3

```



### 4. Access the Dashboard

Open your browser and visit: `http://localhost:8081`

---

## 📊 Usage & System Controls

### Threshold Management

Under the **Settings** tab, you can define the safety bounds for your machinery. These values are processed by the `SettingsService` to categorize incoming data:

* **Nominal**: $V < \text{Warning Threshold}$
* **Warning**: $\text{Warning} \le V < \text{Critical}$
* **Critical**: $V \ge \text{Critical Threshold}$

### Data Polling

The dashboard allows you to adjust the **Auto-Refresh Rate**.

* **High Performance**: 1-second intervals for critical testing.
* **Low Bandwidth**: 10-second intervals for long-term monitoring.

### Exporting Reports

Use the **Export** buttons on the main dashboard. A date-time picker will appear, allowing you to generate reports for specific shifts or incident timeframes, preventing bloated file downloads.

---
### preview
<div align="center">
  <h3>1. Real-Time Dashboard</h3>
  <img src="https://github.com/user-attachments/assets/c3a123be-b9e0-4a69-a85d-37e22d5272f1" alt="Smart Data Export" width="900">
  <br><br>

  <h3>2. Historical Data Logs</h3>
  <img src="https://github.com/user-attachments/assets/04777e16-880b-4cfe-bee8-676b9f4107fa" alt="System Settings" width="900">
  <br><br>

  <h3>3. Data Export & Reporting</h3>
  <img src="https://github.com/user-attachments/assets/befe8f82-e91e-43fb-8604-66062b1bc3e4" alt="History Logs" width="900">
  <br><br>

  <h3> 4. Dynamic System Settings</h3>
  <img src="https://github.com/user-attachments/assets/94d239f9-73ce-4044-b8eb-9d62efb7f820" alt="Monitoring Dashboard" width="900">
</div>
---
---
## 📂 Project Structure

* `src/main/java/.../model/` - JPA entities for vibration and settings.
* `src/main/java/.../service/` - Calculation logic and threshold processing.
* `src/main/resources/static/` - Frontend assets (CSS themes, Chart logic).
* `python_client/` - `sensor_reader.py` and hardware drivers.

---

