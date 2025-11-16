export const popupView = {
  open(html) {
    const backdrop = document.getElementById("popup-backdrop");
    const modal = document.getElementById("popup-modal");

    backdrop.classList.remove("hidden");
    modal.classList.remove("hidden");

    modal.style.opacity = "0";
    modal.style.transform = "translate(-50%, -45%)";

    setTimeout(() => {
      modal.style.opacity = "1";
      modal.style.transform = "translate(-50%, -50%)";
    }, 10);

    modal.innerHTML = html;
  },

  close() {
    const backdrop = document.getElementById("popup-backdrop");
    const modal = document.getElementById("popup-modal");

    backdrop.classList.add("hidden");
    modal.classList.add("hidden");

    modal.innerHTML = "";
  }
};
