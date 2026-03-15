// API Base URL
const API_URL = '/api/vibration';

// Chart instances
let magnitudeChart;
let axisChart;

// Data arrays for charts (keeping last 50 points)
const MAX_DATA_POINTS = 50;
let labels = [];
let magnitudeData = [];
let axData = [];
let ayData = [];
let azData = [];

// DOM Elements
const currentMagnitudeEl = document.getElementById('current-magnitude');
const currentStatusEl = document.getElementById('current-status');
const peakMagnitudeEl = document.getElementById('peak-magnitude');
const lastUpdateEl = document.getElementById('last-update');
const tableBodyEl = document.getElementById('table-body');
const exportExcelBtn = document.getElementById('export-excel');
const exportPdfBtn = document.getElementById('export-pdf');

// Modal Elements
const exportModal = document.getElementById('export-modal');
const closeModalBtn = document.getElementById('close-modal');
const cancelExportBtn = document.getElementById('cancel-export');
const confirmExportBtn = document.getElementById('confirm-export');
const exportStartInput = document.getElementById('export-start');
const exportEndInput = document.getElementById('export-end');
const exportErrorMsg = document.getElementById('export-error');

// Settings Elements
const warningThresholdInput = document.getElementById('warning-threshold');
const criticalThresholdInput = document.getElementById('critical-threshold');
const pollingRateSelect = document.getElementById('polling-rate');
const themeSelect = document.getElementById('theme-select');
const saveSettingsBtn = document.getElementById('save-settings');
const settingsStatus = document.getElementById('settings-status');
const navItems = document.querySelectorAll('.nav-item');
const sections = {
    dashboard: [document.querySelector('.kpi-section'), document.querySelector('.charts-section')],
    history: [document.getElementById('history')],
    settings: [document.getElementById('settings')]
};

// State
let peakMagnitude = 0;
let fullDataHistory = [];
let currentExportType = 'excel';
let pollingInterval = null;

// Initialize Charts on Load
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    fetchRecentData();
    fetchSettings();

    // Set up polling
    startPolling(parseInt(pollingRateSelect.value));

    // Event Listeners for Export
    exportExcelBtn.addEventListener('click', () => openExportModal('excel'));
    exportPdfBtn.addEventListener('click', () => openExportModal('pdf'));

    // Modal Event Listeners
    closeModalBtn.addEventListener('click', closeExportModal);
    cancelExportBtn.addEventListener('click', closeExportModal);
    confirmExportBtn.addEventListener('click', handleExportConfirm);
    
    // Settings Event Listeners
    saveSettingsBtn.addEventListener('click', saveSettings);
    themeSelect.addEventListener('change', (e) => toggleTheme(e.target.value));
    pollingRateSelect.addEventListener('change', (e) => startPolling(parseInt(e.target.value)));
    
    // Nav Event Listeners
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.getAttribute('data-target');
            switchTab(target);
            
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
        });
    });
});

function startPolling(intervalMs) {
    if (pollingInterval) clearInterval(pollingInterval);
    pollingInterval = setInterval(fetchRecentData, intervalMs);
}

function switchTab(target) {
    // Hide all
    Object.values(sections).forEach(sectionArray => {
        sectionArray.forEach(el => el.classList.add('hidden'));
    });
    // Show target
    sections[target].forEach(el => el.classList.remove('hidden'));
}

function toggleTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
}

function fetchSettings() {
    fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
            warningThresholdInput.value = data.warningThreshold;
            criticalThresholdInput.value = data.criticalThreshold;
        })
        .catch(err => console.error("Error fetching settings:", err));
}

function saveSettings() {
    const newSettings = {
        warningThreshold: parseFloat(warningThresholdInput.value),
        criticalThreshold: parseFloat(criticalThresholdInput.value)
    };
    
    fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
    })
    .then(res => res.json())
    .then(data => {
        settingsStatus.classList.remove('hidden');
        setTimeout(() => settingsStatus.classList.add('hidden'), 3000);
    })
    .catch(err => console.error("Error saving settings:", err));
}

function initCharts() {
    // 1. Magnitude Chart
    const magCtx = document.getElementById('magnitudeChart').getContext('2d');

    const gradientFill = magCtx.createLinearGradient(0, 0, 0, 300);
    gradientFill.addColorStop(0, 'rgba(59, 130, 246, 0.5)'); // Blue
    gradientFill.addColorStop(1, 'rgba(59, 130, 246, 0.0)'); // Transparent blue

    magnitudeChart = new Chart(magCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Vibration Magnitude (g)',
                data: magnitudeData,
                borderColor: '#3b82f6',
                backgroundColor: gradientFill,
                borderWidth: 2,
                pointRadius: 1,
                pointHoverRadius: 5,
                fill: true,
                tension: 0.4 // Smooth curve
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                x: { display: false }, // Hide x labels for real-time feel
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#94a3b8' },
                    suggestedMin: 0,
                    suggestedMax: 3
                }
            },
            animation: {
                duration: 0 // Disable animation for real-time updates
            }
        }
    });

    // 2. Axis Chart
    const axisCtx = document.getElementById('axisChart').getContext('2d');
    axisChart = new Chart(axisCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Ax',
                    data: axData,
                    borderColor: '#f43f5e', // Rose
                    borderWidth: 1.5,
                    pointRadius: 0,
                    tension: 0.3
                },
                {
                    label: 'Ay',
                    data: ayData,
                    borderColor: '#10b981', // Emerald
                    borderWidth: 1.5,
                    pointRadius: 0,
                    tension: 0.3
                },
                {
                    label: 'Az',
                    data: azData,
                    borderColor: '#8b5cf6', // Purple
                    borderWidth: 1.5,
                    pointRadius: 0,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: '#e2e8f0', usePointStyle: true, boxWidth: 8 }
                }
            },
            scales: {
                x: { display: false },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' }
                }
            },
            animation: { duration: 0 }
        }
    });
}

function fetchRecentData() {
    fetch(`${API_URL}/recent`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (data && data.length > 0) {
                // Backend returns descending (newest first). 
                // We want oldest left, newest right for charts -> reverse
                const displayData = [...data].reverse();
                fullDataHistory = data; // Keep raw for table (newest first)
                updateDashboard(displayData, data[0]);
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

function updateDashboard(chartRecords, latestRecord) {
    // Determine Peak
    let currentMax = 0;
    chartRecords.forEach(r => {
        if (r.vibrationValue > currentMax) currentMax = r.vibrationValue;
    });
    if (currentMax > peakMagnitude) {
        peakMagnitude = currentMax;
    }

    // Process arrays for charts
    labels = chartRecords.map(r => formatTime(new Date(r.timestamp)));
    magnitudeData = chartRecords.map(r => r.vibrationValue);
    axData = chartRecords.map(r => r.ax);
    ayData = chartRecords.map(r => r.ay);
    azData = chartRecords.map(r => r.az);

    // Update charts
    magnitudeChart.data.labels = labels;
    magnitudeChart.data.datasets[0].data = magnitudeData;
    magnitudeChart.update();

    axisChart.data.labels = labels;
    axisChart.data.datasets[0].data = axData;
    axisChart.data.datasets[1].data = ayData;
    axisChart.data.datasets[2].data = azData;
    axisChart.update();

    // Update KPI Cards
    if (latestRecord) {
        currentMagnitudeEl.innerHTML = `${latestRecord.vibrationValue.toFixed(2)} <span>g</span>`;
        peakMagnitudeEl.innerHTML = `${peakMagnitude.toFixed(2)} <span>g</span>`;

        const timeObj = new Date(latestRecord.timestamp);
        lastUpdateEl.innerText = formatTime(timeObj);

        // Status update
        currentStatusEl.innerText = latestRecord.status;
        currentStatusEl.className = 'kpi-value'; // Reset
        if (latestRecord.status === 'Normal') currentStatusEl.classList.add('status-normal');
        else if (latestRecord.status === 'Warning') currentStatusEl.classList.add('status-warning');
        else currentStatusEl.classList.add('status-critical');

        // Render Table
        renderTable(fullDataHistory);
    }
}

function renderTable(dataArray) {
    tableBodyEl.innerHTML = '';
    // Show top 20 rows max to keep UI clean
    const displayRows = dataArray.slice(0, 20);

    displayRows.forEach(row => {
        const tr = document.createElement('tr');

        let statusClass = 'status-normal-bg';
        if (row.status === 'Warning') statusClass = 'status-warning-bg';
        if (row.status === 'Critical') statusClass = 'status-critical-bg';

        tr.innerHTML = `
            <td>${formatDateTime(new Date(row.timestamp))}</td>
            <td>${row.ax.toFixed(3)}</td>
            <td>${row.ay.toFixed(3)}</td>
            <td>${row.az.toFixed(3)}</td>
            <td><strong>${row.vibrationValue.toFixed(3)}</strong></td>
            <td><span class="status-badge ${statusClass}">${row.status}</span></td>
        `;
        tableBodyEl.appendChild(tr);
    });
}

// Helpers
function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function formatDateTime(date) {
    return date.toLocaleString('en-US', { hour12: false, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// Exports
function openExportModal(type) {
    currentExportType = type;
    document.querySelector('.modal-header h3').innerText = `Export ${type === 'excel' ? 'Excel' : 'PDF'} (Date Range)`;
    exportModal.classList.remove('hidden');
    exportErrorMsg.classList.add('hidden');
    // Set default values: End = now, Start = 1 hour ago
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));
    
    // Format to YYYY-MM-DDThh:mm for datetime-local
    const formatForInput = (d) => {
        const offset = d.getTimezoneOffset();
        const adjustedDate = new Date(d.getTime() - (offset * 60 * 1000));
        return adjustedDate.toISOString().slice(0, 16);
    };
    
    exportStartInput.value = formatForInput(oneHourAgo);
    exportEndInput.value = formatForInput(now);
}

function closeExportModal() {
    exportModal.classList.add('hidden');
}

function handleExportConfirm() {
    const startVal = exportStartInput.value;
    const endVal = exportEndInput.value;
    
    if (!startVal || !endVal) {
        exportErrorMsg.innerText = "Please select both start and end dates.";
        exportErrorMsg.classList.remove('hidden');
        return;
    }

    const start = new Date(startVal);
    const end = new Date(endVal);

    if (start >= end) {
        exportErrorMsg.innerText = "Start date must be before end date.";
        exportErrorMsg.classList.remove('hidden');
        return;
    }

    exportErrorMsg.classList.add('hidden');
    
    // Format to ISO string for backend
    const startIso = start.toISOString();
    const endIso = end.toISOString();
    
    // Fetch data from backend
    confirmExportBtn.disabled = true;
    confirmExportBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Downloading...';
    
    fetch(`${API_URL}/range?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch data');
            return response.json();
        })
        .then(data => {
            confirmExportBtn.disabled = false;
            confirmExportBtn.innerHTML = '<i class="fa-solid fa-download"></i> Download';
            
            if (!data || data.length === 0) {
                exportErrorMsg.innerText = "No data found for the selected range.";
                exportErrorMsg.classList.remove('hidden');
                return;
            }
            
            if (currentExportType === 'excel') {
                exportDataToExcel(data, `Vibration_Log_${startIso.slice(0, 10)}_to_${endIso.slice(0, 10)}.xlsx`);
            } else {
                exportToPdf(data, `Vibration_Log_${startIso.slice(0, 10)}_to_${endIso.slice(0, 10)}.pdf`);
            }
            closeExportModal();
        })
        .catch(err => {
            console.error("Export error:", err);
            confirmExportBtn.disabled = false;
            confirmExportBtn.innerHTML = '<i class="fa-solid fa-download"></i> Download';
            exportErrorMsg.innerText = "Error fetching data from server.";
            exportErrorMsg.classList.remove('hidden');
        });
}

function exportDataToExcel(dataArray, filename) {
    if (dataArray.length === 0) return alert("No data to export");

    // Convert JSON to Worksheet
    const ws = XLSX.utils.json_to_sheet(dataArray.map(row => ({
        ID: row.id,
        Timestamp: row.timestamp,
        Ax: row.ax,
        Ay: row.ay,
        Az: row.az,
        Magnitude: row.vibrationValue,
        Status: row.status
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vibration Data");

    XLSX.writeFile(wb, filename);
}

function exportToPdf(dataArray, filename) {
    if (dataArray.length === 0) return alert("No data to export");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Vibration Data Log Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const bodyData = dataArray.map(row => [
        formatDateTime(new Date(row.timestamp)),
        row.ax.toFixed(3),
        row.ay.toFixed(3),
        row.az.toFixed(3),
        row.vibrationValue.toFixed(3),
        row.status
    ]);

    doc.autoTable({
        startY: 35,
        head: [['Timestamp', 'Ax (g)', 'Ay (g)', 'Az (g)', 'Magnitude (g)', 'Status']],
        body: bodyData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(filename);
}
