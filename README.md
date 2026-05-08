# Nitoll Waat - Smart Waste Management System

**Nitoll Waat** (meaning "Clean Path") is an end-to-end IoT-powered waste management solution designed to optimize urban waste collection. By utilizing real-time sensor data from "Smart Bins," the system enables municipal authorities to monitor fill levels, weight, and bin status, facilitating efficient route planning for collection vehicles.

## Overview

The system consists of five primary components:
1.  **Hardware (IoT Nodes)**: Sensor-equipped bins that report real-time status.
2.  **Backend Server**: A centralized hub for data processing, notifications, and real-time communication.
3.  **Admin Web Dashboard**: A comprehensive interface for supervisors to monitor the entire city's waste infrastructure.
4.  **Driver Mobile App**: A dedicated application for collection drivers to receive optimized routes and update collection status.
5.  **Public Portal**: A web interface for citizens to view bin status and file complaints/reports.

---

##  Project Structure

```text
Nitoll_Waat/
├── Backend_Server/     # Node.js Express API & Real-time Server
├── Hardware/           # ESP8266 Firmware (C++)
├── UI_website/         # React Admin Dashboard & Public Portal (Vite + TS)
├── UI_App/             # Native Android Application (Java/Kotlin)
└── current_schema.sql  # PostgreSQL Database Structure
```

---

##  Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (v5.x)
- **Database**: PostgreSQL
- **Real-time**: Socket.io for live bin and vehicle tracking
- **Notifications**: Firebase Cloud Messaging (FCM) & Nodemailer
- **Security**: JWT Authentication, Bcrypt hashing, Helmet.js

### Admin Dashboard & Public Portal (Website)
- **Framework**: React 19 (Vite + TypeScript)
- **Mapping**: Leaflet.js (React-Leaflet) for geospatial bin visualization
- **Analytics**: ApexCharts & Recharts for waste generation trends
- **Icons**: Lucide React
- **State Management**: Context API

### Mobile Application
- **Platform**: Native Android
- **Language**: Java/Kotlin
- **Features**: Real-time route tracking, FCM Push Notifications, Collection confirmation

### Hardware
- **Microcontroller**: ESP8266 (NodeMCU)
- **Sensors**: 
  - **VL53L0X**: Time-of-Flight (ToF) sensor for precise fill-level measurement.
  - **HX711 + Load Cell**: For monitoring the weight of the waste.
  - **Potentiometer**: For detecting lid angle and status (Open/Closed/Jammed).
- **Protocol**: HTTP/REST for data reporting.

---

##  Key Features

- **Real-time Monitoring**: Track bin fill levels, weight, and lid status across different wards and areas via live Socket.io updates.
- **Automated Alerts**: Instant notifications (FCM & Email) when bins are full, blocked, or if the lid is jammed.
- **Route Optimization**: Automated generation of collection routes based on bin status and proximity.
- **Public Complaint System**: Citizens can report overflowing bins or missed collections directly through the portal.
- **Vehicle Management**: Track the status, type (Compactors, Tippers, etc.), and assignment of the collection fleet.
- **Detailed Analytics**: Heatmaps and charts showing waste collection efficiency and area-wise performance.

---

##  Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v15+)
- Arduino IDE (for ESP8266)
- Android Studio (for Mobile App)

### Installation

1.  **Database Setup**:
    ```bash
    psql -U your_user -d your_db -f current_schema.sql
    ```

3.  **Backend Configuration**:
    Create a `.env` file in `Backend_Server/`:
    ```env
    PORT=5000
    DB_USER=your_user
    DB_HOST=localhost
    DB_NAME=nitoll_waat
    DB_PASSWORD=your_password
    DB_PORT=5432
    JWT_SECRET=your_jwt_secret
    FIREBASE_SERVICE_ACCOUNT_PATH=./path/to/firebase-key.json
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_app_password
    ```
    ```bash
    cd Backend_Server
    npm install
    ```

4.  **Seed Data (Optional)**:
    To populate your database with demo drivers, vehicles, and 7 days of reading history:
    ```bash
    # 1. Add required Enum values if missing
    node src/fix_enum.js

    # 2. Seed Drivers, Wards, and Vehicles
    node src/seed_drivers.js

    # 3. Backfill bin reading history
    node src/seed_readings.js
    ```
    You can then login to the Admin Dashboard with:
    - **Email**: `driver@demo.com`
    - **Password**: `password123`

5.  **Run Backend**:
    ```bash
    npm run dev
    ```

6.  **Admin Website**:
    ```bash
    cd ../UI_website
    npm install
    npm run dev
    ```

7.  **Hardware**:
    - Open `Hardware/Esp.txt` in Arduino IDE.
    - Install required libraries: `HX711_ADC`, `Adafruit_VL53L0X`, `ESPAsyncWebServer`, `ESPAsyncTCP`.
    - Update WiFi credentials (`ssid`, `password`) and `serverUrl` in the code.
    - Upload to NodeMCU.

---

##  License

This project is licensed under the ISC License.
