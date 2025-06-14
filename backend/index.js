const express = require("express");
const axios = require("axios");
const { Pool } = require("pg");
const cron = require("node-cron");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});
const cors = require("cors");
app.use(cors({
  origin: ['http://localhost:3001', 'http://34.27.53.239'], // Frontend URL'leri
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// JSON middleware ekle
app.use(express.json());

// Basit endpoint
app.get("/fetch-weather", async (req, res) => {
  try {
    await fetchWeather();
    res.status(200).json({
      success: true,
      message: "Hava durumu başarıyla alındı ve veritabanına kaydedildi."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Bir hata oluştu.",
      error: error.message
    });
  }
});

// Son kayıtları getir
app.get("/weather-logs", async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const result = await pool.query(
      "SELECT * FROM weather_logs ORDER BY created_at DESC LIMIT $1",
      [limit]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Veriler alınamadı.",
      error: error.message
    });
  }
});

// Ana sayfa
app.get("/", (req, res) => {
  res.json({
    message: "Weather API çalışıyor!",
    endpoints: {
      "/fetch-weather": "Hava durumunu manuel al",
      "/weather-logs": "Son kayıtları görüntüle (?limit=N)",
      "/weather-logs?limit=5": "Son 5 kaydı görüntüle"
    },
    info: "Hava durumu her 5 dakikada bir otomatik güncelleniyor."
  });
});

// Hava durumu verisini çek
async function fetchWeather() {
  const apiKey = process.env.WEATHER_API_KEY;
  const city = "Ankara";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await axios.get(url);
    const { temp, humidity, pressure } = response.data.main;
    const description = response.data.weather[0].description;
    const windSpeed = response.data.wind?.speed || 0;

    await pool.query(
      "INSERT INTO weather_logs (temperature, description, humidity, pressure, wind_speed, created_at) VALUES ($1, $2, $3, $4, $5, NOW())",
      [temp, description, humidity, pressure, windSpeed]
    );
    
    const timestamp = new Date().toLocaleString("tr-TR");
    console.log(`[${timestamp}] Data saved: ${temp}°C, ${description}, Nem: ${humidity}%, Basınç: ${pressure}hPa, Rüzgar: ${windSpeed}m/s`);
  } catch (error) {
    const timestamp = new Date().toLocaleString("tr-TR");
    console.error(`[${timestamp}] Error fetching weather:`, error.message);
  }
}


cron.schedule("*/5 * * * *", () => {
  console.log("Cron job çalışıyor - hava durumu güncelleniyor...");
  fetchWeather();
});

setTimeout(() => {
  console.log("İlk hava durumu verisi alınıyor...");
  fetchWeather();
}, 2000); 

process.on('SIGINT', async () => {
  console.log('\nUygulama kapatılıyor...');
  await pool.end();
  process.exit(0);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Hava durumu her dakikada bir otomatik güncellenecek.`);
});
