const API_URL = "http://localhost:8000/sensor-data";

export const fetchSensorData = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    return {
      current: null,
      history: []
    };
  }
};