// ================= CONFIG =================
const API_BASE = "http://127.0.0.1:8001";

// DOM references
const ticketListEl = document.getElementById("ticket-list");
const ticketInfoEl = document.getElementById("ticket-info");
const ticketStatusEl = document.getElementById("ticket-status");
const deliveryTimeEl = document.getElementById("delivery-time");
const ticketBadgeEl = document.getElementById("ticket-badge");
const ticketSearchEl = document.getElementById("ticket-search");

let tickets = [];
let selectedTicket = null;

// ================= FETCH TICKETS =================
async function fetchTickets() {
  try {
    const res = await fetch(`${API_BASE}/api/requests`);
    if (!res.ok) return;

    tickets = await res.json();
    renderTicketList();
    updateBadge();
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

// ================= RENDER LIST =================
function renderTicketList() {
  const q = ticketSearchEl.value.toLowerCase();
  ticketListEl.innerHTML = "";

  [...tickets]                 // copy array
    .reverse()                 // NEWEST FIRST
    .filter(t =>
      t.item_type.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
    )
    .forEach(t => {
      const div = document.createElement("div");
      div.className = "ticket";
      div.innerHTML = `
        <strong>#${t.id} – ${t.item_type}</strong><br>
        ${t.description}<br>
        <b>Status: ${t.status}</b>
      `;
      div.onclick = () => openTicket(t);
      ticketListEl.appendChild(div);
    });
}


// ================= OPEN TICKET =================
function openTicket(t) {
  selectedTicket = t;

  ticketInfoEl.innerHTML = `
    <p><b>Item:</b> ${t.item_type}</p>
    <p><b>Description:</b> ${t.description}</p>
    <p><b>ID:</b> ${t.id}</p>
  `;

  ticketStatusEl.value = t.status;
  deliveryTimeEl.innerText =
    t.status === "Delivered"
      ? new Date(t.updated_at * 1000).toLocaleString()
      : "--";
}

// ================= UPDATE STATUS =================
document.getElementById("update-status-btn").onclick = async () => {
  if (!selectedTicket) return;

  const newStatus = ticketStatusEl.value;

  const res = await fetch(`${API_BASE}/api/requests/${selectedTicket.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus })
  });

  if (!res.ok) return;

  const updated = await res.json();

  // Notify requester
  if (updated.status === "Delivered") {
    await fetch(`${API_BASE}/api/notify/${updated.id}`, { method: "POST" });
  }

  fetchTickets();
  openTicket(updated);
};

// Search filter
ticketSearchEl.addEventListener("input", renderTicketList);

// Badge
function updateBadge() {
  const pending = tickets.filter(t => t.status !== "Delivered").length;
  ticketBadgeEl.innerText = pending;
}

// ================= START POLLING =================
fetchTickets();
setInterval(fetchTickets, 3000);

/* =====================
      CHAT — SUPPLIER 
=======================*/
// Get chat UI elements
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send-btn");

// Open WebSocket
const chatSocket = new WebSocket("ws://127.0.0.1:8001/ws/chat");

// Receive messages
chatSocket.onmessage = (event) => {
    appendChatBubble(event.data, "received");
};

// Send message
chatSend.addEventListener("click", () => {
  let text = chatInput.value.trim();
  if (!text) return;

  chatSocket.send(ROLE + ": " + text);   // key part
  appendChatBubble("You: " + text, "sent");

  chatInput.value = "";
});

// UI helper
function appendChatBubble(msg, type) {
  const div = document.createElement("div");
  div.className = "msg " + type;
  div.innerText = msg;

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}
