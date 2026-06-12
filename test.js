const fetch = require("node-fetch");

fetch("http://localhost:3000/webhook", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: 12345 })
})
  .then(res => res.text())
  .then(console.log)
  .catch(console.error);