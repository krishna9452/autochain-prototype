// script.js
// Initialize temperature data history
let temperatureHistory = [];
let locationHistory = [];
let transactionHistory = [];
let maxDataPoints = 20;
let chart;

// Temperature images
const tempImages = {
    cold: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?q=80",
    moderate: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80",
    hot: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?q=80"
};

// Preload images
function preloadImages() {
    Object.values(tempImages).forEach(src => {
        new Image().src = src;
    });
}

// Initialize Chart.js when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    preloadImages();
    
    const ctx = document.getElementById('temp-chart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperature (°F)',
                data: [],
                borderColor: '#4cc9f0',
                backgroundColor: 'rgba(76, 201, 240, 0.1)',
                borderWidth: 4,
                pointRadius: 5,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#4cc9f0',
                pointBorderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#4cc9f0',
                    bodyColor: '#e2e8f0',
                    borderColor: '#4361ee',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 12,
                    callbacks: {
                        label: function(context) {
                            return `Temp: ${context.parsed.y}°F`;
                        },
                        footer: function(tooltipItems) {
                            const index = tooltipItems[0].dataIndex;
                            return `Location: ${locationHistory[index]}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: 'rgba(200, 214, 240, 0.7)',
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: 'rgba(200, 214, 240, 0.7)',
                        font: {
                            size: 12
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
    
    // Initialize the dashboard
    initDashboard();
});

// Function to update temperature display and NFT visualization
function updateTemperature(temp, location) {
    // Update all temperature displays
    document.getElementById('temperature-display').textContent = `${temp}°F`;
    document.getElementById('current-temp').textContent = `${temp}°F`;
    document.getElementById('detail-temp').textContent = `${temp}°F`;
    
    // Update all location displays
    document.getElementById('location-display').textContent = location;
    document.getElementById('current-location').textContent = location;
    document.getElementById('detail-location').textContent = location;
    
    // Update NFT visualization based on temperature
    const nftIcon = document.getElementById('nft-icon');
    const tempDisplay = document.getElementById('current-temp');
    const facilityStatus = document.getElementById('facility-status');
    
    nftIcon.className = 'nft-image ';
    tempDisplay.className = 'data-value ';
    facilityStatus.className = 'data-value ';
    
    if (temp <= 60) {
        nftIcon.style.backgroundImage = `url(${tempImages.cold})`;
        nftIcon.innerHTML = '<div class="cold-overlay"></div>';
        tempDisplay.classList.add('cold');
        facilityStatus.classList.add('cold');
        facilityStatus.textContent = 'Cold';
    } else if (temp >= 80) {
        nftIcon.style.backgroundImage = `url(${tempImages.hot})`;
        nftIcon.innerHTML = '<div class="hot-overlay"></div>';
        tempDisplay.classList.add('hot');
        facilityStatus.classList.add('hot');
        facilityStatus.textContent = 'Hot';
    } else {
        nftIcon.style.backgroundImage = `url(${tempImages.moderate})`;
        nftIcon.innerHTML = '<div class="moderate-overlay"></div>';
        tempDisplay.classList.add('moderate');
        facilityStatus.classList.add('moderate');
        facilityStatus.textContent = 'Normal';
    }
}

// Function to update the chart with new data
function updateChart(temp, location) {
    // Add new data point
    temperatureHistory.push(temp);
    locationHistory.push(location);
    
    // Keep only the last 20 data points
    if (temperatureHistory.length > maxDataPoints) {
        temperatureHistory.shift();
        locationHistory.shift();
    }
    
    // Generate labels (timestamps)
    const labels = [];
    const now = new Date();
    for (let i = temperatureHistory.length - 1; i >= 0; i--) {
        const minutesAgo = temperatureHistory.length - 1 - i;
        labels.unshift(`${minutesAgo * 5}s ago`);
    }
    
    // Update chart data
    chart.data.labels = labels;
    chart.data.datasets[0].data = temperatureHistory;
    chart.update();
}

// Function to update time displays
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('current-time').textContent = timeString;
    document.getElementById('update-time').textContent = timeString;
    document.getElementById('detail-time').textContent = timeString;
}

// Function to add transaction to history
function addTransaction(temp, location) {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const txId = `tx${Math.floor(Math.random() * 1000000).toString(16).padStart(6, '0')}`;
    const explorerLink = `https://explorer.solana.com/tx/${txId}?cluster=devnet`;
    
    // Random status (80% confirmed, 20% pending)
    const status = Math.random() > 0.2 ? 'confirmed' : 'pending';
    
    const transaction = {
        time: timeString,
        temp: temp,
        location: location,
        link: explorerLink,
        status: status,
        txId: txId
    };
    
    transactionHistory.unshift(transaction);
    
    if (transactionHistory.length > 8) {
        transactionHistory.pop();
    }
    
    updateTransactionList();
}

// Function to update transaction list in UI
function updateTransactionList() {
    const listElement = document.getElementById('transactions-list');
    listElement.innerHTML = '';
    
    transactionHistory.forEach(tx => {
        const txElement = document.createElement('div');
        txElement.className = 'transaction-item';
        
        // Status indicator
        let statusElement = '';
        if (tx.status === 'confirmed') {
            statusElement = `<div class="transaction-status status-confirmed">
                <i class="fas fa-check-circle"></i> Confirmed
            </div>`;
        } else {
            statusElement = `<div class="transaction-status status-pending">
                <i class="fas fa-clock"></i> Pending
            </div>`;
        }
        
        txElement.innerHTML = `
            <div>${tx.time}</div>
            <div>${tx.location}</div>
            <div>${tx.temp}°F</div>
            ${statusElement}
            <a href="${tx.link}" target="_blank" class="transaction-link">
                <i class="fas fa-external-link-alt"></i> View TX
            </a>
        `;
        listElement.appendChild(txElement);
    });
}

// Function to generate simulated sensor data
function generateSensorData() {
    // Simulate realistic temperature patterns
    const baseTemp = 70;
    const time = Math.floor(Date.now() / 60000); // minutes
    const dailyCycle = 10 * Math.sin(2 * Math.PI * time / 1440);
    const noise = (Math.random() - 0.5) * 4;
    const temp = Math.round(baseTemp + dailyCycle + noise);
    
    // Rotate through warehouse locations
    const locations = ['Warehouse-A', 'Warehouse-B', 'Warehouse-C', 'Warehouse-D', 'Warehouse-E'];
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    return { temp, location };
}

// Main update function
function updateDashboard() {
    // Generate new sensor data
    const { temp, location } = generateSensorData();
    
    // Update UI elements
    updateTemperature(temp, location);
    updateTime();
    updateChart(temp, location);
    addTransaction(temp, location);
    
    // Log to console (for agent simulation)
    console.log(`🔄 Updated: Temp=${temp}°F, Location=${location}`);
    console.log(`🔗 Transaction: https://explorer.solana.com/tx/tx${Math.floor(Math.random() * 1000000).toString(16).padStart(6, '0')}?cluster=devnet`);
}

// Initialize the dashboard
function initDashboard() {
    // Start with initial data
    const initialData = generateSensorData();
    updateTemperature(initialData.temp, initialData.location);
    updateTime();
    
    // Populate initial chart data
    for (let i = 0; i < maxDataPoints; i++) {
        const temp = 70 + Math.sin(i) * 8 + (Math.random() - 0.5) * 4;
        temperatureHistory.push(Math.round(temp));
        locationHistory.push(`Warehouse-${String.fromCharCode(65 + (i % 5))}`);
    }
    updateChart(initialData.temp, initialData.location);
    
    // Add initial transactions
    for (let i = 0; i < 5; i++) {
        const temp = 68 + Math.floor(Math.random() * 15);
        const locations = ['Warehouse-A', 'Warehouse-B', 'Warehouse-C', 'Warehouse-D', 'Warehouse-E'];
        addTransaction(temp, locations[Math.floor(Math.random() * locations.length)]);
    }
    
    // Start periodic updates
    setInterval(updateDashboard, 5000);
}