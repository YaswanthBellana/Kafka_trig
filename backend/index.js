import express from "express";
import { Kafka } from "kafkajs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

/* ===============================
   Path Setup (for frontend)
================================ */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ===============================
   Express App
================================ */
const app = express();

/* ===============================
   Kafka Configuration
================================ */
const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || "website-consumer",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"]
});

const consumer = kafka.consumer({
  groupId: "website-consumer-group"
});

/* ===============================
   Kafka State (in-memory)
================================ */
let lastEvent = {
  received: false,
  timestamp: null,
  payload: null
};

/* ===============================
   Start Kafka Consumer
================================ */
async function startKafkaConsumer() {
  try {
    await consumer.connect();
    await consumer.subscribe({
      topic: process.env.KAFKA_TOPIC || "my-topic",
      fromBeginning: false
    });

    console.log("✅ Kafka consumer connected");

    await consumer.run({
      eachMessage: async ({ message }) => {
        lastEvent = {
          received: true,
          timestamp: new Date().toISOString(),
          payload: message.value.toString()
        };

        console.log("📩 Kafka event received:", lastEvent);
      }
    });
  } catch (err) {
    console.error("❌ Kafka error:", err);
  }
}

/* ===============================
   Serve Frontend
================================ */
app.use(express.static(path.join(__dirname, "../frontend")));

/* ===============================
   API Endpoint
================================ */
app.get("/api/status", (req, res) => {
  res.json(lastEvent);
});

/* ===============================
   Server Start
================================ */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  startKafkaConsumer();
});
