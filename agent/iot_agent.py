import asyncio
import json
import numpy as np
import os
import time
from anchorpy import Program, Context, Provider, Wallet
from solana.rpc.async_api import AsyncClient
from solana.rpc.commitment import Confirmed
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.system_program import ID as SYS_PROGRAM_ID
from anchorpy import Idl
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager
from datetime import datetime
import logging

# ===== CONFIG =====
RPC_URL = "http://127.0.0.1:8899"
PROGRAM_ID = Pubkey.from_string("AhJJ7GNZSZGadDEirEx2j1HtjXav6nYezkFDPaE4SVti")
WALLET_SECRET = [74,152,142,25,163,111,21,76,64,97,63,6,127,106,114,180,81,52,27,229,40,88,249,75,213,107,57,222,245,23,187,237,45,70,49,141,0,65,40,115,200,98,31,115,195,10,27,223,227,132,197,191,201,33,102,100,3,154,131,87,250,89,34,253]
# ==================

# ===== GLOBAL STATE =====
current_sensor_data = {
    "temperature": 0,
    "location": "",
    "timestamp": datetime.now().isoformat(),
    "status": "Normal"
}
sensor_history = []
program_obj = None
nft_pubkey_obj = None
wallet_pubkey_obj = None
provider_obj = None
# =========================

# ===== FASTAPI SETUP =====
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Setup and teardown for the app"""
    # Start sensor loop as background task
    asyncio.create_task(run_sensor_loop())
    yield
    # Cleanup on shutdown
    print("🛑 Shutting down IoT agent")

app = FastAPI(lifespan=lifespan)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn")

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== API ENDPOINTS =====
@app.get("/sensor-data")
async def get_sensor_data(response: Response):
    """Get latest sensor reading"""
    # Prevent caching of API responses
    response.headers["Cache-Control"] = "no-store, max-age=0"
    response.headers["Pragma"] = "no-cache"
    
    # Add version to response to help with debugging
    return {
        "version": "1.0",
        "current": current_sensor_data,
        "history": sensor_history[-100:]  # Return last 100 readings
    }

@app.get("/health")
async def health_check():
    """Simple health check endpoint"""
    return {"status": "ok", "timestamp": datetime.now().isoformat()}
# =========================

async def check_program_exists(conn, program_id):
    """Verify if program exists and is executable"""
    account_info = await conn.get_account_info(program_id, commitment=Confirmed)
    if account_info.value is None:
        print(f"❌ Program account not found at {program_id}")
        return False
    if not account_info.value.executable:
        print(f"❌ Account exists but is not executable")
        return False
    print(f"✅ Program found and executable")
    return True

async def airdrop_sol(provider, wallet_pubkey):
    """Request airdrop of SOL on devnet"""
    print("💧 Requesting airdrop...")
    try:
        # Request 1 SOL airdrop
        airdrop_tx = await provider.connection.request_airdrop(wallet_pubkey, 1_000_000_000)
        await provider.connection.confirm_transaction(airdrop_tx.value, Confirmed)
        print("✅ Airdrop successful")
        return True
    except Exception as e:
        print(f"❌ Airdrop failed: {str(e)}")
        return False

async def check_balance(provider, wallet_pubkey):
    """Check wallet balance in SOL"""
    balance = await provider.connection.get_balance(wallet_pubkey, Confirmed)
    balance_sol = balance.value / 1_000_000_000
    print(f"💳 Wallet balance: {balance_sol:.6f} SOL")
    return balance_sol

async def main():
    global program_obj, nft_pubkey_obj, wallet_pubkey_obj, provider_obj
    
    # Initialize wallet
    wallet = Keypair.from_bytes(bytes(WALLET_SECRET))
    wallet_pubkey = wallet.pubkey()
    print("💰 Wallet address:", wallet_pubkey)

    # Create connection and provider
    conn = AsyncClient(RPC_URL)
    provider = Provider(conn, Wallet(wallet))

    # Verify program exists
    if not await check_program_exists(conn, PROGRAM_ID):
        print("⛔ Program not available. Please deploy first!")
        return

    # Load IDL with proper path resolution
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        idl_path = os.path.join(script_dir, "..", "target", "idl", "autochain.json")
        print(f"🔍 Looking for IDL at: {idl_path}")
        
        with open(idl_path, "r") as f:
            idl_json_str = f.read()
        
        idl = Idl.from_json(idl_json_str)
        print("📜 IDL loaded successfully")
    except Exception as e:
        print(f"❌ Failed to load IDL: {str(e)}")
        return

    # Check balance and airdrop if needed
    balance_sol = await check_balance(provider, wallet_pubkey)
    if balance_sol < 0.01:
        await airdrop_sol(provider, wallet_pubkey)

    # Initialize program
    program = Program(idl, PROGRAM_ID, provider)

    # Find PDA for NFT account
    nft_pubkey, bump = Pubkey.find_program_address([b"nft_account"], PROGRAM_ID)
    print(f"🖼️ NFT account: {nft_pubkey} (bump: {bump})")
    
    # Check if NFT account already exists
    account_info = await conn.get_account_info(nft_pubkey, commitment=Confirmed)
    account_exists = account_info.value is not None
    
    if not account_exists:
        # Initialize NFT account only if it doesn't exist
        try:
            print("🔄 Initializing NFT account...")
            tx = await program.rpc["initialize"](
                ctx=Context(
                    accounts={
                        "nft_account": nft_pubkey,
                        "user": wallet_pubkey,
                        "system_program": SYS_PROGRAM_ID,
                    },
                )
            )
            print(f"🆕 NFT account initialized: https://explorer.solana.com/tx/{tx}?cluster=devnet")
        except Exception as e:
            print(f"❌ Initialization error: {str(e)}")
            # Double-check if account was created
            account_info = await conn.get_account_info(nft_pubkey, commitment=Confirmed)
            if account_info.value is not None:
                print("ℹ️ NFT account was created despite error")
                account_exists = True
            else:
                print("⛔ Failed to create NFT account")
                return
    else:
        print("ℹ️ NFT account already exists - skipping initialization")

    # Store blockchain objects for sensor loop
    program_obj = program
    nft_pubkey_obj = nft_pubkey
    wallet_pubkey_obj = wallet_pubkey
    provider_obj = provider

    print("🚀 Blockchain setup complete. Sensor loop will start with API server.")

# ===== SENSOR LOOP FUNCTION =====
async def run_sensor_loop():
    """Main sensor loop that updates blockchain and API data"""
    # Wait for blockchain setup to complete
    while not all([program_obj, nft_pubkey_obj, wallet_pubkey_obj, provider_obj]):
        print("⏳ Waiting for blockchain setup to complete...")
        await asyncio.sleep(1)
    
    print("🌡️ Starting sensor simulation (updates every 30 seconds)...")
    sensor = SensorSimulator()
    counter = 0
    
    try:
        while True:
            # Generate sensor reading
            temp = sensor.read()
            location_idx = counter % 5
            location = f"Warehouse-{chr(65 + location_idx)}"  # A, B, C, D, E
            
            # Determine status based on temperature
            if temp <= 60:
                status = "Cold"
            elif temp >= 80:
                status = "Hot"
            else:
                status = "Normal"
            
            counter += 1
            
            # Update global state
            global current_sensor_data, sensor_history
            current_sensor_data = {
                "temperature": temp,
                "location": location,
                "timestamp": datetime.now().isoformat(),
                "status": status
            }
            sensor_history.append(current_sensor_data.copy())  # Use copy to avoid reference issues
            
            # Log the update
            print(f"🌡️ Sensor: {temp}°F | 📍 {location} | 🟢 Status: {status}")
            
            # Update on-chain metadata
            try:
                tx = await program_obj.rpc["update_metadata"](
                    temp,
                    location,
                    bytes([0] * 64),  # Placeholder for ZK-proof
                    ctx=Context(
                        accounts={
                            "nft_account": nft_pubkey_obj,
                            "authority": wallet_pubkey_obj,
                        },
                    )
                )
                print(f"🔗 Blockchain update successful: {tx}")
            except Exception as e:
                print(f"⚠️ Blockchain update failed: {str(e)}")
                if "insufficient funds" in str(e).lower():
                    print("💸 Low balance detected, requesting airdrop...")
                    await airdrop_sol(provider_obj, wallet_pubkey_obj)
            
            # Wait before next update
            await asyncio.sleep(30)
    except asyncio.CancelledError:
        print("🛑 Sensor loop cancelled")
    except Exception as e:
        print(f"🔥 Critical error in sensor loop: {str(e)}")
# ================================

class SensorSimulator:
    """Simulates IoT sensor with realistic temperature patterns"""
    def __init__(self):
        self.time = 0
        self.base_temp = 70  # Base temperature in Fahrenheit

    def read(self):
        """Generate temperature reading with daily cycle and random noise"""
        self.time += 1
        # Daily temperature cycle (1440 minutes = 24 hours)
        daily_cycle = 10 * np.sin(2 * np.pi * self.time / 1440)
        noise = np.random.normal(0, 2)  # Gaussian noise
        return int(self.base_temp + daily_cycle + noise)

if __name__ == "__main__":
    # Create a new event loop
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        # Run blockchain setup first
        print("🔗 Setting up blockchain connection...")
        loop.run_until_complete(main())
        
        # Then start the API server
        print("🌐 Starting API server on http://0.0.0.0:8000")
        config = uvicorn.Config(
            app,
            host="0.0.0.0",
            port=8000,
            log_level="info",
            loop="asyncio",
            reload=False
        )
        server = uvicorn.Server(config)
        loop.run_until_complete(server.serve())
    except KeyboardInterrupt:
        print("\n🛑 Shutting down...")
    finally:
        loop.close()