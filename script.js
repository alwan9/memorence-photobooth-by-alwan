let video = document.getElementById("video");
let timerDisplay = document.getElementById("timer");
let canvasList = [
    document.getElementById("canvas1"),
    document.getElementById("canvas2"),
    document.getElementById("canvas3"),
    document.getElementById("canvas4")
];
let retakeButtons = document.querySelectorAll(".retake-btn");
let photoTaken = [false, false, false, false];
let photoCount = 0;

function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
        })
        .catch((error) => {
            console.error("Gagal mengakses kamera:", error);
        });
}

function startCountdown() {
    if (photoCount >= 4) return;

    let count = 3;
    timerDisplay.innerText = count;
    let countdown = setInterval(() => {
        count--;
        timerDisplay.innerText = count;
        if (count === 0) {
            clearInterval(countdown);
            timerDisplay.innerText = "";
            takeSnapshot();
        }
    }, 1000);
}

function takeSnapshot() {
    if (photoCount >= 4) return;

    let canvas = canvasList[photoCount];
    let context = canvas.getContext("2d");
    // ukuran asli:
    canvas.width = 400;
    canvas.height = 200;

    // canvas.width = 500;
    // canvas.height = 400;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    retakeButtons[photoCount].classList.remove("hidden");
    photoTaken[photoCount] = true;
    photoCount++;

    if (photoTaken.every(taken => taken)) {
        document.getElementById("downloadAll").classList.remove("hidden");
        document.getElementById("downloadMerged").classList.remove("hidden");
    }
}

function retakePhoto(index) {
    let canvas = canvasList[index];
    let context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    retakeButtons[index].classList.add("hidden");
    photoTaken[index] = false;
    photoCount--;

    startCountdown();
}

function downloadMergedPhoto() {
    let canvases = document.querySelectorAll("#photo-container canvas");

    if (canvases.length === 0) {
        alert("Tidak ada foto yang bisa didownload!");
        return;
    }

    let canvasWidth = canvases[0].width;
    let canvasHeight = canvases[0].height;
    let cols = Math.ceil(Math.sqrt(canvases.length)); // Mengatur grid kolom
    let rows = Math.ceil(canvases.length / cols); // Menghitung baris berdasarkan jumlah foto
    let mergedCanvas = document.createElement("canvas");
    let ctx = mergedCanvas.getContext("2d");

    mergedCanvas.width = cols * canvasWidth;
    mergedCanvas.height = rows * canvasHeight;

    canvases.forEach((canvas, i) => {
        let x = (i % cols) * canvasWidth;
        let y = Math.floor(i / cols) * canvasHeight;
        ctx.drawImage(canvas, x, y, canvasWidth, canvasHeight);
    });

    let link = document.createElement("a");
    link.href = mergedCanvas.toDataURL("image/png");
    link.download = "foto_gabungan.png";
    link.click();
}


function downloadContainerAsImage() {
    let container = document.getElementById("photo-container");

    if (!container) {
        alert("Elemen #photo-container tidak ditemukan!");
        return;
    }

    html2canvas(container).then(canvas => {
        let link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "photo_container.png";
        link.click();
    });
}

function downloadAllPhotos() {
    let zip = new JSZip();
    canvasList.forEach((canvas, index) => {
        let dataURL = canvas.toDataURL("image/png");
        let imgData = dataURL.split(",")[1];
        zip.file(`foto${index + 1}.png`, imgData, { base64: true });
    });

    zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, "semua_foto.zip");
    });
}
