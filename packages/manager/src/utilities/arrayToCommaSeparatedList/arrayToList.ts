export default (input: string[]): string => {
  if (input.length === 1) {
    return input[0];
  }
  if (input.length === 2) {
    return `${input[0]} and ${input[1]}`;
  } else {
    const head = input.slice(0, -1);
    const tail = input[input.length - 1];
    return `${head.join(', ')}, and ${tail}`;
  }
};
