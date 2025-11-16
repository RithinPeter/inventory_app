export const homeView = {
  renderHome() {
    const home = document.getElementById("home-container");

    home.innerHTML = `
      <div class="card" data-type="cpu">
        <img src="images/cpu.png" alt="CPU">
        <p>CPU</p>
      </div>

      <div class="card" data-type="ram">
        <img src="images/ram.png" alt="RAM">
        <p>RAM</p>
      </div>

      <div class="card" data-type="ssd">
        <img src="images/ssd.png" alt="SSD">
        <p>SSD</p>
      </div>

      <div class="card" data-type="hdd">
        <img src="images/hdd.png" alt="HDD">
        <p>HDD</p>
      </div>

      <div class="card" data-type="nvme">
        <img src="images/nvme.png" alt="NVMe">
        <p>NVMe</p>
      </div>

      <div class="card" data-type="gpu">
        <img src="images/gpu.png" alt="GPU">
        <p>GPU</p>
      </div>
    `;
  }
};
