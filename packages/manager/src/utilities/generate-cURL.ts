// type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
import escapeStringForCLI from './escapeStringForCLI';

const headers = [
  '-H "Content-Type: application/json" \\',
  '-H "Authorization: Bearer $TOKEN" \\',
].join('\n');

const generateCurlCommand = (data: {}, path: string) => {
  const command = `curl ${headers}\n-X POST -d $'${escapeStringForCLI(
    JSON.stringify(data, null, 4)
  )}' https://api.linode.com/v4${path}`;
  return command.trim();
};

export default generateCurlCommand;
