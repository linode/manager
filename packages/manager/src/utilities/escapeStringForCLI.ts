const escapeStringForCLI = (value: string) => {
  return value.replace(/(["'$`\\])/g, '\\$1');
};

export default escapeStringForCLI;
