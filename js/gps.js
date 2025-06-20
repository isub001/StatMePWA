let watchID;
let startTime;
let elapsedTime = 0;
let totalDistance = 0;
let topSpeed = 0;
let lastPosition = null;
let lastUpdateTime = null;
let timerInterval;
let totalSpeedSum = 0;
let speedReadings = 0;

function startTracking() {
  startTime = Date.now();
  timerInterval = setInterval(updateTime, 1000);

  if (navigator.geolocation) {
    watchID = navigator.geolocation.watchPosition(updatePosition, handleError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    });
  } else {
    alert("Geolocation not supported");
  }
}

function stopTracking() {
  clearInterval(timerInterval);
  navigator.geolocation.clearWatch(watchID);
}

function updateTime() {
  elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  document.getElementById("time").textContent = elapsedTime;

  // Average speed live
  let avgSpeed = speedReadings > 0 ? (totalSpeedSum / speedReadings).toFixed(2) : 0;
  document.getElementById("avgSpeed").textContent = avgSpeed;
}

function updatePosition(position) {
  const { latitude, longitude } = position.coords;
  const currentTime = Date.now();

  if (lastPosition) {
    const dist = haversine(
      lastPosition.latitude, lastPosition.longitude,
      latitude, longitude
    );

    const timeDiffSec = (currentTime - lastUpdateTime) / 1000;

    // Only process if at least 1.5s passed and dist > 3m (clean filter)
    if (timeDiffSec >= 1.5 && dist >= 3) {
      totalDistance += dist;
      document.getElementById("distance").textContent = totalDistance.toFixed(2);

      const currentSpeed = (dist / timeDiffSec) * 3.6; // m/s to km/h

      if (currentSpeed >= 0.5 && currentSpeed <= 250) {
        document.getElementById("currentSpeed").textContent = currentSpeed.toFixed(2);

        if (currentSpeed > topSpeed) {
          topSpeed = currentSpeed;
          document.getElementById("topSpeed").textContent = topSpeed.toFixed(2);
        }

        totalSpeedSum += currentSpeed;
        speedReadings++;
      }
    }
  }

  lastPosition = { latitude, longitude };
  lastUpdateTime = currentTime;
}

function handleError(error) {
  console.error("GPS error:", error);
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
