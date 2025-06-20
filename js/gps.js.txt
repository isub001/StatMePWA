let watchID;
let startTime;
let elapsedTime = 0;
let totalDistance = 0;
let topSpeed = 0;
let lastPosition = null;
let timerInterval;

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
}

function updatePosition(position) {
  const { latitude, longitude, speed } = position.coords;

  if (lastPosition) {
    const dist = haversine(
      lastPosition.latitude, lastPosition.longitude,
      latitude, longitude
    );
    totalDistance += dist;
    document.getElementById("distance").textContent = totalDistance.toFixed(2);

    let currentSpeed = speed ? (speed * 3.6) : (dist / (elapsedTime || 1)) * 3.6;
    if (currentSpeed > topSpeed) topSpeed = currentSpeed;
    document.getElementById("topSpeed").textContent = topSpeed.toFixed(2);
  }

  lastPosition = { latitude, longitude };
}

function handleError(error) {
  console.error("GPS error:", error);
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000; // metres
  const toRad = (x) => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
