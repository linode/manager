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

export default generateCurlCommand;
