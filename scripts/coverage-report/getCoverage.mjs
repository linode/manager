import { readCoverage } from "./readCoverage.mjs";

const coveragePercentage = readCoverage();

// Intentional log for our GH Action to pick up the value
console.log(coveragePercentage);
