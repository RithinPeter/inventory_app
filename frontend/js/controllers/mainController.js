import { homeView } from "../views/homeView.js";
import { popupView } from "../views/popupView.js";

import { CPU_DATA } from "../models/cpuModel.js";
import { RAM_DATA } from "../models/ramModel.js";
import { SSD_DATA } from "../models/ssdModel.js";
import { HDD_DATA } from "../models/hddModel.js";
import { NVME_DATA } from "../models/nvmeModel.js";
import { GPU_DATA } from "../models/gpuModel.js";

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

    <button onclick="popupView.close()" class="btn-secondary">Cancel</button>
  `);

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

          <button class="btn-primary" onclick="submitCPU()">Send Request</button>
        `;
      };
    };
  };
}

window.submitCPU = function () {
  const brand = document.getElementById("cpuBrand").value;
  const series = document.getElementById("cpuSeries").value;
  const gen = document.getElementById("cpuGen").value;
  const model = document.getElementById("cpuModel").value;

  const detail = `${brand} ${series} ${gen} ${model}`;
  alert("CPU Request: " + detail);

  popupView.close();
};
function ramController() {
  popupView.open(`
    <h3>Select RAM</h3>

    <label>Choose Type + Capacity</label>
    <select id="ramSelect">
      <option disabled selected>Select RAM</option>
      ${Object.keys(RAM_DATA)
        .map((ddr) =>
          RAM_DATA[ddr]
            .map((size) => `<option>${ddr} ${size}</option>`)
            .join("")
        )
        .join("")}
    </select>

    <button class="btn-primary" onclick="submitRAM()">Send Request</button>
    <button onclick="popupView.close()" class="btn-secondary">Cancel</button>
  `);
}

window.submitRAM = function () {
  const ram = document.getElementById("ramSelect").value;
  alert("RAM Request: " + ram);
  popupView.close();
};
function storageController(type, data) {
  popupView.open(`
    <h3>Select ${type}</h3>

    <label>Capacity</label>
    <select id="storageSelect">
      ${data.map((c) => `<option>${c}</option>`).join("")}
    </select>

    <button class="btn-primary" onclick="submitStorage('${type}')">Send Request</button>
    <button onclick="popupView.close()" class="btn-secondary">Cancel</button>
  `);
}

window.submitStorage = function (type) {
  const cap = document.getElementById("storageSelect").value;
  alert(`${type} Request: ${cap}`);
  popupView.close();
};
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

    <button onclick="popupView.close()" class="btn-secondary">Cancel</button>
  `);

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

          <button class="btn-primary" onclick="submitGPU()">Send Request</button>
        `;
      };
    };
  };
}

window.submitGPU = function () {
  const brand = document.getElementById("gpuBrand").value;
  const series = document.getElementById("gpuSeries").value;
  const model = document.getElementById("gpuModel").value;
  const profile = document.getElementById("gpuProfile").value;

  const detail = `${brand} ${series} ${model} (${profile})`;

  alert("GPU Request: " + detail);
  popupView.close();
};
