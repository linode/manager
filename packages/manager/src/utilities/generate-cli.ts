type JSONFieldToArray = [string, unknown];

const convertJSONFieldToCLIArg = ([key, value]: JSONFieldToArray) => {
  let valueAsString = value;
  if (typeof value === 'object') {
    valueAsString = `'${JSON.stringify(value).replace(':', ': ')}'`;
  }
  return `--${key} ${valueAsString}`;
};

export const generateCLICommand = (data: {}) => {
  const dataForCLI = Object.entries(data).map(convertJSONFieldToCLIArg);
  return `
linode-cli linodes create
${dataForCLI.join('\n')}
  `
    .trimStart()
    .trimEnd();
};

export default generateCLICommand;
