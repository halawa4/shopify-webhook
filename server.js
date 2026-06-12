const express = require("express");

const app = express();
app.use(express.json());

// ENV VARIABLES (from Render, NOT GitHub)
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// Normalize Egyptian phone numbers
function formatPhone(phone) {
  if (!phone) return null;

  // remove spaces and +
  phone = phone.replace(/\s+/g, "").replace("+", "");

  // convert 0xxxxxxxxx → 20xxxxxxxxx
  if (phone.startsWith("0")) {
    phone = "20" + phone.slice(1);
  }

  return phone;
}

// WhatsApp sender
async function sendWhatsApp(phone, message) {
  if (!phone) return;

  await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: { body: message }
    })
  });
}

// Health check
app.get("/", (req, res) => {
  res.send("OK");
});

// Shopify webhook
app.post("/webhook", async (req, res) => {
  try {
    const order = req.body;

    const name = order.shipping_address?.first_name || "Customer";
    const rawPhone = order.shipping_address?.phone;
    const phone = formatPhone(rawPhone);

    const items = (order.line_items || [])
      .map(i => i.title)
      .join(", ");

    const total = order.total_price || "N/A";

    const message =
`Hello ${name}
Your order is confirmed.

Items: ${items}
Total: ${total}

Thank you for your order.`;

    console.log("NEW ORDER RECEIVED");
    console.log({ name, phone, items, total });

    await sendWhatsApp(phone, message);

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});