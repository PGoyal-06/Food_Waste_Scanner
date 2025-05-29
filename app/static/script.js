  const toggle = document.getElementById("darkModeSwitch");
  const root = document.documentElement;
  const savedTheme = localStorage.getItem("theme");

  if (toggle && savedTheme === "dark") {
    root.setAttribute("data-bs-theme", "dark");
    toggle.checked = true;
  }

  if (toggle) {
    toggle.addEventListener("change", () => {
      const theme = toggle.checked ? "dark" : "light";
      root.setAttribute("data-bs-theme", theme);
      localStorage.setItem("theme", theme);
    });
  }

  function showSpinner() {
    document.getElementById("loadingSpinner").style.display = "block";
  }

  function startListening() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
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

    const userMsg = document.createElement("div");
    userMsg.className = "chat-bubble chat-user";
    userMsg.textContent = question;
    chatBox.appendChild(userMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

    input.value = "";
    input.disabled = true;

    fetch("/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    })
      .then((res) => res.json())
      .then((data) => {
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

  const chooseFileBtn = document.getElementById("chooseFileBtn");
  const fileInput = document.getElementById("fileInput");
  const pasteBtn = document.getElementById("pasteBtn");

  if (chooseFileBtn && fileInput) {
    chooseFileBtn.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", () => {
      if (!fileInput.files.length) return;
      const file = fileInput.files[0];
      chooseFileBtn.textContent = `📁 ${file.name}`;
      pasteBtn.disabled = true;
      pasteBtn.classList.add("disabled");

      if (file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = function () {
          const typedarray = new Uint8Array(this.result);
          pdfjsLib.getDocument({ data: typedarray }).promise.then((pdf) => {
            const maxPages = pdf.numPages;
            const pageTextPromises = [];

            for (let i = 1; i <= maxPages; i++) {
              pageTextPromises.push(
                pdf.getPage(i).then((page) =>
                  page.getTextContent().then((content) =>
                    content.items.map((i) => i.str).join(" ")
                  )
                )
              );
            }

            Promise.all(pageTextPromises).then((texts) => {
              const fullText = texts.join("\n\n");
              document.getElementById("recipe").value = fullText;
            });
          });
        };
        reader.readAsArrayBuffer(file);
      }
    });
  }
