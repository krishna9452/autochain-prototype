// frontend/src/hooks/useSensorData.js
import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import io from 'socket.io-client';

const DATA_ACCOUNT_PUBKEY = "43jRhrXq8GHNANr916y8p621VT9BdNeTWNrGasN3GAvY"; // Replace with actual public key

export default function useSensorData() {
  const [currentData, setCurrentData] = useState(null);
  const [history, setHistory] = useState([]);
  const [socket, setSocket] = useState(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io('http://localhost:3001', { // Use different port for agent
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    
    setSocket(newSocket);
    
    newSocket.on('new_data', (data) => {
      setCurrentData(data);
      setHistory(prev => [...prev.slice(-99), data]);
    });

    return () => newSocket.disconnect();
  }, []);

  // Initialize Solana account listener
  const initSolanaListener = useCallback(async () => {
    try {
      const connection = new Connection("http://localhost:8899", "confirmed");
      const publicKey = new PublicKey(DATA_ACCOUNT_PUBKEY);
      
      connection.onAccountChange(
        publicKey,
        (accountInfo) => {
          const data = parseAccountData(accountInfo.data);
          setCurrentData(data);
          setHistory(prev => [...prev, data]);
        },
        'confirmed'
      );
    } catch (error) {
      console.error("Solana listener error:", error);
    }
  }, []);

  useEffect(() => {
    initSolanaListener();
  }, [initSolanaListener]);

  return { currentData, history, socket };
}

// Parse account data based on your program's structure
function parseAccountData(data) {
  // Implement your actual data parsing logic here
  return {
    temperature: data.readFloatLE(0), // Example - adjust to your data layout
    location: "Sensor Location",
    timestamp: Date.now(),
    txLink: `https://explorer.solana.com/tx/${data.toString('hex')}`
  };
}