// 🌍 Global Config for Deployment & Local Testing
const CONFIG = {
  // ✅ Gunakan ini saat testing lokal
  BASE_API_URL: "http://127.0.0.1:8000", // ⬅️ ubah dari "https://your-backend-url.com"
  
  // 🌐 Saat nanti deploy ke Render atau Railway, ganti dengan domain backend kamu
  // BASE_API_URL: "https://api.planville.de", // contoh jika sudah live

  LANG_DEFAULT: "de", // Default bahasa Jerman
  GTM_ID: "G-YL8ECJ5V17" // Google Tag Manager ID
,
  STREAMING: true
,
  STREAMING: true,
  STREAM_TRANSPORT: "chunk" // "chunk" or "sse"
,
  DEBUG_INTENT: false
};
