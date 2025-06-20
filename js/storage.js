function saveSession() {
  let sessions = JSON.parse(localStorage.getItem("sessions")) || [];

  const newSession = {
    date: new Date().toISOString(),
    duration: elapsedTime,
    distance: totalDistance.toFixed(2),
    topSpeed: topSpeed.toFixed(2)
  };

  sessions.push(newSession);
  localStorage.setItem("sessions", JSON.stringify(sessions));

  alert("Session saved!");

  // Reset for next session
  elapsedTime = 0;
  totalDistance = 0;
  topSpeed = 0;
  lastPosition = null;
  document.getElementById("time").textContent = "0";
  document.getElementById("distance").textContent = "0";
  document.getElementById("topSpeed").textContent = "0";
}
