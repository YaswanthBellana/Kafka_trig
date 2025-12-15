async function fetchStatus() {
  try {
    const res = await fetch("/api/status");
    const data = await res.json();

    const statusEl = document.getElementById("status");
    const payloadEl = document.getElementById("payload");

    if (data.received) {
      statusEl.innerText = `✅ Event received at ${data.timestamp}`;
      payloadEl.innerText = data.payload;
    } else {
      statusEl.innerText = "❌ No event received yet";
      payloadEl.innerText = "";
    }
  } catch (err) {
    console.error(err);
  }
}

setInterval(fetchStatus, 3000);
fetchStatus();
