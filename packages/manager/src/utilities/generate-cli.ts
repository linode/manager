type JSONFieldToArray = [string, unknown];

const convertJSONFieldToCLIArg = ([key, value]: JSONFieldToArray) => {
  return `--${key} ${value}`;
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
