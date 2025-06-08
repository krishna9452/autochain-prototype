# AutobotChain-prototype
# 🌡️ AutobotChain : Decentralized IoT Monitoring System

AutoChain is a **decentralized IoT monitoring platform** that combines the power of **Solana blockchain**, **zero-knowledge proofs (zk-SNARKs)** using **Circom**, and a real-time **web dashboard** built with React. The system enables privacy-preserving and tamper-proof recording of environmental sensor data, with a focus on **temperature monitoring**.

---

## 📖 Overview

AutoChain securely collects and validates temperature data from IoT agents, verifies the data using zero-knowledge circuits, and immutably stores the result on the Solana blockchain. A responsive frontend visualizes this data in real time, ensuring transparency and auditability for use cases such as:

- Environmental compliance
- Supply chain monitoring (e.g., cold-chain logistics)
- Industrial safety
- Smart cities

---

## 🧩 Key Components

### 🔗 Blockchain Backend (`programs/autochain`)
- **Language**: Rust (using the Anchor framework)
- **Responsibilities**:
  - Implements Solana smart contracts (programs) for storing validated data.
  - Compiles contracts into `.so` binaries and generates IDL files for client use.
  - Integrated with a local Solana validator for development.

---

### 🧠 IoT Agent (`agent/`)
- **Language**: Python
- **Responsibilities**:
  - Simulates or connects to physical temperature sensors.
  - Uses `iot_agent.py` to collect, verify, and dispatch data.
  - Includes mock data support and a Python virtual environment for local testing.

---

### 🔐 ZK Circuits (`circuits/`)
- **Tool**: Circom
- **Responsibilities**:
  - Contains `TemperatureCheck.circom` circuit for validating sensor readings.
  - Generates zk-SNARKs to prove data is within an acceptable temperature range.
  - Ensures data privacy and cryptographic integrity before submission to the blockchain.

---

### 🌐 Frontend (`frontend/`)
- **Tech Stack**: React, Chart.js, Axios, Socket.IO
- **Responsibilities**:
  - Real-time dashboard to visualize blockchain-stored temperature data.
  - Components like `TemperatureChart.js` and `NFTVisualizer.js` enhance interactivity.
  - Uses `lite-server` and BrowserSync for development/testing.

---

### 🧪 Local Blockchain Setup (`test-ledger/`)
- **Components**:
  - Solana test validator with local genesis config and snapshots.
  - Provides a full mock blockchain environment for integration testing.
  - Logs and configuration files enable end-to-end traceability.

---

## 🚀 How It Works (Use Case Flow)

1. **Data Collection**: An IoT agent records ambient temperature periodically.
2. **ZK Validation**: The data is passed through a Circom zk-SNARK circuit to verify it's within acceptable bounds.
3. **Proof Generation**: A zero-knowledge proof is generated without revealing the actual data value.
4. **Blockchain Submission**: The proof and data hash are sent to a Solana smart contract.
5. **Visualization**: The frontend queries the blockchain and visualizes incoming validated temperature data live.

---

## ⚙️ Technologies Used

- 🛠 **Solana** — High-performance blockchain for decentralized storage.
- ⚓ **Anchor** — Framework for writing and testing Solana smart contracts.
- 🔒 **Circom** — DSL for writing zero-knowledge circuits.
- 🐍 **Python** — Agent software to simulate and push data.
- ⚛️ **React** — Web frontend framework.
- 📊 **Chart.js** — For plotting temperature trends.
- 🦀 **Rust** — Language for secure smart contract logic.

---

## 📦 Project Structure

AutoChain/
├── agent/ # Python IoT data agent
├── circuits/ # zk-SNARK circuits written in Circom
├── frontend/ # React dashboard with visualization
├── programs/ # Solana smart contracts in Rust
└── test-ledger/ # Local Solana validator setup for integration testing

🚀 AutobotChain Prototype - Developer Setup Guide
🛠 Prerequisites
Ensure the following are installed:

1. Python 3.9+

2. pip

3. virtualenv

4. Node.js & npm (if your program includes a frontend)

5. Rust & Solana CLI
curl -sSf https://sh.rustup.rs | sh
sh -c "$(curl -sSfL https://release.solana.com/v1.18.4/install)"

Anchor (for Solana smart contract development)

cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked

📦 Step 1: Clone the Repo
git clone https://github.com/yourusername/autochain-prototype.git
cd autochain-prototype

🐍 Step 2: Set Up Python Environment
python3 -m venv venv
source venv/bin/activate

If requirements.txt exists, install dependencies:
pip install -r requirements.txt

🧱 Step 3: Start the Solana Test Validator
solana-test-validator --ledger test-ledger

🧾 Step 4: Deploy the Solana Smart Contract
cd program
anchor build
anchor deploy

Copy the generated program ID and ensure it’s referenced correctly in iot_agent.py.

🤖 Step 5: Run the IoT Agent Server
In a new terminal:
cd agent
source ../venv/bin/activate
python iot_agent.py

🌐 API Access
The FastAPI server will start on:
http://127.0.0.1:8000



