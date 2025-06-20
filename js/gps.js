// --- Configuration Constants ---
// The maximum acceptable GPS accuracy error in meters. Readings with a higher error will be ignored.
const ACCURACY_THRESHOLD = 15;
// The minimum speed in km/h to be considered "moving". Helps filter out minor jitters.
const MIN_SPEED_THRESHOLD_KMH = 0.5;
// A cap for realistic top speeds (e.g., 250 km/h is ~155 mph).
const MAX_SPEED_THRESHOLD_KMH = 250;


// --- State Variables ---
let watchID;
let startTime;
let timerInterval;

let elapsedTime = 0;
let totalDistance = 0; // in meters
let topSpeed = 0; // in km/h

let lastPosition = null;
let lastUpdateTime = null;

// Variables for calculating a more stable average speed
let totalSpeedSum = 0;
let speedReadings = 0;

function startTracking() {
  // Reset all state variables
  elapsedTime = 0;
  totalDistance = 0;
  topSpeed = 0;
  lastPosition = null;
  lastUpdateTime = null;
  totalSpeedSum = 0;
  speedReadings = 0;

  // Update UI elements to their initial state
  document.getElementById("time").textContent = "0";
  document.getElementById("distance").textContent = "0.00";
  document.getElementById("currentSpeed").textContent = "0.00";
  document.getElementById("topSpeed").textContent = "0.00";
  document.getElementById("avgSpeed").textContent = "0.00";


  startTime = Date.now();
  timerInterval = setInterval(updateTime, 1000);

  if (navigator.geolocation) {
    watchID = navigator.geolocation.watchPosition(updatePosition, handleError, {
      enableHighAccuracy: true, // Request the most accurate location data
      maximumAge: 0,          // Don't use a cached position
      timeout: 10000          // Time to wait for a response
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
  watchID = null; // Clear the watch ID
}

function updateTime() {
  elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  document.getElementById("time").textContent = elapsedTime;

  // Live average speed calculation
  const avgSpeed = speedReadings > 0 ? (totalSpeedSum / speedReadings).toFixed(2) : "0.00";
  document.getElementById("avgSpeed").textContent = avgSpeed;
}

function updatePosition(position) {
  const { latitude, longitude, speed, accuracy } = position.coords;
  const currentTime = Date.now();

  // --- 1. Filter out inaccurate readings ---
  // If the accuracy is worse (larger) than our threshold, ignore this update.
  if (accuracy > ACCURACY_THRESHOLD) {
    console.warn(`GPS reading ignored due to low accuracy: ${accuracy.toFixed(2)}m`);
    return;
  }

  let currentSpeed = 0; // in km/h

  // --- 2. Prefer using the device's native speed calculation ---
  // The 'speed' property is in meters/second. Check if it's valid.
  if (speed !== null && speed >= 0) {
    currentSpeed = speed * 3.6; // Convert m/s to km/h
  }
  // --- 3. Fallback to manual calculation if native speed is not available ---
  else if (lastPosition) {
    const timeDiffSec = (currentTime - lastUpdateTime) / 1000;
    
    // Only calculate if a meaningful amount of time has passed
    if (timeDiffSec > 1) { 
        const dist = haversine(
            lastPosition.latitude, lastPosition.longitude,
            latitude, longitude
        );

        // Calculate speed only if a meaningful distance was covered
        if (dist > 0) {
            currentSpeed = (dist / timeDiffSec) * 3.6; // m/s to km/h
        }
    }
  }

  // --- 4. Process the calculated speed and distance ---
  // Apply speed thresholds to filter out jitter and absurd values
  if (currentSpeed >= MIN_SPEED_THRESHOLD_KMH && currentSpeed <= MAX_SPEED_THRESHOLD_KMH) {
    
    // Update current speed on screen
    document.getElementById("currentSpeed").textContent = currentSpeed.toFixed(2);

    // Update total distance (only when moving)
    if (lastPosition) {
      const timeDiffSec = (currentTime - lastUpdateTime) / 1000;
      // Distance covered in this interval = speed (m/s) * time (s)
      const distanceIncrement = (currentSpeed / 3.6) * timeDiffSec;
      totalDistance += distanceIncrement;
      document.getElementById("distance").textContent = (totalDistance / 1000).toFixed(2); // Display in km
    }

    // Update Top Speed
    if (currentSpeed > topSpeed) {
      topSpeed = currentSpeed;
      document.getElementById("topSpeed").textContent = topSpeed.toFixed(2);
    }

    // Update values for Average Speed
    totalSpeedSum += currentSpeed;
    speedReadings++;
  } else {
    // If speed is below threshold, we're likely stationary
    document.getElementById("currentSpeed").textContent = "0.00";
  }

  // --- 5. Always update the last known position and time for the next calculation ---
  lastPosition = { latitude, longitude };
  lastUpdateTime = currentTime;
}


function handleError(error) {
  console.error(`GPS Error: ${error.message} (Code: ${error.code})`);
}

/**
 * Calculates the distance between two lat/lon points in meters using the Haversine formula.
 */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const toRad = (x) => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}