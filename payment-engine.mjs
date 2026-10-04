"use strict";

//========================
// Custom Errors Types
//========================
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

export class InsufficientFundsError extends Error {
    constructor(message) {
    super(message);
    this.name = "InsufficientFundsError";
  }
}

export class GatewayError extends Error {
    constructor(message) {
    super(message);
    this.name = "GatewayError";
    }
}

//========================
//Assertion Functions
//========================
export function assert(condition, message) {
    if (!condition) {
        throw new ValidationError(message);
    }
}

//========================
// Retry Helper Function
//========================
export function retry(action, attempts) {
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return action();
        } catch (error) {
            if (attempt === attempts) {
                throw error;
            }
        }
    }
}

//========================
// Fake Payment Gateway
//========================
class PaymentGateway {
    constructor() {
        this.attempts = 0;
    }
    charge(amount) {
        this.attempts++;
        // Simulate temporary gateway failure
        if (this.attempts < 3) {
            throw new GatewayError("Temporary gateway failure. Please try again.");
        }
        // Simulate successful charge
        return {
            success: true,
            transactionId: `TNX-${Date.now()}`,
            amount: amount
        };
    }
}

//=========================
// Payment Engine
//=========================
export class PaymentEngine {
    constructor(balance) {
        assert(
            typeof balance === "number", "Balance must be a number"
        );

        assert(
            balance >= 0,
            "Balance Cannot be nagative"
        );
        this.balance = balance;
        this.processing = false;
        this.gateway = new PaymentGateway();
    }
    //=========================
    // Process Payment
    //=========================
    processPayment (amount) {
        //Valid payment amount 
        assert(
            typeof amount === "number", "Payment amount must be a number"
        );
        assert(
            amount > 0,
            "Payment amount must be greater than zero"
        );

        // Cheack available balance
        if (amount > this.balance) {
            throw new InsufficientFundsError("Insufficient funds for this payment");
        }

        //Prevent simultaneous processing
        if (this.processing) {
            throw new ValidationError("Another payment is already being processed");
        }
        this.processing = true;

        try{
            // Retry gateway operation up to 3 times
            const result = retry (() =>
            this.gateway.charge(amount),3);

            // Update balance only ofter seccessful payment
            this.balance -= amount;
            return{
                ...result, remainingBalance:
                this.balance
            };
        } catch (error) {
            // Selective error handling 
            if(error instanceof GatewayError) {
                throw new GatewayError(`Payment failed after retries: ${error.message}`);
            }
            // Let other errors propagate
            throw error;
        } finally {
            // Always release processing state
            this.processing = false;
        }
    }
}