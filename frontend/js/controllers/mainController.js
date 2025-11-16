import { homeView } from "../views/homeView.js";
import { popupView } from "../views/popupView.js";

import { CPU_DATA } from "../models/cpuModel.js";
import { RAM_DATA } from "../models/ramModel.js";
import { SSD_DATA } from "../models/ssdModel.js";
import { HDD_DATA } from "../models/hddModel.js";
import { NVME_DATA } from "../models/nvmeModel.js";
import { GPU_DATA } from "../models/gpuModel.js";



const API_BASE = "http://127.0.0.1:8001";

let lastCreatedTicketId = null;
async function sendRequestToServer(item_type, description, os = null, boot_mode = null) {
  try {
    const res = await fetch(`${API_BASE}/api/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_type, description, os, boot_mode })
    });

    if (!res.ok) {
      console.error("Failed to send request", await res.text());
      pushNotification(`Error sending ${item_type} request`);
      return;
    }

    const data = await res.json();
    lastCreatedTicketId = data.id;  // store ticket id for delivery tracking
    pushNotification(`${item_type} ticket #${data.id} created: ${data.description}`);
  } catch (err) {
    console.error(err);
    pushNotification(`Server error sending ${item_type} request`);
  }
}

homeView.renderHome();

document.getElementById("home-container").addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;

  const type = card.dataset.type;

  if (type === "cpu") cpuController();
  else if (type === "ram") ramController();
  else if (type === "ssd") storageController("SSD", SSD_DATA);
  else if (type === "hdd") storageController("HDD", HDD_DATA);
  else if (type === "nvme") storageController("NVMe", NVME_DATA);
  else if (type === "gpu") gpuController();
});

// ================= CPU =====================
function cpuController() {
  let brandOptions = Object.keys(CPU_DATA)
    .map((b) => `<option value="${b}">${b}</option>`)
    .join("");

  popupView.open(`
    <h3>Select CPU</h3>

    <label>Brand</label>
    <select id="cpuBrand">
      <option disabled selected>Select</option>
      ${brandOptions}
    </select>

    <div id="cpuSeriesBox"></div>
    <div id="cpuGenBox"></div>
    <div id="cpuModelBox"></div>

    <button onclick="window.popupView.close()" class="btn-secondary">Cancel</button>
  `);

  window.popupView = popupView;

  document.getElementById("cpuBrand").onchange = () => {
    const brand = document.getElementById("cpuBrand").value;
    const seriesList = Object.keys(CPU_DATA[brand]);

    document.getElementById("cpuSeriesBox").innerHTML = `
      <label>Series</label>
      <select id="cpuSeries">
        <option disabled selected>Select</option>
        ${seriesList.map((s) => `<option>${s}</option>`).join("")}
      </select>
    `;

    document.getElementById("cpuSeries").onchange = () => {
      const series = document.getElementById("cpuSeries").value;
      const genList = Object.keys(CPU_DATA[brand][series]);

      document.getElementById("cpuGenBox").innerHTML = `
        <label>Generation</label>
        <select id="cpuGen">
          <option disabled selected>Select</option>
          ${genList.map((g) => `<option>${g}</option>`).join("")}
        </select>
      `;

      document.getElementById("cpuGen").onchange = () => {
        const gen = document.getElementById("cpuGen").value;
        const models = CPU_DATA[brand][series][gen];

        document.getElementById("cpuModelBox").innerHTML = `
          <label>Model</label>
          <select id="cpuModel">
            ${models.map((m) => `<option>${m}</option>`).join("")}
          </select>

          <button class="btn-primary" onclick="window.submitCPU()">Send Request</button>
        `;
      };
    };
  };

  window.submitCPU = function () {
    const brand = document.getElementById("cpuBrand").value;
    const series = document.getElementById("cpuSeries").value;
    const gen = document.getElementById("cpuGen").value;
    const model = document.getElementById("cpuModel").value;

    const detail = `${brand} ${series} ${gen} ${model}`;
    sendRequestToServer("CPU", detail);

    popupView.close();
  };
}

// ================= RAM ====================
function ramController() {
  popupView.open(`
    <h3>Select RAM</h3>

    <label>Choose Type + Capacity</label>
    <select id="ramSelect">
      <option disabled selected>Select RAM</option>
      ${Object.keys(RAM_DATA)
        .map((ddr) =>
          RAM_DATA[ddr].map((size) => `<option>${ddr} ${size}</option>`).join("")
        )
        .join("")}
    </select>

    <button class="btn-primary" onclick="window.submitRAM()">Send Request</button>
    <button onclick="window.popupView.close()" class="btn-secondary">Cancel</button>
  `);

  window.submitRAM = function () {
  const ram = document.getElementById("ramSelect").value;
  sendRequestToServer("RAM", ram);
    popupView.close();
  };

  window.popupView = popupView;
}

// ================= STORAGE ====================
function storageController(type, data) {
  popupView.open(`
    <h3>Select ${type}</h3>

    <label>Capacity</label>
    <select id="storageSelect">
      <option disabled selected>Select Capacity</option>
      ${data.map((c) => `<option>${c}</option>`).join("")}
    </select>

    <div id="osSelectBox"></div>
    <div id="bootSelectBox"></div>

    <button onclick="window.popupView.close()" class="btn-secondary">Cancel</button>
  `);

  // IMPORTANT — Enable Cancel button
  window.popupView = popupView;

  // Step 1: Capacity
  document.getElementById("storageSelect").onchange = () => {
    document.getElementById("osSelectBox").innerHTML = `
      <label>Pre-installed OS</label>
      <select id="storageOS">
        <option disabled selected>Select OS</option>
        <option>No OS</option>
        <option>Windows 7 (32-bit)</option>
        <option>Windows 7 (64-bit)</option>
        <option>Windows 10</option>
        <option>Windows 11</option>
      </select>
    `;

    // Step 2: OS
    document.getElementById("storageOS").onchange = () => {
      document.getElementById("bootSelectBox").innerHTML = `
        <label>Boot Mode</label>
        <select id="bootMode">
          <option selected>UEFI (Default)</option>
          <option>Legacy</option>
        </select>

        <button class="btn-primary" onclick="window.submitStorage('${type}')">
          Send Request
        </button>
      `;
    };
  };
}

window.submitStorage = function (type) {
  const capacity = document.getElementById("storageSelect").value;
  const os = document.getElementById("storageOS").value;
  const boot = document.getElementById("bootMode").value;

  sendRequestToServer(type, capacity, os, boot);
popupView.close();
};


// ================= GPU ====================
function gpuController() {
  const brands = Object.keys(GPU_DATA)
    .map((b) => `<option>${b}</option>`)
    .join("");

  popupView.open(`
    <h3>Select GPU</h3>

    <label>Brand</label>
    <select id="gpuBrand">
      <option disabled selected>Select</option>
      ${brands}
    </select>

    <div id="gpuSeriesBox"></div>
    <div id="gpuModelBox"></div>
    <div id="gpuProfileBox"></div>

    <button onclick="window.popupView.close()" class="btn-secondary">Cancel</button>
  `);

  window.popupView = popupView;

  document.getElementById("gpuBrand").onchange = () => {
    const brand = document.getElementById("gpuBrand").value;
    const seriesList = Object.keys(GPU_DATA[brand]);

    document.getElementById("gpuSeriesBox").innerHTML = `
      <label>Series</label>
      <select id="gpuSeries">
        <option disabled selected>Select</option>
        ${seriesList.map((s) => `<option>${s}</option>`).join("")}
      </select>
    `;

    document.getElementById("gpuSeries").onchange = () => {
      const series = document.getElementById("gpuSeries").value;
      const modelList = Object.keys(GPU_DATA[brand][series]);

      document.getElementById("gpuModelBox").innerHTML = `
        <label>Model</label>
        <select id="gpuModel">
          <option disabled selected>Select</option>
          ${modelList.map((m) => `<option>${m}</option>`).join("")}
        </select>
      `;

      document.getElementById("gpuModel").onchange = () => {
        const model = document.getElementById("gpuModel").value;
        const profiles = GPU_DATA[brand][series][model];

        document.getElementById("gpuProfileBox").innerHTML = `
          <label>Profile</label>
          <select id="gpuProfile">
            ${profiles.map((p) => `<option>${p}</option>`).join("")}
          </select>

          <button class="btn-primary" onclick="window.submitGPU()">Send Request</button>
        `;
      };
    };
  };

 window.submitGPU = function () {
  const brand = document.getElementById("gpuBrand").value;
  const series = document.getElementById("gpuSeries").value;
  const model = document.getElementById("gpuModel").value;
  const profile = document.getElementById("gpuProfile").value;

  const detail = `${brand} ${series} ${model} (${profile})`;

  sendRequestToServer("GPU", detail);
  popupView.close();
};

}
// ------------------ CHAT ---------------------
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send-btn");

chatSend.addEventListener("click", () => {
  sendChatMessage(chatInput.value);
  chatInput.value = "";
});

function sendChatMessage(text) {
  if (!text.trim()) return;

  const msg = document.createElement("div");
  msg.className = "msg sent";
  msg.innerHTML = `${text} <span class="ticks">✓</span>`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Simulate message delivered after 1s
  setTimeout(() => {
    msg.querySelector(".ticks").innerText = "✓✓";
  }, 1000);
}


// ---------------- NOTIFICATIONS -----------------
const notifBox = document.getElementById("notif-box");

function pushNotification(text) {
  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `${text} <span class="ticks">✓</span>`;
  notifBox.prepend(div);

  // Delivered tick after 1 sec
  setTimeout(() => {
    div.querySelector(".ticks").innerText = "✓✓";
  }, 1000);
}
// =============== CHECK DELIVERY STATUS ===============
async function checkDeliveryStatus() {
  if (!lastCreatedTicketId) return;

  try {
    const res = await fetch(`${API_BASE}/api/notify/${lastCreatedTicketId}`);
    if (!res.ok) return;

    const data = await res.json();

    if (data.status === "delivered") {

      // full styled notification just like request creation
      pushNotification(
        `Ticket #${lastCreatedTicketId} has been delivered`
      );

      lastCreatedTicketId = null;
    }
  } catch (err) {
    console.error("Delivery check error:", err);
  }
}

// check every 3 seconds
setInterval(checkDeliveryStatus, 3000);
