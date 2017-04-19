import sinon from 'sinon';
import * as linodes from '~/api/linodes';
import { testLinode } from '@/data/linodes';
import { expectRequest } from '@/common.js';

describe('api/linodes', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should request a lish token', async () => {
    const lishTokenFunction = await linodes.lishToken(testLinode.id);
    await expectRequest(lishTokenFunction, `/linode/instances/${testLinode.id}/lish_token`);
  });
});
