import sinon from 'sinon';
import { expect } from 'chai';
import {
  UPDATE_SERVICES,
  fetchServices,
} from '~/actions/api/services';
import * as fetch from '~/fetch';

describe('actions/api/services', () => {
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
    services: [
      { id: 'service_1' },
      { id: 'service_2' },
    ],
    total_pages: 3,
    total_results: 25 * 3 - 4,
    page: 1,
  };

  it('should fetch services', async () => {
    const dispatch = getDispatch();
    const fetchStub = getFetchStub(mockResponse);
    const getState = getGetState({
      api: { services: { totalPages: -1 } },
    });

    const f = fetchServices();

    await f(dispatch, getState);

    expect(fetchStub.calledWith(
      auth.token, '/services/?page=1')).to.equal(true);
    expect(dispatch.calledWith({
      type: UPDATE_SERVICES,
      response: mockResponse,
    })).to.equal(true);
  });
});
