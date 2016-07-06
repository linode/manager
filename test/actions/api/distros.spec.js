import sinon from 'sinon';
import { expect } from 'chai';
import {
  UPDATE_DISTROS,
  fetchDistros,
} from '~/actions/api/distros';
import * as fetch from '~/fetch';

describe('actions/api/distros', async () => {
  const auth = { token: 'token' };

  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const getGetState = (state = {}) => sandbox.stub().returns({
    authentication: auth,
    ...state,
  });
  const getDispatch = () => sandbox.spy();
  const getFetchStub = (rsp) => sandbox.stub(fetch, 'fetch').returns({ json() { return rsp; } });

  const mockResponse = {
    distributions: [
      { id: 'distro_1' },
      { id: 'distro_2' },
    ],
    total_pages: 3,
    total_results: 25 * 3 - 4,
    page: 1,
  };

  it('should fetch distros', async () => {
    const dispatch = getDispatch();
    const fetchStub = getFetchStub(mockResponse);
    const getState = getGetState();

    const f = fetchDistros();

    await f(dispatch, getState);

    expect(fetchStub.calledWith(
      auth.token, '/distributions/?page=1')).to.equal(true);
    expect(dispatch.calledWith({
      type: UPDATE_DISTROS,
      response: mockResponse,
    })).to.equal(true);
  });
});
