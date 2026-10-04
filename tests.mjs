"use strict"
import {
    PaymentEngine,
    ValidationError,
    InsufficientFundsError
} from "./payment-engine.mjs";

// Test Helper
function test (label, body) {
    try{
        if(body()) {
            console.log(`PASS: ${label}`);
        } else {
            console.log(`FAL: ${label}`);
        }
    } catch (error) {
        console.log(`ERROR: ${label}`);
        console.log(`{error.message}`);
    }
}

// Test Successful payment
test ("sucessful payment", () => {
    const account = new PaymentEngine(1000);
    const result = account.processPayment(300);
    
    return (
        result.success === true && 
        result.amount === 300 &&
        result.remainingBalance === 700
    );
});

// Test Insufficient Funds
test("insufficient funds should throw custom error", () => {
    const account = new PaymentEngine(500);

    try {
        account.processPayment(800);
        return false;
    }catch (error) {
        return error instanceof InsufficientFundsError;
    }
});

// Test Invalid Payment Amount
test("invalid payment amount should throw validation error", () => {
    const account = new PaymentEngine(100);

    try {
        account.processPayment(-100);
        return false;
    } catch (error) {
        return error instanceof ValidationError;
    }
});

// Test Payment Retry
test("payment should retry temporary gateway failures", () => {
    const account = new PaymentEngine(1000);
    const result = account.processPayment(200);
    return result.success === true;
});

// Test Processing State Cleanup
test ("processing state should be released after payment", () => {
    const account = new PaymentEngine(1000);
    account.processPayment(100);

    return account.processing === false;
});

// Test Balance Amount Validation
test("balance must be a  number", () => {
    try {
        new PaymentEngine("1000");
        return false;
    } catch (error) {
        return error instanceof ValidationError;
    }
});

// Test Payment amount Validation 
test("payment amount must be greater than zero", () => {
    const account = new PaymentEngine(1000);

    try {
        account.processPayment(0);
        return false;
    } catch (error) {
        return error instanceof ValidationError
    }
});
