import React, { useEffect, useState } from 'react';
import { fetchSensorData } from '../services/sensorService';

const NFTVisualizer = () => {
  const [nftData, setNftData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchSensorData();
        
        if (!data.current || !data.current.temperature) {
          throw new Error('Invalid sensor data received');
        }
        
        setNftData(data.current);
        
        // FIXED: Proper timestamp handling
        if (data.current.timestamp) {
          // Convert to milliseconds if needed
          const adjustedTimestamp = data.current.timestamp < 1000000000000 
            ? data.current.timestamp * 1000 
            : data.current.timestamp;
          
          const date = new Date(adjustedTimestamp);
          setLastUpdated(date.toLocaleTimeString());
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching sensor data:', err);
        setError('Failed to load sensor data. Trying again...');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Update every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getImage = () => {
    if (!nftData) return '/images/default.png';
    
    const temp = nftData.temperature;
    if (temp < 60) return '/images/cold.png';
    if (temp < 80) return '/images/moderate.png';
    return '/images/hot.png';
  };

  const getTemperatureClass = () => {
    if (!nftData) return '';
    if (nftData.temperature < 60) return 'cold';
    if (nftData.temperature < 80) return 'moderate';
    return 'hot';
  };

  return (
    <div className={`nft-container ${getTemperatureClass()}`}>
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Connecting to IoT sensor...</p>
        </div>
      )}
      
      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}
      
      <div className="nft-image-container">
        <img 
          src={getImage()} 
          alt="Temperature NFT" 
          className="temperature-nft"
        />
        {nftData && (
          <div className="temperature-badge">
            {nftData.temperature}°F
          </div>
        )}
      </div>
      
      {nftData ? (
        <div className="sensor-info">
          <div className="info-row">
            <span className="label">📍 Location:</span>
            <span className="value">{nftData.location}</span>
          </div>
          <div className="info-row">
            <span className="label">🌡️ Temperature:</span>
            <span className="value">{nftData.temperature}°F</span>
          </div>
          {lastUpdated && (
            <div className="info-row">
              <span className="label">🕒 Last updated:</span>
              <span className="value">{lastUpdated}</span>
            </div>
          )}
        </div>
      ) : (
        !loading && !error && <p className="no-data">No sensor data available</p>
      )}
    </div>
  );
};

export default NFTVisualizer;