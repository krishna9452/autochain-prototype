#!/bin/bash

# Install circom compiler
npm install -g circom

# Compile circuit
circom TemperatureCheck.circom --r1cs --wasm --sym

# Generate setup
snarkjs powersoftau new bn128 12 pot12_0000.ptau
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau

# Generate keys
snarkjs groth16 setup TemperatureCheck.r1cs pot12_final.ptau temp_check.zkey
snarkjs zkey export verificationkey temp_check.zkey verification_key.json

echo "✅ Circuit compiled and setup complete"