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
const photoArea3 = document.getElementById('template3');
const photoArea4 = document.getElementById('template4');

// warna default
const defaultStart = '#696870';
const defaultEnd = '#474549';

// fungsi update gradasi
function updateGradient() {
    const start = colorStart.value;
    const end = colorEnd.value;
    photoArea1.style.backgroundImage = `linear-gradient(to right, ${start}, ${end})`;
    photoArea2.style.backgroundImage = `linear-gradient(to right, ${start}, ${end})`;
    photoArea3.style.backgroundImage = `linear-gradient(to right, ${start}, ${end})`;
    photoArea4.style.backgroundImage = `linear-gradient(to right, ${start}, ${end})`;
}

// fungsi reset gradasi
function resetGradient() {
    colorStart.value = defaultStart;
    colorEnd.value = defaultEnd;
    photoArea1.style.backgroundImage = `linear-gradient(to right, ${defaultStart}, ${defaultEnd})`;
    photoArea2.style.backgroundImage = `linear-gradient(to right, ${defaultStart}, ${defaultEnd})`;
    photoArea3.style.backgroundImage = `linear-gradient(to right, ${defaultStart}, ${defaultEnd})`;
    photoArea4.style.backgroundImage = `linear-gradient(to right, ${defaultStart}, ${defaultEnd})`;
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
    document.getElementById("canvas4"),
    document.getElementById("canvas5"),
    document.getElementById("canvas6"),
    document.getElementById("canvas7"), // canvas tambahan untuk template 4
    document.getElementById("canvas8")
];
let retakeButtons = document.querySelectorAll(".retake-btn");
let photoTaken = Array(8).fill(false);
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
    if (photoCount >= 8) return;

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
    if (photoCount >= 8) return;

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
    // Jika opsi "1" dipilih, sembunyikan semua elemen
    if (selectedTemplate === "1") {
        document.getElementById("photo-container").classList.add("hidden");
    } else if (selectedTemplate === "template3") {
        // Jika template3 dipilih, sinkronkan konten kanvas
        syncCanvasContent("canvas1", "canvas1_copy");
        syncCanvasContent("canvas2", "canvas2_copy");
        syncCanvasContent("canvas3", "canvas3_copy");
        syncCanvasContent("canvas4", "canvas4_copy");
        syncCanvasContent("canvas5", "canvas5_copy");
        syncCanvasContent("canvas6", "canvas6_copy");
    }  else {
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

    // Sembunyikan elemen yang tidak perlu terlihat
    const excludedElements = selectedTemplate.querySelectorAll(".no-capture, .upload-btn, label[for]");
    excludedElements.forEach(el => el.style.display = "none");

    // Tangani canvas agar tidak membesar berlebihan → batasi max-width
    const canvases = selectedTemplate.querySelectorAll("canvas");
    const originalCanvasStyles = [];

    canvases.forEach((canvas, i) => {
        originalCanvasStyles[i] = {
            width: canvas.style.width,
            height: canvas.style.height,
            maxWidth: canvas.style.maxWidth
        };

        // ✅ Gunakan ukuran proporsional (bukan paksa pixel penuh)
        // ladscape
        canvas.style.width = "100%";
        canvas.style.height = "auto";
        canvas.style.maxWidth = "600px";
        // potreit
        // canvas.style.width = "100%";
        // canvas.style.height = "400px";
        // canvas.style.maxWidth = "100%"; 

    });

    html2canvas(selectedTemplate, {
        backgroundColor: null,
        useCORS: true,
        scale: 2,
        scrollX: 0,
        scrollY: -window.scrollY
    }).then(canvas => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `template_${selectedTemplateId}-${dateStr}.png`;
        link.click();

        // Kembalikan style canvas seperti semula
        canvases.forEach((canvas, i) => {
            canvas.style.width = originalCanvasStyles[i].width;
            canvas.style.height = originalCanvasStyles[i].height;
            canvas.style.maxWidth = originalCanvasStyles[i].maxWidth;
        });

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
    } else if (selectedTemplate === "template3") {
        syncCanvasContent("canvas1", "canvas3_only");
    } else if (selectedTemplate === "template4") {
        syncCanvasContent("canvas1", "canvas5_copy");
        syncCanvasContent("canvas2", "canvas6_copy");
        syncCanvasContent("canvas3", "canvas7_copy");
        syncCanvasContent("canvas4", "canvas8_copy");
        // Tambahkan sesuai jumlah
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


// fitur tambah file dari internal
function uploadToCanvas(event, index) {
    const file = event.target.files[0];
    if (!file) return;

    const canvas = canvasList[index];
    const context = canvas.getContext("2d");

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            canvas.width = 2560;
            canvas.height = 1440;

            const canvasAspect = canvas.width / canvas.height;
            const imgAspect = img.width / img.height;

            let sx, sy, sWidth, sHeight;

            if (imgAspect > canvasAspect) {
                sHeight = img.height;
                sWidth = sHeight * canvasAspect;
                sx = (img.width - sWidth) / 2;
                sy = 0;
            } else {
                sWidth = img.width;
                sHeight = sWidth / canvasAspect;
                sx = 0;
                sy = (img.height - sHeight) / 2;
            }

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);

            retakeButtons[index].classList.remove("hidden");
            photoTaken[index] = true;

            if (photoTaken.every(taken => taken)) {
                document.getElementById("downloadAll")?.classList.remove("hidden");
                document.getElementById("downloadMerged")?.classList.remove("hidden");
            }

            // Sinkronisasi ke canvas template lain
            if (document.getElementById("templateSelector").value === "template1") {
                syncCanvasContent(`canvas${index + 1}`, `canvas${index + 1}_copy`);
            } else {
                syncCanvasContent(`canvas${index + 1}_copy`, `canvas${index + 1}`);
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}



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
        scale: 1
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

uploadToCanvasById(event, 'canvas3_only')

//   fungsi uploadToCanvasById 
function uploadToCanvasById(event, canvasId) {
    const file = event.target.files[0];
    if (!file) return;

    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const context = canvas.getContext("2d");

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            // canvas.width = 2560;
            // canvas.height = 1440;

            canvas.width = 1080;    // potret
            canvas.height = 1440;


            const canvasAspect = canvas.width / canvas.height;
            const imgAspect = img.width / img.height;

            let sx, sy, sWidth, sHeight;

            if (imgAspect > canvasAspect) {
                sHeight = img.height;
                sWidth = sHeight * canvasAspect;
                sx = (img.width - sWidth) / 2;
                sy = 0;
            } else {
                sWidth = img.width;
                sHeight = sWidth / canvasAspect;
                sx = 0;
                sy = (img.height - sHeight) / 2;
            }

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}
