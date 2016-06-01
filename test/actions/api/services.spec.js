import sinon from 'sinon';
import { expect } from 'chai';
import {
  UPDATE_SERVICES,
  fetchServices,
} from '~/actions/api/services';
import { mockContext } from '~/../test/mocks';

describe('actions/api/services', sinon.test(() => {
  let sandbox = null;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  const mockFetchResponse = 'foobar';

  it('should fetch services', async () => {
    await mockContext(sandbox, async ({
        auth, dispatch, getState, fetchStub,
      }) => {
      const f = fetchServices();

      await f(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/services?page=1')).to.equal(true);
      expect(dispatch.calledWith({
        type: UPDATE_SERVICES,
        response: mockFetchResponse,
      })).to.equal(true);
    }, mockFetchResponse);
  });
}));
