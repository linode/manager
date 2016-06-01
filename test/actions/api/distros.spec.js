import sinon from 'sinon';
import { expect } from 'chai';
import {
  UPDATE_DISTROS,
  fetchDistros,
} from '~/actions/api/distros';
import { mockContext } from '~/../test/mocks';

describe('actions/api/distros', sinon.test(() => {
  let sandbox = null;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  const mockFetchResponse = 'foobar';

  it('should fetch distros', async () => {
    await mockContext(sandbox, async ({
        auth, dispatch, getState, fetchStub,
      }) => {
      const f = fetchDistros();

      await f(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/distributions?page=1')).to.equal(true);
      expect(dispatch.calledWith({
        type: UPDATE_DISTROS,
        response: mockFetchResponse,
      })).to.equal(true);
    }, mockFetchResponse);
  });
}));
