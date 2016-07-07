import sinon from 'sinon';
import { expect } from 'chai';
import {
  UPDATE_DATACENTERS,
  fetchDatacenters,
} from '~/actions/api/datacenters';
import * as fetch from '~/fetch';

describe('actions/api/datacenters', () => {
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
    datacenters: [
      { id: 'datacenter_1' },
      { id: 'datacenter_2' },
    ],
    total_pages: 3,
    total_results: 25 * 3 - 4,
    page: 1,
  };

  it('should fetch datacenters', async () => {
    const dispatch = getDispatch();
    const fetchStub = getFetchStub(mockResponse);
    const getState = getGetState();

    const f = fetchDatacenters();

    await f(dispatch, getState);

    expect(fetchStub.calledWith(
      auth.token, '/datacenters?page=1')).to.equal(true);
    expect(dispatch.calledWith({
      type: UPDATE_DATACENTERS,
      response: mockResponse,
    })).to.equal(true);
  });
});
