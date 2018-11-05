/*
* Formats pricing
*/
const dollarsPerGb = 0.1;
export const displayPrice = (v: number) => `$${v.toFixed(2)}`;
export const displayPricePerSize = (v: number) => displayPrice(v * dollarsPerGb);
