"use strict";
import {PaymentEngine} from
"./payment-engine.mjs";

// Create a payment account
const account = new PaymentEngine(1000);

try{
    // Process a payment
    const result = account.processPayment(300);
    console.log("==================================");
    console.log("PAYMENT SUCCESSFUL");
    console.log("==================================");
    console.log("Transaction ID =",result.transactionId);
    console.log("Amount =",result.amount);
    console.log("Remaining Balance =", result.remainingBalance);

    } catch (error) {
        // Handle payment errors
        console.log("====================================");
        console.log("PAYMENT FAILED");
        console.log("====================================");
        console.log("Error Type =", error.name);
        console.log("Message =", error.message);
    }