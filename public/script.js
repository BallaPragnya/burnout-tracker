// ---------- CONFIG ----------
const STUDENT_ID = 1;
let selectedData = {
  activity: null,
  focus: null,
  location: null
};

// ---------- PAGE SWITCH ----------
function showPage(page) {
  document.getElementById("dashboardPage").style.display =
    page === "dashboard" ? "block" : "none";

  document.getElementById("insightsPage").style.display =
    page === "insights" ? "block" : "none";

  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  event.target.classList.add("active");
}

// ---------- CALENDAR ----------
const calendar = document.getElementById("calendar");

for (let i = 1; i <= 30; i++) {
  const day = document.createElement("div");
  day.classList.add("day");
  day.innerText = i;

  day.onclick = () => {
    document.querySelectorAll(".day").forEach(d => d.classList.remove("active"));
    day.classList.add("active");

    selectedDate = `2026-04-${String(i).padStart(2, "0")}`;
    document.getElementById("selectedDate").innerText = `April ${i}, 2026`;

    loadBlocks(); // 🔥 reload blocks when day changes
  };

  calendar.appendChild(day);
}

// ---------- TIME LABELS ----------
const timeLabels = document.getElementById("timeLabels");

for (let i = 0; i < 24; i++) {
  const div = document.createElement("div");
  div.classList.add("time-slot");

  let hour = i % 12 || 12;
  let suffix = i < 12 ? "AM" : "PM";

  div.innerText = `${hour} ${suffix}`;
  timeLabels.appendChild(div);
}

// ---------- DRAG ----------
const timeline = document.getElementById("timelineWrapper");

let isDragging = false;
let startY = 0;
let preview = null;

timeline.addEventListener("mousedown", (e) => {
  isDragging = true;
  startY = timeline.scrollTop + e.offsetY;

  if (preview) preview.remove();

  preview = document.createElement("div");
  preview.classList.add("preview");
  preview.style.top = startY + "px";
  preview.style.height = "0px";

  timeline.appendChild(preview);
});

timeline.addEventListener("mousemove", (e) => {
  if (!isDragging || !preview) return;

  let currentY = timeline.scrollTop + e.offsetY;
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

  if (!preview) return;

  const popup = document.getElementById("taskPopup");

  popup.style.top = preview.style.top;
  popup.style.left = "300px"; // adjust if needed

  popup.classList.remove("hidden");
});
  // 🔥 Save to backend
  await saveTimeBlock({
    student_id: STUDENT_ID,
    date: selectedDate,
    start_time,
    end_time,
    activity,
    focus_level,
    place: location
  });

  preview.remove();

  // 🔥 Reload blocks
  loadBlocks();
});

document.getElementById("saveBtn").onclick = async () => {
  if (!selectedData.activity || !selectedData.focus || !selectedData.location) {
    alert("Fill all fields");
    return;
  }

  const start = parseInt(preview.style.top);
  const height = parseInt(preview.style.height);

  const startMinutes = Math.floor(start * (60 / 50));
  const endMinutes = Math.floor((start + height) * (60 / 50));

  await saveTimeBlock({
    student_id: 1,
    date: selectedDate,
    start_time: minutesToTime(startMinutes),
    end_time: minutesToTime(endMinutes),
    activity: selectedData.activity,
    focus_level: selectedData.focus,
    location: selectedData.location
  });

  document.getElementById("taskPopup").classList.add("hidden");
  preview.remove();
  loadBlocks();
};

// ---------- LOAD BLOCKS ----------
async function loadBlocks() {
  const res = await fetch(
    `http://localhost:3000/time-blocks/${STUDENT_ID}/${selectedDate}`
  );

  const data = await res.json();
  renderBlocks(data);
}

// ---------- RENDER BLOCKS ----------
function renderBlocks(blocks) {
  document.querySelectorAll(".block").forEach(el => el.remove());

  blocks.forEach(block => {
    const start = convertTimeToMinutes(block.start_time);
    const end = convertTimeToMinutes(block.end_time);

    const top = start * (50 / 60);
    const height = (end - start) * (50 / 60);

    const div = document.createElement("div");
    div.classList.add("block");

    div.style.top = top + "px";
    div.style.height = height + "px";

    div.innerText = block.activity;

    timeline.appendChild(div);
  });
}

// ---------- HELPERS ----------
function convertTimeToMinutes(time) {
  const [h, m] = time.split(":");
  return parseInt(h) * 60 + parseInt(m);
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

// ---------- INITIAL LOAD ----------
loadBlocks();

document.querySelectorAll("#activityOptions button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll("#activityOptions button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedData.activity = btn.innerText;
  };
});

document.querySelectorAll("#focusOptions button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll("#focusOptions button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedData.focus = parseInt(btn.innerText);
  };
});

document.querySelectorAll("#locationOptions button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll("#locationOptions button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedData.location = btn.innerText;
  };
});