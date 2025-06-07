import React, { memo, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { fetchSensorData } from '../services/sensorService';
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TemperatureChart = memo(() => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchSensorData();
        
        if (!data.history || data.history.length === 0) {
          throw new Error('No historical data available');
        }
        
        // Transform data for chart
        const transformedData = {
          labels: data.history.map(item => item.timestamp * 1000),
          datasets: [{
            label: 'Temperature (°F)',
            data: data.history.map(item => ({
              x: item.timestamp * 1000,
              y: item.temperature
            })),
            borderColor: getTemperatureColor(data.current?.temperature || 70),
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        };
        
        setChartData(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Failed to load temperature history. Trying again...');
        setChartData(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Update every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getTemperatureColor = (temp) => {
    if (temp < 60) return 'rgb(54, 162, 235)'; // Blue for cold
    if (temp < 80) return 'rgb(75, 192, 192)'; // Teal for moderate
    return 'rgb(255, 99, 132)'; // Red for hot
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            const date = new Date(context[0].parsed.x);
            return format(date, 'MMM d, yyyy h:mm a');
          },
          label: (context) => {
            return `Temperature: ${context.parsed.y}°F`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute',
          tooltipFormat: 'MMM d, h:mm a',
          displayFormats: {
            minute: 'h:mm a'
          }
        },
        title: {
          display: true,
          text: 'Time',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        title: {
          display: true,
          text: 'Temperature (°F)',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        suggestedMin: 50,
        suggestedMax: 90
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2>Temperature History</h2>
        {error && (
          <div className="chart-error">
            ⚠️ {error}
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="chart-loading">
          <div className="spinner"></div>
          <p>Loading temperature history...</p>
        </div>
      ) : chartData ? (
        <div className="chart-wrapper">
          <Line 
            data={chartData} 
            options={chartOptions}
            key={chartData.datasets[0].data.length} // Force re-render on new data
          />
          <div className="chart-footer">
            <p>Data updates every 30 seconds</p>
            <p>Current range: Last {chartData.datasets[0].data.length} readings</p>
          </div>
        </div>
      ) : (
        <div className="chart-empty">
          <p>No temperature data available</p>
          <p>Check your IoT sensor connection</p>
        </div>
      )}
    </div>
  );
});

export default TemperatureChart;