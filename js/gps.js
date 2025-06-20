// --- Configuration Constants ---
const ACCURACY_THRESHOLD = 15; // meters
const MIN_SPEED_THRESHOLD_KMH = 0.5;
const MAX_SPEED_THRESHOLD_KMH = 250;
const DISTANCE_INCREMENT_THRESHOLD_M = 2.5; // lowered for small steps + room moves

// --- State Variables ---
let watchID;
let startTime;
let timerInterval;

let elapsedTime = 0;
let totalDistance = 0; // in meters
let topSpeed = 0;

let lastPosition = null;
let lastUpdateTime = null;

let totalSpeedSum = 0;
let speedReadings = 0;

function startTracking() {
  elapsedTime = 0;
  totalDistance = 0;
  topSpeed = 0;
  lastPosition = null;
  lastUpdateTime = null;
  totalSpeedSum = 0;
  speedReadings = 0;

  document.getElementById("time").textContent = "0";
  document.getElementById("distance").textContent = "0.00";
  document.getElementById("currentSpeed").textContent = "0.00";
  document.getElementById("topSpeed").textContent = "0.00";
  document.getElementById("avgSpeed").textContent = "0.00";

  startTime = Date.now();
  timerInterval = setInterval(updateTime, 1000);

  if (navigator.geolocation) {
    watchID = navigator.geolocation.watchPosition(updatePosition, handleError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000
    });
  } else {
    alert("Geolocation is not supported by your browser.");
  }
}

function stopTracking() {
  clearInterval(timerInterval);
  if (watchID) {
    navigator.geolocation.clearWatch(watchID);
  }
  watchID = null;
}

function updateTime() {
  elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  document.getElementById("time").textContent = elapsedTime;

  const avgSpeed = speedReadings > 0 ? (totalSpeedSum / speedReadings).toFixed(2) : "0.00";
  document.getElementById("avgSpeed").textContent = avgSpeed;
}

function updatePosition(position) {
  const { latitude, longitude, speed, accuracy } = position.coords;
  const currentTime = Date.now();

  if (accuracy > ACCURACY_THRESHOLD) {
    console.warn(`GPS reading ignored due to low accuracy: ${accuracy.toFixed(2)}m`);
    return;
  }

  let currentSpeed = 0;

  if (speed !== null && speed >= 0) {
    currentSpeed = speed * 3.6;
  } else if (lastPosition) {
    const timeDiffSec = (currentTime - lastUpdateTime) / 1000;
    if (timeDiffSec > 0) {
      const dist = haversine(
        lastPosition.latitude, lastPosition.longitude,
        latitude, longitude
      );
      currentSpeed = (dist / timeDiffSec) * 3.6;
    }
  }

  if (currentSpeed >= MIN_SPEED_THRESHOLD_KMH && currentSpeed <= MAX_SPEED_THRESHOLD_KMH) {
    document.getElementById("currentSpeed").textContent = currentSpeed.toFixed(2);

    if (lastPosition) {
      const distanceIncrement = haversine(
        lastPosition.latitude, lastPosition.longitude,
        latitude, longitude
      );

      // Ignore small GPS jitter — only accept movement above threshold
      if (distanceIncrement >= DISTANCE_INCREMENT_THRESHOLD_M) {
        totalDistance += distanceIncrement;
        document.getElementById("distance").textContent = totalDistance.toFixed(2); // Meters, not KM
      }
    }

    if (currentSpeed > topSpeed) {
      topSpeed = currentSpeed;
      document.getElementById("topSpeed").textContent = topSpeed.toFixed(2);
    }

    totalSpeedSum += currentSpeed;
    speedReadings++;
  } else {
    document.getElementById("currentSpeed").textContent = "0.00";
  }

  lastPosition = { latitude, longitude };
  lastUpdateTime = currentTime;
}

function handleError(error) {
  console.error(`GPS Error: ${error.message} (Code: ${error.code})`);
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (x) => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}







