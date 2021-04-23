export default (input: string[], separator?: string): string => {
  if (!Array.isArray(input) || input.length === 0) {
    return '';
  }
  if (input.length === 1) {
    return input[0];
  }
  if (input.length === 2) {
    return `${input[0]} and ${input[1]}`;
  } else {
    const head = input.slice(0, -1);
    const tail = input[input.length - 1];

    if (separator) {
      return `${head.join(`${separator} `)}${separator} and ${tail}`;
    }

    return `${head.join(', ')}, and ${tail}`;
  }
};
