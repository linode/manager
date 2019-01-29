// Sort function for Array.sort comparator functions

const sortAlphabetically = (a: string, b: string): number => {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();

  if (aLower < bLower) {
    return -1;
  }
  if (aLower > bLower) {
    return 1;
  }
  return 0;
};

export default sortAlphabetically;
