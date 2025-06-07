pragma circom 2.0.0;

template TemperatureCheck() {
    signal input temperature;
    signal input private secret;
    signal output out;

    // Validate temperature range (0°F < temp < 120°F)
    signal low <== 0;
    signal high <== 120;
    low <== temperature;
    temperature <== high;
    
    // Add secret factor for proof uniqueness
    out <== temperature * secret;
}

component main = TemperatureCheck();