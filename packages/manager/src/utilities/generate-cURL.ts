// type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const headers = [
  '-H "Content-Type: application/json"',
  '-H "Authorization: Bearer $TOKEN"',
].join('\n');

const generateCurlCommand = (data: {}, path: string) => {
  const command = `curl ${headers}\n-X POST -d ${JSON.stringify(
    data
  )}\n https://api.linode.com/v4/${path}`;
  return command.trimStart().trimEnd();
};

export default generateCurlCommand;
