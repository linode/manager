const sortAlphabetically = (a: string, b: string): number => {
  a = a.toLowerCase();
  b = b.toLowerCase();

  if (a < b) { return -1; }
  if (a > b) { return 1; }
  return 0;
}

export default sortAlphabetically;