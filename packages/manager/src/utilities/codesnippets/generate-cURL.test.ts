import { createLinodeRequestFactory } from 'src/factories/linodes';

import { generateCurlCommand } from './generate-cURL';

const linodeRequest = createLinodeRequestFactory.build();
const linodeData = {
  ...linodeRequest,
  stackscript_data: {
    gh_username: 'linode',
  },
  stackscript_id: 10079,
};

const createLinodePath = '/linode/instance';

const linodeDataString = JSON.stringify(linodeData, null, 4);

const generatedCommand = generateCurlCommand(linodeData, createLinodePath);

describe('generateCurlCommand', () => {
  it('should return a string that starts with curl', () => {
    expect(generatedCommand.slice(0, 4)).toBe('curl');
  });

  it('should produce a curl command that targets the linode API', () => {
    expect(generatedCommand).toMatch('https://api.linode.com/v4/');
  });

  it('should return a curl command that has a Content-Type header set to application/json', () => {
    expect(generatedCommand).toMatch('-H "Content-Type: application/json"');
  });

  it('should return a curl command that has an Authorization header set to Bearer $TOKEN', () => {
    expect(generatedCommand).toMatch('-H "Authorization: Bearer $TOKEN"');
  });

  it('should return a curl command that has an HTTP method set', () => {
    expect(generatedCommand).toMatch(/-X (POST)/);
  });

  it('should return a curl command that has a data option set', () => {
    expect(generatedCommand).toMatch('-d');
  });

  it('should return a curl command that has a data option set to the argument passed to it', () => {
    expect(generatedCommand).toMatch(`-d '${linodeDataString}'`);
  });
});
