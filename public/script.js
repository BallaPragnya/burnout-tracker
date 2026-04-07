async function loadBlocks() {
    const date = document.getElementById('datePicker').value;

    const res = await fetch(`http://localhost:3000/time-blocks/1/${date}`);
    const blocks = await res.json();

    const timeline = document.getElementById('timeline');
    timeline.innerHTML = "";

    // Draw hour labels
    for (let i = 0; i < 24; i++) {
        const label = document.createElement('div');
        label.className = 'time-label';
        label.style.top = `${i * 50}px`;
        label.innerText = `${i}:00`;
        timeline.appendChild(label);
    }

    // Draw blocks
    blocks.forEach(block => {
        const start = timeToPixels(block.start_time);
        const end = timeToPixels(block.end_time);

        const div = document.createElement('div');
        div.className = 'block';

        div.style.top = `${start}px`;
        div.style.height = `${end - start}px`;

        div.style.backgroundColor = getColor(block.activity);

        div.innerText = `${block.activity} (F:${block.focus_level})`;

        timeline.appendChild(div);
    });
}

// Convert time → pixels
function timeToPixels(time) {
    const [h, m] = time.split(':');
    return (parseInt(h) * 60 + parseInt(m)) * (50 / 60);
}

// Color coding
function getColor(activity) {
    const colors = {
        coding: "#4CAF50",
        studying: "#2196F3",
        sleep: "#9C27B0",
        social: "#F44336",
        break: "#FF9800"
    };

    return colors[activity] || "#607D8B";
}