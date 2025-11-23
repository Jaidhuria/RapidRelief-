
  const chatBtn = document.getElementById("chat-btn");
  const chatBox = document.getElementById("chat-box");
  const messagesDiv = document.getElementById("messages");
  const userInput = document.getElementById("user-input");

  chatBtn.addEventListener("click", () => {
    chatBox.style.display = chatBox.style.display === "none" ? "flex" : "none";
  });

  function appendMessage(sender, text) {
    const msg = document.createElement("div");
    msg.textContent = sender + ": " + text;
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  // Predefined quick questions
  const quickQuestions = [
    "What to do in a flood?",
    "Earthquake safety tips",
    "Cyclone preparedness checklist",
    "Landslide safety advice",
    "Heat wave precautions",
    "Emergency contact numbers"
  ];

  // Render quick question buttons once
  (function renderQuickQuestions(){
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.gap = '6px';
    quickQuestions.forEach(q => {
      const b = document.createElement('button');
      b.textContent = q;
      b.style.padding = '6px 8px';
      b.style.borderRadius = '12px';
      b.style.border = '1px solid #ddd';
      b.style.background = '#f7f7f7';
      b.style.cursor = 'pointer';
      b.addEventListener('click', () => {
        userInput.value = q;
        sendMessage();
      });
      container.appendChild(b);
    });
    messagesDiv.appendChild(container);
  })();

  async function sendMessage() {
    const text = userInput.value;
    if (!text) return;
    appendMessage("You", text);
    userInput.value = "";

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await response.json();
    appendMessage("Bot", data.reply);
  }
