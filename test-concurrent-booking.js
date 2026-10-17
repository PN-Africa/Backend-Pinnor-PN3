
const slotId = "d8ea333e-11bc-4996-a10b-0a10ec937b8a";
const url = "http://127.0.0.1:5000/api/appointments";

const createRequest = (name, email, phone) =>
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      slotId,
      patientName: name,
      patientEmail: email,
      patientPhone: phone,
      patientMessage: "Concurrent booking test"
    })
  }).then(async (response) => ({
    status: response.status,
    body: await response.json()
  }));

const results = await Promise.all([
  createRequest(
    "Concurrent Patient A",
    "concurrent-a@example.com",
    "08011111111"
  ),
  createRequest(
    "Concurrent Patient B",
    "concurrent-b@example.com",
    "08022222222"
  )
]);

console.log(JSON.stringify(results, null, 2));