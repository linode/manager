export function getIsTableStripingEnabled(value: boolean | undefined) {
  if (value === undefined) {
    // If no preference is set, enable table striping by default
    return true;
  }

  return value;
}
