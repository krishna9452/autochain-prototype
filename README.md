# AutobotChain-prototype
# 🌡️ AutobotChain : Decentralized IoT Monitoring System

AutobotChain is a **decentralized IoT monitoring platform** that combines the power of **Solana blockchain**, **zero-knowledge proofs (zk-SNARKs)** using **Circom**, and a real-time **web dashboard** built with React. The system enables privacy-preserving and tamper-proof recording of environmental sensor data, with a focus on **temperature monitoring**.

---

## 📖 Overview

AutobotChain securely collects and validates temperature data from IoT agents, verifies the data using zero-knowledge circuits, and immutably stores the result on the Solana blockchain. A responsive frontend visualizes this data in real time, ensuring transparency and auditability for use cases such as:

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




<img width="1366" height="689" alt="snap6" src="https://github.com/user-attachments/assets/a2422ad4-18b3-43e0-b94f-3c4199361adf" />
<img width="1366" height="646" alt="snap5" src="https://github.com/user-attachments/assets/f6dc179e-2710-4c38-a7a0-890a415f6ecb" />
<img width="1366" height="648" alt="snap4" src="https://github.com/user-attachments/assets/36c25298-af8c-40d8-b5e2-6a87c27f0f91" />
<img width="1366" height="642" alt="snap3" src="https://github.com/user-attachments/assets/fdddc854-95fd-4d0f-bb60-675d9c4feb6e" />
<img width="1365" height="648" alt="snap2" src="https://github.com/user-attachments/assets/a926f1d5-d37b-43b9-9a0b-1c3f03cf707b" />
<img width="1365" height="682" alt="snap1" src="https://github.com/user-attachments/assets/89f6e469-f4cc-4970-a041-12a0d4610456" />

