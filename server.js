const express = require("express");

const app = express();

app.use(express.json());

app.post("/webhook", (req, res) => {
  console.log("RECEIVED:", req.body);

  res.status(200).send("OK");
});

app.get("/", (req, res) => {
  res.send("alive");
});

app.listen(3000, () => console.log("running 3000"));