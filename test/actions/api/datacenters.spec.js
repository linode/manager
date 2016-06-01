import sinon from 'sinon';
import { expect } from 'chai';
import {
  UPDATE_DATACENTERS,
  fetchDatacenters,
} from '~/actions/api/datacenters';
import { mockContext } from '~/../test/mocks';

describe('actions/api/datacenters', sinon.test(() => {
  let sandbox = null;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  const mockFetchResponse = 'foobar';

  it('should fetch datacenters', async () => {
    await mockContext(sandbox, async ({
        auth, dispatch, getState, fetchStub,
      }) => {
      const f = fetchDatacenters();

      await f(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/datacenters?page=1')).to.equal(true);
      expect(dispatch.calledWith({
        type: UPDATE_DATACENTERS,
        response: mockFetchResponse,
      })).to.equal(true);
    }, mockFetchResponse);
  });
}));
