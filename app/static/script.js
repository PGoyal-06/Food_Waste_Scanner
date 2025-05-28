const toggle = document.getElementById("darkModeSwitch");
const root = document.documentElement;
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  root.setAttribute("data-bs-theme", "dark");
  toggle.checked = true;
}

toggle.addEventListener("change", () => {
  const theme = toggle.checked ? "dark" : "light";
  root.setAttribute("data-bs-theme", theme);
  localStorage.setItem("theme", theme);
});

function showSpinner() {
  document.getElementById("loadingSpinner").style.display = "block";
}

function startListening() {
  const recognition = new (window.SpeechRecognition ||
    window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.start();

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("recipe").value = transcript;
  };

  recognition.onerror = function (event) {
    alert("Speech recognition error: " + event.error);
  };
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  speechSynthesis.speak(utterance);
}

function sendChat() {
  const input = document.getElementById("chatInput");
  const chatBox = document.getElementById("chat-box");
  const question = input.value.trim();
  if (!question) return;

  // 1) user bubble
  const userMsg = document.createElement("div");
  userMsg.className = "chat-bubble chat-user";
  userMsg.textContent = question;
  chatBox.appendChild(userMsg);
  chatBox.scrollTop = chatBox.scrollHeight;

  // 2) clear & disable input
  input.value = "";
  input.disabled = true;

  // 3) send to backend
  fetch("/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  })
    .then((res) => res.json())
    .then((data) => {
      // 4) assistant bubble
      const reply = document.createElement("div");
      reply.className = "chat-bubble chat-assistant";
      reply.textContent = data.answer || "Sorry, I didn’t get that.";
      chatBox.appendChild(reply);
      chatBox.scrollTop = chatBox.scrollHeight;
    })
    .catch((err) => {
      const errMsg = document.createElement("div");
      errMsg.className = "chat-bubble chat-assistant text-danger";
      errMsg.textContent = "Error contacting assistant.";
      chatBox.appendChild(errMsg);
      chatBox.scrollTop = chatBox.scrollHeight;
      console.error(err);
    })
    .finally(() => {
      input.disabled = false;
      input.focus();
    });
}
// ─── File-picker hookup ─────────────────────────
const chooseFileBtn = document.getElementById("chooseFileBtn");
const fileInput = document.getElementById("fileInput");

chooseFileBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  if (!fileInput.files.length) return;
  // show the filename on the button
  const name = fileInput.files[0].name;
  chooseFileBtn.textContent = `📁 ${name}`;
});
