<h1>Phone Based Sleep Tracking</h1>
**Project Demo Link**:
## Overview
**Phone Based Sleep Tracking** is a simple prototype for basic sleep anaylsis feature built with Quasar (Vue) frontend and Node.js backend. The app will record physical movement of the phone, especially acceleration along the X, Y, and Z axes typically in m/s^2. The app will display the sleep duration, sleep quality, and sleep efficiency based on the input metrics.</p>

<h3>Setup</h3>
<p>1. Clone this repository: </p>
<p>2. Open the project through your Visual Studio Code</p>
<p>3. </p>

## Features
- **Sleep duration**: The duration of sleep based on their low activity period.
- **Sleep efficiency**: The percentage of low activity compared to time in bed.
- **Sleep quality**: Quality of sleep based on total high activity

## Setup
### Prerequisites
- Quesar (Vue.js)
- Node.js
- Express

##
The project also uses the following libraries:
- `axios` - for making HTTP requests

## 🔄 Clone the Repository

```bash
git clone https://github.com/skzkesh/phone-based-sleep-tracking.git
```

## Frontend Setup (Quesar)
1. Navigate to the this directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the Expo server:

```bash
npm start
# or
yarn start
```

## 🔧 Backend Setup (Node.js + Express)
Open to a new terminal and navigate to PostSchedule again

1. Install dependencies:

```bash
npm install
```

2. Start the backend server:

```bash
node server.js
```

## 🔗 Connect Frontend to Backend
1. Update the API base URL:

Create a config.js file in the current directory and add your local IP.

```bash
const BASE_URL = 'http://YOUR_LOCAL_IP:5000'; // e.g., http://192.168.0.10:5000
export default BASE_URL;
```

## 🧪 Test the App
Open the app on a physical device or emulator and ensure both devices are on the same Wi-Fi
