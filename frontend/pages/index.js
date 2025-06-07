import { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { 
  Box, Text, VStack, HStack, Spinner, Heading, 
  Badge, useColorModeValue
} from '@chakra-ui/react';
import NFTVisualizer from '../components/NFTVisualizer';
import TemperatureChart from '../components/TemperatureChart';
import useSensorData from '../src/hooks/useSensorData'; // Import the WebSocket hook

export default function Dashboard() {
  const { connection } = useConnection();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use WebSocket data hook instead of direct blockchain polling
  const { currentData: nftData, history } = useSensorData();
  
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');

  // Remove the old fetchData function and interval

  // Handle loading state based on WebSocket data
  useEffect(() => {
    if (nftData) {
      setLoading(false);
      setError(null);
    } else if (!nftData && !error) {
      // Show loading for first 10 seconds
      const timeout = setTimeout(() => {
        setError('No data received. Check WebSocket connection.');
        setLoading(false);
      }, 10000);
      
      return () => clearTimeout(timeout);
    }
  }, [nftData, error]);

  return (
    <VStack 
      spacing={8} 
      p={8} 
      minH="100vh" 
      bg={bgColor}
      align="center"
    >
      <VStack textAlign="center">
        <Heading as="h1" size="xl" bgGradient="linear(to-r, purple.400, blue.500)" bgClip="text">
          AutoChain IoT Tracker
        </Heading>
        <Text color="gray.500">Real-time autonomous sensor monitoring on Solana</Text>
      </VStack>
      
      {loading ? (
        <VStack spacing={4} py={12}>
          <Spinner size="xl" thickness="4px" color="purple.500" />
          <Text>Connecting to real-time data feed...</Text>
        </VStack>
      ) : error ? (
        <Box p={6} bg="red.50" borderRadius="lg" borderWidth="1px" borderColor="red.100">
          <Text color="red.600">⚠️ {error}</Text>
          <Text mt={2} fontSize="sm">
            Make sure the IoT agent is running and WebSocket server is active
          </Text>
        </Box>
      ) : (
        <>
          <HStack spacing={8} align="start" wrap="wrap" justify="center">
            <Box 
              bg={cardBg}
              borderRadius="2xl"
              boxShadow="xl"
              p={8}
              minW="300px"
              textAlign="center"
            >
              <Badge colorScheme="purple" mb={4} fontSize="0.8em">LIVE SENSOR</Badge>
              <NFTVisualizer nftData={nftData} />
              
              <VStack mt={6} spacing={3} align="start">
                <HStack>
                  <Text fontWeight="bold" color="gray.500">🌡️ Temperature:</Text>
                  <Text fontSize="2xl">{nftData.temperature}°F</Text>
                </HStack>
                
                <HStack>
                  <Text fontWeight="bold" color="gray.500">📍 Location:</Text>
                  <Text fontSize="xl">{nftData.location}</Text>
                </HStack>
                
                <HStack>
                  <Text fontWeight="bold" color="gray.500">🕒 Last Update:</Text>
                  <Text>{new Date(nftData.timestamp).toLocaleTimeString()}</Text>
                </HStack>
                
                {nftData.txLink && (
                  <HStack>
                    <Text fontWeight="bold" color="gray.500">🔗 Transaction:</Text>
                    <a href={nftData.txLink} target="_blank" rel="noreferrer">
                      <Text color="blue.500">View on Explorer</Text>
                    </a>
                  </HStack>
                )}
              </VStack>
            </Box>
            
            <Box 
              bg={cardBg}
              borderRadius="2xl"
              boxShadow="xl"
              p={8}
              minW="500px"
            >
              <TemperatureChart history={history} />
            </Box>
          </HStack>
          
          <Box mt={4} textAlign="center">
            <Text fontSize="sm" color="gray.500">
              Real-time updates • ZK-proofs verified • Powered by Solana
            </Text>
          </Box>
        </>
      )}
    </VStack>
  );
}