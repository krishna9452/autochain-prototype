// DOM Elements
const elements = {
    temperatureDisplay: document.getElementById('temperature-display'),
    locationDisplay: document.getElementById('location-display'),
    detailTemp: document.getElementById('detail-temp'),
    detailLocation: document.getElementById('detail-location'),
    detailStatus: document.getElementById('detail-status'),
    detailTime: document.getElementById('detail-time'),
    currentTemp: document.getElementById('current-temp'),
    currentLocation: document.getElementById('current-location'),
    currentTime: document.getElementById('current-time'),
    facilityStatus: document.getElementById('facility-status'),
    updateTime: document.getElementById('update-time'),
    transactionsList: document.getElementById('transactions-list'),
    tempChart: document.getElementById('temp-chart'),
    nftIcon: document.getElementById('nft-icon')
};

// Chart initialization
let tempChart;
let chartData = {
    labels: [],
    datasets: [{
        label: 'Temperature (°F)',
        data: [],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4,
        fill: true
    }]
};

function initChart() {
    tempChart = new Chart(elements.tempChart, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 50,
                    max: 90
                }
            }
        }
    });
}

// FIXED: Proper timestamp handling
function formatTimeAgo(timestamp) {
    // Convert to milliseconds if it's in seconds
    const adjustedTimestamp = timestamp < 1000000000000 ? timestamp * 1000 : timestamp;
    
    const now = new Date();
    const updateTime = new Date(adjustedTimestamp);
    const seconds = Math.floor((now - updateTime) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    return `${Math.floor(seconds / 3600)} hours ago`;
}

// FIXED: Correct image paths
function getImageForStatus(status) {
    switch (status.toLowerCase()) {
        case 'cold': return 'cold.png';
        case 'moderate': return 'moderate.png';
        case 'hot': return 'hot.png';
        default: return 'default.png';
    }
}

// FIXED: Proper image updating
function updateNFTImage(status) {
    const imageFile = getImageForStatus(status);
    elements.nftIcon.innerHTML = ''; // Clear previous

    const img = document.createElement('img');
    img.src = imageFile;
    img.alt = `Status: ${status}`;
    img.className = 'nft-status-image';

    elements.nftIcon.appendChild(img);
}

function updateUI(data) {
    // FIXED: Added data validation
    if (!data || !data.current) {
        console.error('Invalid data received:', data);
        return;
    }
    
    const { temperature, location, status, timestamp } = data.current;

    // Update temperature displays
    elements.temperatureDisplay.textContent = `${temperature}°F`;
    elements.detailTemp.textContent = `${temperature}°F`;
    elements.currentTemp.textContent = `${temperature}°F`;

    // Update location displays
    elements.locationDisplay.textContent = location;
    elements.detailLocation.textContent = location;
    elements.currentLocation.textContent = location;

    // Update status displays
    elements.detailStatus.textContent = status;
    elements.detailStatus.className = status.toLowerCase();
    elements.facilityStatus.textContent = status;
    elements.facilityStatus.className = `data-value ${status.toLowerCase()}`;

    // FIXED: Use corrected timestamp
    const timeText = formatTimeAgo(timestamp);
    elements.detailTime.textContent = timeText;
    elements.currentTime.textContent = timeText;
    elements.updateTime.textContent = timeText;

    // Update NFT icon background and image
    elements.nftIcon.className = `nft-image ${status.toLowerCase()}-bg`;
    updateNFTImage(status);

    // Update chart
    const now = new Date();
    chartData.labels.push(now.toLocaleTimeString());
    chartData.datasets[0].data.push(temperature);

    if (chartData.labels.length > 20) {
        chartData.labels.shift();
        chartData.datasets[0].data.shift();
    }

    if (tempChart) tempChart.update();

    // Add to transactions
    addTransaction(temperature, location, status, timestamp);
}

function addTransaction(temp, location, status, timestamp) {
    const timeText = formatTimeAgo(timestamp);
    const transactionItem = document.createElement('div');
    transactionItem.className = 'transaction-item';
    transactionItem.innerHTML = `
        <div>${timeText}</div>
        <div>${location}</div>
        <div>${temp}°F</div>
        <div><span class="${status.toLowerCase()}">${status}</span></div>
        <div><a href="#" class="view-link">View</a></div>
    `;
    elements.transactionsList.insertBefore(transactionItem, elements.transactionsList.firstChild);

    if (elements.transactionsList.children.length > 10) {
        elements.transactionsList.removeChild(elements.transactionsList.lastChild);
    }
}

async function fetchSensorData() {
    try {
        // FIXED: Added cache busting
        const response = await fetch('http://localhost:8000/sensor-data?t=' + Date.now());
        const data = await response.json();

        console.log('Received sensor data:', data);
        updateUI(data);
    } catch (error) {
        console.error('Error fetching sensor data:', error);
        elements.updateTime.textContent = 'Connection error';
        
        // FIXED: Retry faster on error
        setTimeout(fetchSensorData, 500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initChart();
    fetchSensorData();
    setInterval(fetchSensorData, 2000);
});