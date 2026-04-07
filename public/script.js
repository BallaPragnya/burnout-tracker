const calendar = document.getElementById("calendar");

function generateCalendar() {
  const daysInMonth = 30; // keep simple for now
  calendar.innerHTML = "";

  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement("div");
    day.classList.add("day");
    day.innerText = i;

    day.addEventListener("click", () => {
      document.querySelectorAll(".day").forEach(d => d.classList.remove("active"));
      day.classList.add("active");

      document.getElementById("selectedDate").innerText = `April ${i}, 2026`;
    });

    calendar.appendChild(day);
  }
}

generateCalendar();
const timeline = document.getElementById("timelineWrapper");

let isDragging = false;
let startY = 0;
let preview = null;

const HOUR_HEIGHT = 50; // flexible scale

timeline.addEventListener("mousedown", (e) => {
  isDragging = true;

  const rect = timeline.getBoundingClientRect();
  startY = e.clientY - rect.top;

  // create preview box
  preview = document.createElement("div");
  preview.classList.add("preview");
  preview.style.top = startY + "px";
  preview.style.height = "0px";

  timeline.appendChild(preview);
});

timeline.addEventListener("mousemove", (e) => {
  if (!isDragging || !preview) return;

  const rect = timeline.getBoundingClientRect();
  let currentY = e.clientY - rect.top;

  let height = currentY - startY;

  if (height < 0) {
    preview.style.top = currentY + "px";
    preview.style.height = Math.abs(height) + "px";
  } else {
    preview.style.height = height + "px";
  }
});

document.addEventListener("mouseup", () => {
  if (!isDragging) return;

  isDragging = false;

  // Keep preview for now (next step will convert it to real block)
});