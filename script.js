// Data operator
const operators = [
    { id: 1, name: "Operator 1", color: "#3498db", currentNumber: null, status: "idle" },
    { id: 2, name: "Operator 2", color: "#2ecc71", currentNumber: null, status: "idle" },
    { id: 3, name: "Operator 3", color: "#e74c3c", currentNumber: null, status: "idle" },
    { id: 4, name: "Operator 4", color: "#f39c12", currentNumber: null, status: "idle" },
    { id: 5, name: "Operator 5", color: "#9b59b6", currentNumber: null, status: "idle" },
    { id: 6, name: "Operator 6", color: "#1abc9c", currentNumber: null, status: "idle" },
    { id: 7, name: "Operator 7", color: "#d35400", currentNumber: null, status: "idle" },
    { id: 8, name: "Operator 8", color: "#34495e", currentNumber: null, status: "idle" }
];

// Inisialisasi variabel
let currentAntrianNumber = "A001";
let selectedOperator = null;
let callHistory = [];
let totalCalled = 0;

// Elemen DOM
const currentNumberElement = document.getElementById('current-number');
const currentOperatorElement = document.getElementById('current-operator');
const antrianNumberInput = document.getElementById('antrian-number');
const operatorSelect = document.getElementById('operator-select');
const operatorGrid = document.getElementById('operator-grid');
const operatorsContainer = document.getElementById('operators-container');
const callBtn = document.getElementById('call-btn');
const resetBtn = document.getElementById('reset-btn');
const skipBtn = document.getElementById('skip-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const testVoiceBtn = document.getElementById('test-voice');
const historyList = document.getElementById('history-list');
const totalCalledElement = document.getElementById('total-called');
const volumeControl = document.getElementById('volume');
const voiceStatusElement = document.getElementById('voice-status');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notification-text');
const currentTimeElement = document.getElementById('current-time');

// Speech Synthesis
const speech = window.speechSynthesis;
let voices = [];
let voiceReady = false;

// Inisialisasi suara
function initializeVoice() {
    // Tunggu sampai voices tersedia (terutama di Chrome)
    setTimeout(() => {
        voices = speech.getVoices();
        
        // Cari voice wanita berbahasa Indonesia atau Inggris
        const femaleVoice = voices.find(voice => 
            (voice.lang.startsWith('id') || voice.lang.startsWith('en')) && 
            voice.name.toLowerCase().includes('female')
        ) || voices.find(voice => 
            voice.lang.startsWith('id') || voice.lang.startsWith('en')
        ) || voices[0];
        
        if (femaleVoice) {
            voiceReady = true;
            voiceStatusElement.textContent = "Suara siap digunakan";
            voiceStatusElement.style.color = "#27ae60";
        } else {
            voiceStatusElement.textContent = "Suara tidak tersedia, gunakan browser lain";
            voiceStatusElement.style.color = "#e74c3c";
        }
    }, 500);
}

// Fungsi untuk mengucapkan teks
function speakText(text) {
    if (!voiceReady || speech.speaking) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice jika tersedia
    const femaleVoice = voices.find(voice => 
        (voice.lang.startsWith('id') || voice.lang.startsWith('en')) && 
        voice.name.toLowerCase().includes('female')
    ) || voices.find(voice => 
        voice.lang.startsWith('id') || voice.lang.startsWith('en')
    );
    
    if (femaleVoice) {
        utterance.voice = femaleVoice;
        utterance.lang = femaleVoice.lang;
    }
    
    // Atur volume dari kontrol
    utterance.volume = parseFloat(volumeControl.value);
    utterance.rate = 0.9; // Sedikit lebih lambat untuk kejelasan
    utterance.pitch = 1.1; // Sedikit lebih tinggi untuk suara wanita
    
    speech.speak(utterance);
}

// Inisialisasi operator
function initializeOperators() {
    // Isi dropdown operator
    operatorSelect.innerHTML = '<option value="">-- Pilih Operator --</option>';
    operators.forEach(operator => {
        const option = document.createElement('option');
        option.value = operator.id;
        option.textContent = operator.name;
        operatorSelect.appendChild(option);
    });
    
    // Isi grid operator
    operatorGrid.innerHTML = '';
    operators.forEach(operator => {
        const button = document.createElement('button');
        button.className = 'operator-btn';
        button.textContent = operator.name;
        button.dataset.id = operator.id;
        
        button.addEventListener('click', () => {
            selectOperator(operator.id);
        });
        
        operatorGrid.appendChild(button);
    });
    
    // Isi panel operator
    operatorsContainer.innerHTML = '';
    operators.forEach(operator => {
        const panel = document.createElement('div');
        panel.className = 'operator-panel';
        panel.id = `operator-panel-${operator.id}`;
        
        panel.innerHTML = `
            <div class="operator-header" style="background-color: ${operator.color}">
                ${operator.name}
            </div>
            <div class="operator-content">
                <div class="operator-number" id="operator-number-${operator.id}">
                    ${operator.currentNumber || '-'}
                </div>
                <div class="operator-status status-${operator.status}" id="operator-status-${operator.id}">
                    ${operator.status === 'idle' ? 'Menunggu' : 'Melayani'}
                </div>
            </div>
        `;
        
        operatorsContainer.appendChild(panel);
    });
}

// Pilih operator
function selectOperator(operatorId) {
    selectedOperator = operators.find(op => op.id === operatorId);
    
    // Update tampilan tombol operator
    document.querySelectorAll('.operator-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.id) === operatorId) {
            btn.classList.add('active');
        }
    });
    
    // Update dropdown
    operatorSelect.value = operatorId;
    
    // Update panel operator
    updateOperatorPanels();
}

// Update panel operator
function updateOperatorPanels() {
    operators.forEach(operator => {
        const panel = document.getElementById(`operator-panel-${operator.id}`);
        const numberElement = document.getElementById(`operator-number-${operator.id}`);
        const statusElement = document.getElementById(`operator-status-${operator.id}`);
        
        numberElement.textContent = operator.currentNumber || '-';
        statusElement.textContent = operator.status === 'idle' ? 'Menunggu' : 'Melayani';
        statusElement.className = `operator-status status-${operator.status}`;
        
        if (selectedOperator && operator.id === selectedOperator.id) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });
}

// Format waktu
function formatTime(date) {
    return date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
}

// Format tanggal
function formatDate(date) {
    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Update waktu saat ini
function updateCurrentTime() {
    const now = new Date();
    currentTimeElement.textContent = `${formatDate(now)} | ${formatTime(now)}`;
}

// Tampilkan notifikasi
function showNotification(message, duration = 3000) {
    notificationText.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, duration);
}

// Panggil antrian
function callAntrian() {
    if (!selectedOperator) {
        showNotification("Silakan pilih operator terlebih dahulu!");
        return;
    }
    
    if (!antrianNumberInput.value.trim()) {
        showNotification("Silakan masukkan nomor antrian!");
        return;
    }
    
    const antrianNumber = antrianNumberInput.value.trim();
    
    // Update antrian saat ini
    currentNumberElement.textContent = antrianNumber;
    currentOperatorElement.textContent = selectedOperator.name;
    
    // Update operator
    selectedOperator.currentNumber = antrianNumber;
    selectedOperator.status = 'active';
    
    // Tambahkan ke riwayat
    const callRecord = {
        number: antrianNumber,
        operator: selectedOperator.name,
        time: new Date(),
        timestamp: Date.now()
    };
    
    callHistory.unshift(callRecord);
    totalCalled++;
    
    // Update tampilan
    updateHistory();
    updateOperatorPanels();
    totalCalledElement.textContent = totalCalled;
    
    // Ucapkan panggilan
    const announcement = `Nomor antrian ${antrianNumber}, silakan menuju ${selectedOperator.name}.`;
    speakText(announcement);
    
    // Tampilkan notifikasi
    showNotification(`Memanggil antrian ${antrianNumber} ke ${selectedOperator.name}`);
    
    // Reset input
    antrianNumberInput.value = '';
    
    // Auto increment untuk antrian berikutnya
    const match = antrianNumber.match(/([A-Za-z]*)(\d+)/);
    if (match) {
        const prefix = match[1];
        const number = parseInt(match[2]);
        currentAntrianNumber = `${prefix}${(number + 1).toString().padStart(match[2].length, '0')}`;
        antrianNumberInput.value = currentAntrianNumber;
    }
}

// Update riwayat panggilan
function updateHistory() {
    historyList.innerHTML = '';
    
    // Tampilkan maksimal 10 riwayat terbaru
    const recentHistory = callHistory.slice(0, 10);
    
    recentHistory.forEach(record => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        historyItem.innerHTML = `
            <span class="number">${record.number}</span>
            <span class="operator">${record.operator}</span>
            <span class="time">${formatTime(record.time)}</span>
        `;
        
        historyList.appendChild(historyItem);
    });
}

// Reset sistem
function resetSystem() {
    if (confirm("Apakah Anda yakin ingin mereset sistem? Semua data antrian akan dihapus.")) {
        operators.forEach(operator => {
            operator.currentNumber = null;
            operator.status = 'idle';
        });
        
        selectedOperator = null;
        callHistory = [];
        totalCalled = 0;
        currentAntrianNumber = "A001";
        
        currentNumberElement.textContent = '-';
        currentOperatorElement.textContent = '-';
        antrianNumberInput.value = currentAntrianNumber;
        operatorSelect.value = '';
        
        document.querySelectorAll('.operator-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        updateHistory();
        updateOperatorPanels();
        totalCalledElement.textContent = '0';
        
        showNotification("Sistem telah direset");
    }
}

// Lewati antrian
function skipAntrian() {
    if (!selectedOperator) {
        showNotification("Silakan pilih operator terlebih dahulu!");
        return;
    }
    
    if (!antrianNumberInput.value.trim()) {
        showNotification("Silakan masukkan nomor antrian!");
        return;
    }
    
    const antrianNumber = antrianNumberInput.value.trim();
    
    // Auto increment untuk antrian berikutnya
    const match = antrianNumber.match(/([A-Za-z]*)(\d+)/);
    if (match) {
        const prefix = match[1];
        const number = parseInt(match[2]);
        currentAntrianNumber = `${prefix}${(number + 1).toString().padStart(match[2].length, '0')}`;
        antrianNumberInput.value = currentAntrianNumber;
    }
    
    showNotification(`Antrian ${antrianNumber} dilewati`);
}

// Event Listeners
callBtn.addEventListener('click', callAntrian);
resetBtn.addEventListener('click', resetSystem);
skipBtn.addEventListener('click', skipAntrian);

prevBtn.addEventListener('click', () => {
    if (!antrianNumberInput.value.trim()) return;
    
    const match = antrianNumberInput.value.match(/([A-Za-z]*)(\d+)/);
    if (match) {
        const prefix = match[1];
        const number = parseInt(match[2]);
        if (number > 1) {
            antrianNumberInput.value = `${prefix}${(number - 1).toString().padStart(match[2].length, '0')}`;
        }
    }
});

nextBtn.addEventListener('click', () => {
    if (!antrianNumberInput.value.trim()) {
        antrianNumberInput.value = currentAntrianNumber;
        return;
    }
    
    const match = antrianNumberInput.value.match(/([A-Za-z]*)(\d+)/);
    if (match) {
        const prefix = match[1];
        const number = parseInt(match[2]);
        antrianNumberInput.value = `${prefix}${(number + 1).toString().padStart(match[2].length, '0')}`;
    }
});

testVoiceBtn.addEventListener('click', () => {
    if (!voiceReady) {
        showNotification("Suara belum siap. Mohon tunggu atau gunakan browser lain.");
        return;
    }
    
    const testMessage = "Ini adalah uji suara sistem antrian S P M B SMA Negeri 1 Magetan.";
    speakText(testMessage);
    showNotification("Mengucapkan pesan uji suara...");
});

operatorSelect.addEventListener('change', (e) => {
    if (e.target.value) {
        selectOperator(parseInt(e.target.value));
    }
});

volumeControl.addEventListener('input', () => {
    const volume = parseFloat(volumeControl.value);
    voiceStatusElement.textContent = `Volume suara: ${Math.round(volume * 100)}%`;
});

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi suara
    initializeVoice();
    
    // Inisialisasi operator
    initializeOperators();
    
    // Set nilai awal
    antrianNumberInput.value = currentAntrianNumber;
    updateCurrentTime();
    updateOperatorPanels();
    
    // Perbarui waktu setiap detik
    setInterval(updateCurrentTime, 1000);
    
    // Event listener untuk tombol keyboard
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && document.activeElement !== antrianNumberInput) {
            callAntrian();
        }
        
        if (e.key === 'Escape') {
            antrianNumberInput.focus();
            antrianNumberInput.select();
        }
    });
    
    // Pilih operator pertama secara default
    if (operators.length > 0) {
        selectOperator(1);
    }
    
    // Event listener untuk perubahan voices
    speech.addEventListener('voiceschanged', initializeVoice);
});

// Jaga agar halaman tidak tertutup dengan konfirmasi
window.addEventListener('beforeunload', (e) => {
    if (totalCalled > 0) {
        e.preventDefault();
        e.returnValue = 'Data antrian akan hilang jika Anda meninggalkan halaman. Apakah Anda yakin?';
    }
});