// type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const headers = ` -H "Content-Type: application/json"
    -H "Authorization: Bearer $TOKEN"
`;

const generateCurlCommand = (data: {}) => {
  const command = `
curl ${headers}
  -X POST
  -d ${JSON.stringify(data)}
  https://api.linode.com/v4/
`;
  return command.trimStart().trimEnd();
};

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

export default generateCurlCommand;
