const socket = io("https://voice-chatts.vercel.app/api/server.js"); // Replace with your deployed backend URL
let localStream;
const userList = document.getElementById("user-list");
const popup = document.getElementById("popup");
const nameInput = document.getElementById("nameInput");
const joinButton = document.getElementById("joinButton");

joinButton.addEventListener("click", async () => {
    const userName = nameInput.value.trim();
    if (!userName) {
        alert("Please enter a name!");
        return;
    }

    // Hide popup and connect user
    popup.style.display = "none";
    socket.emit("join", { name: userName });

    // Request audio access
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStream.getTracks().forEach((track) => {
        track.onended = () => socket.emit("leave");
    });

    // Broadcast audio activity
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(localStream);
    source.connect(analyser);
    analyser.fftSize = 256;

    const checkAudio = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const isTalking = dataArray.reduce((sum, value) => sum + value, 0) > 5000; // Threshold
        if (isTalking) socket.emit("talking", { name: userName });
        requestAnimationFrame(checkAudio);
    };

    checkAudio();
});

// Handle user updates
socket.on("update-users", (users) => {
    userList.innerHTML = "";
    users.forEach(({ name, isTalking }) => {
        const li = document.createElement("li");
        li.textContent = name;
        if (isTalking) li.classList.add("active");
        userList.appendChild(li);
    });
});
