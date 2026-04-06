// type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
import { escapeStringForCLI } from '../escapeStringForCLI';

const headers = [
  '-H "Content-Type: application/json" \\',
  '-H "Authorization: Bearer $TOKEN" \\',
].join('\n');

export const generateCurlCommand = (data: any, path: string) => {
  const keys = Object.keys(data);

  const cleanData: any = {};

  for (const key of keys) {
    if (typeof data[key] === 'string') {
      cleanData[key] = escapeStringForCLI(data[key]);
    }
    cleanData[key] = data[key];
  }

  const command = `curl ${headers}\n-X POST -d '${JSON.stringify(
    cleanData,
    null,
    4
  ).replace(/'/g, `'\\''`)}' https://api.linode.com/v4${path}`;
  return command.trim();
};
