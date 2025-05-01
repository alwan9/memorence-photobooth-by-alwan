let video = document.getElementById("video");
let timerDisplay = document.getElementById("timer");
const timeSelect = document.getElementById("timeSelect");
let countdown; // supaya bisa clearInterval kalau pilih baru
let selectedTime = 1; // default 1 detik, seperti awal

//  agar format nama download menggunakan tanggah hari ini
let d = new Date();
let dateStr = `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;


// foto menjadi full screen
const canvases = document.querySelectorAll('#template1 canvas');
const overlay = document.getElementById('fullscreenOverlay');
const fullscreenCanvas = document.getElementById('fullscreenCanvas');
const ctx = fullscreenCanvas.getContext('2d');

canvases.forEach(canvas => {
    canvas.addEventListener('click', () => {
        // Sesuaikan ukuran canvas overlay
        fullscreenCanvas.width = canvas.width;
        fullscreenCanvas.height = canvas.height;

        // Gambar ulang isi canvas ke fullscreenCanvas
        ctx.clearRect(0, 0, fullscreenCanvas.width, fullscreenCanvas.height);
        ctx.drawImage(canvas, 0, 0);

        overlay.classList.remove('hidden');
    });
});

// Klik overlay untuk keluar
overlay.addEventListener('click', () => {
    overlay.classList.add('hidden');
});

// ambil elemen
const colorStart = document.getElementById('colorStart');
const colorEnd = document.getElementById('colorEnd');
const photoArea1 = document.getElementById('template1');
const photoArea2 = document.getElementById('template2');

// warna default
const defaultStart = '#270f7e';
const defaultEnd = '#4b10b9';

// fungsi update gradasi
function updateGradient() {
    const start = colorStart.value;
    const end = colorEnd.value;
    photoArea1.style.backgroundImage = `linear-gradient(to right, ${start}, ${end})`;
    photoArea2.style.backgroundImage = `linear-gradient(to right, ${start}, ${end})`;
}

// fungsi reset gradasi
function resetGradient() {
    colorStart.value = defaultStart;
    colorEnd.value = defaultEnd;
    photoArea1.style.backgroundImage = `linear-gradient(to right, ${defaultStart}, ${defaultEnd})`;
    photoArea2.style.backgroundImage = `linear-gradient(to right, ${defaultStart}, ${defaultEnd})`;
}

// pas input warna berubah, update gradasi
colorStart.addEventListener('input', updateGradient);
colorEnd.addEventListener('input', updateGradient);

// set default gradasi saat halaman load
window.addEventListener('DOMContentLoaded', resetGradient);


let canvasList = [
    document.getElementById("canvas1"),
    document.getElementById("canvas2"),
    document.getElementById("canvas3"),
    document.getElementById("canvas4")
];
let retakeButtons = document.querySelectorAll(".retake-btn");
let photoTaken = [false, false, false, false];
let photoCount = 0;

document.addEventListener("DOMContentLoaded", () => {
    startCamera();
});



function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
        })
        .catch((error) => {
            console.error("Gagal mengakses kamera:", error);
        });
}


timeSelect.addEventListener("change", function () {
    let value = parseInt(this.value);
    if (!isNaN(value)) {
        selectedTime = value;
    }
});

function startCountdown() {
    if (photoCount >= 4) return;

    let count = selectedTime; // pakai waktu yang dipilih
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

} function takeSnapshot() {
    if (photoCount >= 4) return;

    let canvas = canvasList[photoCount];
    let context = canvas.getContext("2d");

    // Set resolusi UHD/2K tetap
    canvas.width = 2560;
    canvas.height = 1440;

    drawVideoWithCoverStyle(video, context, canvas);

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
    photoTaken[index] = false;

    let count = selectedTime;
    timerDisplay.innerText = count;

    countdown = setInterval(() => {
        count--;
        timerDisplay.innerText = count;
        if (count === 0) {
            clearInterval(countdown);
            timerDisplay.innerText = "";

            canvas.width = 2560;
            canvas.height = 1440;

            drawVideoWithCoverStyle(video, context, canvas);

            retakeButtons[index].classList.remove("hidden");
            photoTaken[index] = true;

            if (photoTaken.every(taken => taken)) {
                document.getElementById("downloadAll").classList.remove("hidden");
                document.getElementById("downloadMerged").classList.remove("hidden");
            }
        }
    }, 1000);
}
function drawVideoWithCoverStyle(video, context, canvas) {
    const canvasAspect = canvas.width / canvas.height;
    const videoAspect = video.videoWidth / video.videoHeight;

    let sx, sy, sWidth, sHeight;

    if (videoAspect > canvasAspect) {
        // Video terlalu lebar → crop kiri/kanan
        sHeight = video.videoHeight;
        sWidth = sHeight * canvasAspect;
        sx = (video.videoWidth - sWidth) / 2;
        sy = 0;
    } else {
        // Video terlalu tinggi → crop atas/bawah
        sWidth = video.videoWidth;
        sHeight = sWidth / canvasAspect;
        sx = 0;
        sy = (video.videoHeight - sHeight) / 2;
    }

    context.save();
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
    context.restore();
}


function downloadMergedPhoto() {
    let canvases = document.querySelectorAll("#photo-container canvas");

    if (canvases.length === 0) {
        alert("Tidak ada foto yang bisa didownload!");
        return;
    }

    let canvasWidth = canvases[0].width;
    let canvasHeight = canvases[0].height;
    let cols = Math.ceil(Math.sqrt(canvases.length));
    let rows = Math.ceil(canvases.length / cols);
    let mergedCanvas = document.createElement("canvas");
    let ctx = mergedCanvas.getContext("2d");

    mergedCanvas.width = cols * canvasWidth;
    mergedCanvas.height = rows * canvasHeight;

    canvases.forEach((canvas, i) => {
        let x = (i % cols) * canvasWidth;
        let y = Math.floor(i / cols) * canvasHeight;
        ctx.drawImage(canvas, x, y, canvasWidth, canvasHeight);
    });

    let dateStr = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
    let link = document.createElement("a");
    link.href = mergedCanvas.toDataURL("image/png");
    link.download = `foto_gabungan-${dateStr}.png`;
    link.click();
}


document.getElementById("templateSelector").addEventListener("change", function () {
    let selectedTemplate = this.value;

    // Sembunyikan semua elemen yang terkait dengan photobooth
    document.querySelectorAll(".template").forEach(template => {
        template.classList.add("hidden");
    });

    // Jika opsi "1" dipilih, sembunyikan semua elemen
    if (selectedTemplate === "1") {
        document.getElementById("photo-container").classList.add("hidden");
    } else {
        // Jika opsi lain dipilih, tampilkan template sesuai pilihan
        document.getElementById(selectedTemplate).classList.remove("hidden");
        document.getElementById("photo-container").classList.remove("hidden");
    }
});

function downloadSelectedTemplate() {
    const selectedTemplateId = document.getElementById("templateSelector").value;
    const selectedTemplate = document.getElementById(selectedTemplateId);

    if (!selectedTemplate) {
        alert("Template tidak ditemukan!");
        return;
    }

    // Sembunyikan elemen dengan class 'no-capture'
    const excludedElements = selectedTemplate.querySelectorAll(".no-capture");
    excludedElements.forEach(el => el.style.display = "none");

    // Gunakan html2canvas untuk menangkap template aktif
    html2canvas(selectedTemplate, {
        backgroundColor: null,
        useCORS: true,
        scale: 2
    }).then(canvas => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `template_${selectedTemplateId}-${dateStr}.png`;
        link.click();

        // Tampilkan kembali elemen yang disembunyikan
        excludedElements.forEach(el => el.style.display = "");
    });
}

function syncCanvasContent(sourceId, targetId) {
    const sourceCanvas = document.getElementById(sourceId);
    const targetCanvas = document.getElementById(targetId);

    if (!sourceCanvas || !targetCanvas) return;

    targetCanvas.width = sourceCanvas.width;
    targetCanvas.height = sourceCanvas.height;

    const sourceCtx = sourceCanvas.getContext('2d');
    const targetCtx = targetCanvas.getContext('2d');

    const imageData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    targetCtx.putImageData(imageData, 0, 0);
}

document.getElementById("templateSelector").addEventListener("change", function () {
    let selectedTemplate = this.value;

    // Sembunyikan semua template
    document.querySelectorAll(".template").forEach(template => {
        template.classList.add("hidden");
    });

    // Sinkronisasi canvas jika pindah template
    if (selectedTemplate === "template1") {
        syncCanvasContent("canvas1_copy", "canvas1");
        syncCanvasContent("canvas2_copy", "canvas2");
        syncCanvasContent("canvas3_copy", "canvas3");
        syncCanvasContent("canvas4_copy", "canvas4");
    } else if (selectedTemplate === "template2") {
        syncCanvasContent("canvas1", "canvas1_copy");
        syncCanvasContent("canvas2", "canvas2_copy");
        syncCanvasContent("canvas3", "canvas3_copy");
        syncCanvasContent("canvas4", "canvas4_copy");
    }

    // Tampilkan template yang dipilih
    document.getElementById(selectedTemplate).classList.remove("hidden");
});



// tanggalan otomatis di template
const tanggalElemen = document.getElementById("tanggal");

const namaHari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const sekarang = new Date();
const hari = namaHari[sekarang.getDay()];
const tanggal = sekarang.getDate();
const bulan = namaBulan[sekarang.getMonth()];
const tahun = sekarang.getFullYear();

tanggalElemen.innerText = `${hari}, ${tanggal} ${bulan} ${tahun}`;



// fitur cetak 
function printTemplate() {
    const selectedTemplateId = document.getElementById("templateSelector").value;
    const selectedTemplate = document.getElementById(selectedTemplateId);

    // Sembunyikan elemen no-capture sementara
    const hiddenEls = selectedTemplate.querySelectorAll(".no-capture");
    hiddenEls.forEach(el => el.style.display = "none");

    html2canvas(selectedTemplate, {
        useCORS: true,
        backgroundColor: null,
        scale: 2
    }).then(canvas => {
        const dataURL = canvas.toDataURL("image/png");

        // Buat jendela print
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Cetak Template</title>
                <style>
                    body {
                        margin: 0;
                        padding-top: 0 ;
                        padding-left: 15%;
                        padding-right: 15%;
                        text-align: center;
                        background: #fff;
                    }
                    @page {
                        size: A4 landscape;
                        margin: 0;
                    }
                    .container {
                        display: grid;
                        grid-template-columns: repeat(4, 30%); /* Dua gambar per baris */
                        grid-template-rows: repeat(4, auto); /* Dua baris */
                        gap: 10px;
                        justify-content: center;
                        align-items: center;
                        margin-top: 10px;
                         
                    }
                    img {
                     rotate: 90%;
                        width: 100%;
                        height: auto;
                   
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <img src="${dataURL}" />
                    <img src="${dataURL}" />
                    <img src="${dataURL}" />
                    <img src="${dataURL}" />
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);

        // Tampilkan kembali elemen tersembunyi
        hiddenEls.forEach(el => el.style.display = "");
    });
}

// fitur darkmode
function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
  }

