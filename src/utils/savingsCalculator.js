/**
 * Savings Calculation Logic
 * 
 * This file contains the logic for calculating the Estimated Savings
 * based on the capacity and number of installations.
 * You can easily modify the logic or constants here to adjust how savings are calculated.
 * This makes it easy to explain to clients and tweak when formulas change.
 */

// Example constants (tweak these as needed for your business logic)
const TARIFF_RATE = 8; // Cost per unit of electricity in Rupees
const UNITS_PER_KW = 4; // Units generated per kW per day
const DAYS_IN_YEAR = 365;

// Simplified categorical constants matching your previous mock data estimates
const SAVINGS_PER_RESIDENTIAL_INSTALLATION = 10000;
const SAVINGS_PER_WATER_HEATER_INSTALLATION = 1000;
const COMMERCIAL_MULTIPLIER_PER_KW = 2400;

/**
 * Calculate the estimated savings for a given data record.
 * @param {Object} record - The data row object from the dashboard data
 * @returns {Number} The calculated savings
 */
export const calculateSavings = (record) => {
    const category = record.category ? record.category.toLowerCase() : '';
    
    // Support both TVDashboard (Capacity_kW) and Dashboard (CapacityKW) field names
    const capacityKW = Number(record.Capacity_kW) || Number(record.CapacityKW) || 0;
    const installations = Number(record.Installations) || 1; // Default to 1 if missing for per-install logic

    // Category-specific logic
    if (category === 'residential') {
        // e.g., Base savings per home
        return installations * SAVINGS_PER_RESIDENTIAL_INSTALLATION;
    } else if (category === 'commercial') {
        // e.g., Driven heavily by exact capacity
        return capacityKW * COMMERCIAL_MULTIPLIER_PER_KW;
    } else if (category === 'waterheater' || category === 'water heater') {
        return installations * SAVINGS_PER_WATER_HEATER_INSTALLATION;
    }

    // Default fallback logic using standard solar generation math
    // Capacity * (Units/day) * 365 days * Tariff rate
    return capacityKW * UNITS_PER_KW * DAYS_IN_YEAR * TARIFF_RATE;
};
