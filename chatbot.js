const productLabels = {
  heatpump: { en: "Heat Pump 🔥", de: "Wärmepumpe 🔥" },
  aircon: { en: "Air Conditioner ❄️", de: "Klimaanlage ❄️" },
  pv: { en: "Photovoltaic System ☀️", de: "Photovoltaikanlage ☀️" },
  roof: { en: "Roof Renovation 🛠️", de: "Dachsanierung 🛠️" },
  tenant: { en: "Tenant Power 🏠", de: "Mieterstrom 🏠" },
};



// ========================
// 📚 FAQ Multilingual Data
// ========================
const faqTexts = {
  en: [
    "How much does photovoltaics service cost?",
    "What areas does Planville serve?",
    "Can I book a consultation?"
  ],
  de: [
    "Wie viel kostet eine Photovoltaikanlage?",
    "Welche Regionen deckt Planville ab?",
    "Kann ich eine Beratung buchen?"
  ]
};

// ========================
// 🎯 Element Selectors
// ========================
const chatLog = document.getElementById("chatbot-log");
const form = document.getElementById("chatbot-form");
const input = document.getElementById("chatbot-input");
const toggle = document.getElementById("modeToggle");
const typingBubble = document.getElementById("typing-bubble");
const langSwitcher = document.getElementById("langSwitcher");

// ========================
// 🧠 Load Chat History from localStorage
// ========================
let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

function loadChatHistory() {
  chatHistory.forEach(entry => {
    appendMessage(entry.message, entry.sender, false);
  });
}

window.onload = () => {
  const (typeof langSwitcher!=="undefined"?langSwitcher.value:(CONFIG?.LANG_DEFAULT??"de")) = localStorage.getItem("(typeof langSwitcher!=="undefined"?langSwitcher.value:(CONFIG?.LANG_DEFAULT??"de"))") || "en";
  langSwitcher.value = (typeof langSwitcher!=="undefined"?langSwitcher.value:(CONFIG?.LANG_DEFAULT??"de"));
  updateFAQ((typeof langSwitcher!=="undefined"?langSwitcher.value:(CONFIG?.LANG_DEFAULT??"de")));
  updateUITexts((typeof langSwitcher!=="undefined"?langSwitcher.value:(CONFIG?.LANG_DEFAULT??"de")));
  loadChatHistory();

  const consent = localStorage.getItem("cookieConsent");
  if (!consent) {
    document.getElementById("cookie-banner").style.display = "block";
  } else if (consent === "accepted") {
    if (typeof enableGTM === "function") enableGTM();
  }
};

// ========================
// 🌗 Mode Switcher
// ========================
toggle.addEventListener("change", () => {
  document.body.style.background = toggle.checked ? "var(--bg-light)" : "var(--bg-dark)";
  document.body.style.color = toggle.checked ? "var(--text-light)" : "var(--text-dark)";
});

// ========================
// 🌐 Language Switcher
// ========================
langSwitcher.addEventListener("change", () => {
  const lang = langSwitcher.value;
  localStorage.setItem("(typeof langSwitcher!=="undefined"?langSwitcher.value:(CONFIG?.LANG_DEFAULT??"de"))", lang);
  updateFAQ(lang);
  updateUITexts(lang);

  if (typeof gtag !== "undefined") {
    gtag('event', 'language_switch', {
      event_category: 'chatbot',
      event_label: lang
    });
  }
});

// ========================
// 📩 Form Submit Handler
// ========================
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = input.value.trim();
  const (typeof langSwitcher!=="undefined"?langSwitcher.value:(CONFIG?.LANG_DEFAULT??"de")) = langSwitcher.value;

  if (!question) return;

  appendMessage(question, "user");
  saveToHistory("user", question);
  input.value = "";
  typingBubble.style.display = "block";

  // Intent detection
  if (detectIntent(question)) {
    typingBubble.style.display = "none";
    return;
  }

  try {
    const res = await fetch(`${(typeof CONFIG!=="undefined"&&CONFIG.BASE_API_URL)?CONFIG.BASE_API_URL:""}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: \1, lang: (typeof langSwitcher!=="undefined"?langSwitcher.value:(CONFIG?.LANG_DEFAULT??"de")) })
    });

    const data = await res.json();
    typingBubble.style.display = "none";

    const reply = data.reply?.trim();
    const fallbackMsg = (typeof langSwitcher!=="undefined"?langSwitcher.value:(CONFIG?.LANG_DEFAULT??"de")) === "de"
      ? `Ich bin mir nicht sicher. Bitte <a href="https://planville.de/kontakt" target="_blank">📞 kontaktieren Sie unser Team hier</a>.`
      : `I'm not sure about that. Please <a href="https://planville.de/kontakt" target="_blank">📞 contact our team here</a>.`;

    const finalReply = reply && reply !== "" ? reply : fallbackMsg;
    appendMessage(finalReply, "bot");
    saveToHistory("bot", finalReply);

    if (typeof trackChatEvent === "function") {
      trackChatEvent(question, (typeof langSwitcher!=="undefined"?langSwitcher.value:(CONFIG?.LANG_DEFAULT??"de")));
    }
  } catch (err) {
    typingBubble.style.display = "none";
    appendMessage("Error while connecting to GPT API.", "bot");
  }
});


// ========================
// 💬 Append Message
// ========================
function appendMessage(msg, sender, scroll = true) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `chatbot-message ${sender}-message`;
  msgDiv.innerHTML = msg;

  if (sender === "bot") {
    const feedback = document.createElement("div");
    feedback.className = "feedback-btns";
    feedback.innerHTML = `
      <button onclick="feedbackClick('up')">👍</button>
      <button onclick="feedbackClick('down')">👎</button>
    `;
    msgDiv.appendChild(feedback);

    if (msg.length > 100) {
      const lang = langSwitcher.value;
      const cta = document.createElement("a");
      cta.href = "https://planville.de/kontakt/";
      cta.target = "_blank";
      cta.className = "cta-button";
      cta.innerText = lang === "de" ? "Jetzt Beratung buchen 👉" : "Book a consultation 👉";
      msgDiv.appendChild(cta);
    }
  }

  chatLog.appendChild(msgDiv);
  if (scroll) chatLog.scrollTop = chatLog.scrollHeight;
}

// ========================
// 🧠 Save Chat to localStorage
// ========================
function saveToHistory(sender, message) {
  chatHistory.push({ sender, message });
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

// ========================
// 🗑️ Reset Chat
// ========================
function resetChat() {
  localStorage.removeItem("chatHistory");
  chatHistory = [];
  chatLog.innerHTML = "";
  const productBlock = document.getElementById("product-options-block");
if (productBlock) productBlock.remove();
}

// ========================
// 📌 FAQ Updater
// ========================
function updateFAQ(lang) {
  const faqList = document.getElementById("faq-list");
  faqList.innerHTML = "";

  faqTexts[lang].forEach((text) => {
    const li = document.createElement("li");
    li.innerText = text;
    li.onclick = () => sendFAQ(text);
    faqList.appendChild(li);
  });
}

// ========================
// 📤 FAQ Click → Input
// ========================
function sendFAQ(text) {
  input.value = text;
  form.dispatchEvent(new Event("submit"));

  if (typeof trackFAQClick === "function") {
    trackFAQClick(text);
  }
}

// ========================
// 👍👎 Feedback
// ========================
function feedbackClick(type) {
  alert(type === "up" ? "Thanks for your feedback! 👍" : "We'll improve. 👎");

  if (typeof gtag !== "undefined") {
    gtag('event', 'chat_feedback', {
      event_category: 'chatbot',
      event_label: type,
    });
  }
}

// ========================
// 🌐 Update Header & Greeting
// ========================
function updateUITexts(lang) {
  document.querySelector('.chatbot-header h1').innerText =
    lang === "de" ? "Chatte mit Planville AI 🤖" : "Chat with Planville AI 🤖";

  resetChat();

  const greeting = lang === "de"
    ? "Hallo! 👋 Was kann ich für Sie tun?<br>Bitte wählen Sie ein Thema:"
    : "Hello! 👋 What can I do for you?<br>Please choose a topic:";

  appendMessage(greeting, "bot");
  
  showProductOptions(); // 
}
function showProductOptions() {
  const lang = langSwitcher.value;
  const keys = ["pv", "aircon", "heatpump", "tenant", "roof"];

  const existing = document.getElementById("product-options-block");
  if (existing) existing.remove();

  const container = document.createElement("div");
  container.className = "product-options";
  container.id = "product-options-block";

  keys.forEach((key) => {
    const button = document.createElement("button");
    button.innerText = productLabels[key][lang];
    button.className = "product-button";
    button.dataset.key = key; // ✅ assign key
    button.onclick = () => handleProductSelection(key);
    container.appendChild(button);
  });

  chatLog.appendChild(container);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// ========================
// 🔘 Show Product Bubble
// ========================
function showProductOptions() {
  const lang = langSwitcher.value;
  const keys = ["pv", "aircon", "heatpump", "tenant", "roof"];

  const existing = document.getElementById("product-options-block");
  if (existing) existing.remove();

  const container = document.createElement("div");
  container.className = "product-options";
  container.id = "product-options-block";

  keys.forEach((key) => {
    const button = document.createElement("button");
    button.innerText = productLabels[key][lang];
    button.className = "product-button";
    button.dataset.key = key; // ✅ gunakan key
    button.onclick = () => handleProductSelection(key);
    container.appendChild(button);
  });

  chatLog.appendChild(container);
  chatLog.scrollTop = chatLog.scrollHeight;
}





// ========================
// 🧩 Product Click
// ========================
function handleProductSelection(key) {
  const lang = langSwitcher.value;
  const label = productLabels[key][lang];

  appendMessage(label, "user");

  if (typeof gtag !== "undefined") {
    gtag('event', 'select_product', {
      event_category: 'chatbot_interaction',
      event_label: key,
      language: lang
    });
  }

  setTimeout(() => {
    const followUp = lang === "de"
      ? `Was möchten Sie genau zu <b>${label}</b> wissen oder erreichen?`
      : `What exactly would you like to know or achieve about <b>${label}</b>?`;
    appendMessage(followUp, "bot");
  }, 500);
}

// ========================
// 🎯 Intent Detection
// ========================
function detectIntent(text) {
  const lower = text.toLowerCase();

  // Intent: Harga
  if (lower.includes("harga") || lower.includes("kosten") || lower.includes("cost")) {
    const lang = langSwitcher.value;
    const msg = lang === "de"
      ? "Die Preise für Photovoltaik beginnen bei etwa 7.000€ bis 15.000€, abhängig von Größe & Standort. Für ein genaues Angebot:"
      : "Prices for photovoltaics typically range from €7,000 to €15,000 depending on size & location. For an exact quote:";

    appendMessage(msg, "bot");

    const cta = document.createElement("a");
    cta.href = "https://planville.de/kontakt/";
    cta.target = "_blank";
    cta.className = "cta-button";
    cta.innerText = lang === "de" ? "Jetzt Preis anfragen 👉" : "Request Price 👉";
    chatLog.appendChild(cta);

    if (typeof gtag !== "undefined") {
      gtag('event', 'intent_preisinfo', {
        event_category: 'intent',
        event_label: text,
        language: lang
      });
    }
    return true;
  }

  // Intent: Tertarik
  if (lower.includes("tertarik") || lower.includes("interested")) {
    const lang = langSwitcher.value;
    const msg = lang === "de"
      ? "Super! Bitte füllen Sie dieses kurze Formular aus:"
      : "Great! Please fill out this short form:";

    appendMessage(msg, "bot");
    injectLeadMiniForm();
    return true;
  }

  return false;
}

// ========================
// 🧾 Form Mini Wizard
// ========================
function injectLeadMiniForm() {
  const lang = langSwitcher.value;
  const container = document.createElement("div");
  container.className = "chatbot-message bot-message";

  container.innerHTML = `
    <form id="lead-mini-form">
      <label>👤 ${lang === "de" ? "Name" : "Name"}:</label><br>
      <input type="text" id="leadName" required style="margin-bottom:6px; width:100%;" /><br>
      <label>📧 ${lang === "de" ? "E-Mail" : "Email"}:</label><br>
      <input type="email" id="leadEmail" required style="margin-bottom:6px; width:100%;" /><br>
      <button type="submit" style="padding:6px 14px; margin-top:4px;">
        ${lang === "de" ? "Absenden" : "Submit"}
      </button>
    </form>
  `;

  chatLog.appendChild(container);

  document.getElementById("lead-mini-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("leadName").value;
    const email = document.getElementById("leadEmail").value;

    // ✅ Validasi Email Sederhana
    if (!email.includes("@") || !email.includes(".")) {
      alert(lang === "de" ? "Bitte geben Sie eine gültige E-Mail-Adresse ein." : "Please enter a valid email address.");
      return;
    }

    appendMessage(
      lang === "de"
        ? `Vielen Dank ${name}! Unser Team wird Sie bald unter ${email} kontaktieren 🙌`
        : `Thank you ${name}! Our team will contact you soon at ${email} 🙌`,
      "bot"
    );

    if (typeof gtag !== "undefined") {
      gtag('event', 'mini_form_submit', {
        event_category: 'leadform',
        event_label: email
      });
    }
  });
}


async function sendMessageStreaming(question) {
  const base = (typeof CONFIG !== "undefined" && CONFIG.BASE_API_URL) ? CONFIG.BASE_API_URL : "";
  const langNow = (typeof langSwitcher !== "undefined" && langSwitcher.value) ? langSwitcher.value : (CONFIG?.LANG_DEFAULT ?? "de");

  // UI: add empty bot bubble
  const botId = "bot-" + Date.now();
  appendBot(""); // assumes appendBot adds last bubble
  const bubbles = document.querySelectorAll(".bot-message, .message.bot, .chat-bot"); // be lenient
  const lastBubble = bubbles[bubbles.length - 1];

  try {
    const res = await fetch(`${base}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: question, lang: langNow })
    });
    if (!res.ok || !res.body) {
      // Fallback to non-streaming
      return await sendMessageNonStreaming(question);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;
    let full = "";
    while (!done) {
      const { value, done: d } = await reader.read();
      done = d;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        if (lastBubble) lastBubble.innerHTML = full;
      }
    }
    return true;
  } catch (e) {
    // graceful fallback message
    const msg = langNow === "de"
      ? "Ups, da ist etwas schiefgelaufen. Bitte versuchen Sie es erneut oder kontaktieren Sie uns: <a href='https://planville.de/kontakt' target='_blank'>Kontakt</a>"
      : "Oops, something went wrong. Please try again or contact us: <a href='https://planville.de/kontakt' target='_blank'>Contact</a>";
    appendBot(msg);
    return false;
  }
}

async function sendMessageNonStreaming(question) {
  const base = (typeof CONFIG !== "undefined" && CONFIG.BASE_API_URL) ? CONFIG.BASE_API_URL : "";
  const langNow = (typeof langSwitcher !== "undefined" && langSwitcher.value) ? langSwitcher.value : (CONFIG?.LANG_DEFAULT ?? "de");
  const res = await fetch(`${base}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: question, lang: langNow })
  });
  const data = await res.json();
  const text = data?.answer || data?.message || JSON.stringify(data);
  appendBot(text);
  return true;
}


// ---- UI Helpers: typing indicator, auto-scroll, disable controls ----
function _chatContainer() {
  return document.getElementById("chat-log") || document.querySelector(".chat-log") || document.body;
}
function scrollToBottom() {
  try {
    const c = _chatContainer();
    c.scrollTop = c.scrollHeight;
    window.scrollTo(0, document.body.scrollHeight);
  } catch(e) {}
}
function showTyping(on=true) {
  let tip = document.getElementById("typing-indicator");
  if (on) {
    if (!tip) {
      tip = document.createElement("div");
      tip.id = "typing-indicator";
      tip.className = "bot-message typing";
      tip.style.opacity = "0.75";
      tip.style.fontStyle = "italic";
      tip.innerText = "...";
      const c = _chatContainer();
      c.appendChild(tip);
    }
  } else {
    if (tip) tip.remove();
  }
  scrollToBottom();
}
function setControlsDisabled(disabled) {
  try {
    const btn = document.getElementById("sendBtn") || document.querySelector("#send-btn, .send-btn, button[type='submit']");
    const input = document.getElementById("userInput") || document.querySelector("#user-input, textarea, input[type='text']");
    if (btn) btn.disabled = disabled;
    if (input) input.disabled = disabled;
  } catch(e) {}
}


async function sendMessageSSE(question) {
  const base = (typeof CONFIG !== "undefined" && CONFIG.BASE_API_URL) ? CONFIG.BASE_API_URL : "";
  const langNow = (typeof langSwitcher !== "undefined" && langSwitcher.value) ? langSwitcher.value : (CONFIG?.LANG_DEFAULT ?? "de");
  // Prepare empty bot bubble
  appendBot("");
  const bubbles = document.querySelectorAll(".bot-message, .message.bot, .chat-bot");
  const lastBubble = bubbles[bubbles.length - 1];

  setControlsDisabled(true);
  showTyping(true);
  scrollToBottom();

  return new Promise((resolve) => {
    try {
      const url = `${base}/chat/sse?message=${encodeURIComponent(question)}&lang=${encodeURIComponent(langNow)}`;
      const es = new EventSource(url, { withCredentials: false });
      let full = "";
      es.onmessage = (event) => {
        if (event && typeof event.data === "string") {
          full += event.data;
          if (lastBubble) lastBubble.innerHTML = full;
          scrollToBottom();
        }
      };
      es.addEventListener("done", () => {
        es.close();
        showTyping(false);
        setControlsDisabled(false);
        resolve(true);
      });
      es.onerror = () => {
        try { es.close(); } catch(e) {}
        showTyping(false);
        setControlsDisabled(false);
        resolve(false);
      };
    } catch (e) {
      showTyping(false);
      setControlsDisabled(false);
      resolve(false);
    }
  });
}


async function sendMessage(question) {
  if (CONFIG?.STREAMING) {
    if (CONFIG?.STREAM_TRANSPORT === "sse") {
      return await sendMessageSSE(question);
    }
    return await sendMessageStreaming(question);
  } else {
    return await sendMessageNonStreaming(question);
  }
}
