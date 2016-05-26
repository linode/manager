import sinon from 'sinon';
import * as fetch from '~/fetch';

export const mockContext = async (sandbox, f, rsp, state = {}) => {
  const auth = { token: 'token' };
  const getState = sinon.stub().returns({
    authentication: auth,
    ...state,
  });
  const dispatch = sinon.spy();
  const fetchStub = sinon.stub(fetch, 'fetch').returns({
    json: () => rsp,
  });
  await f({ auth, getState, dispatch, fetchStub });
  fetchStub.restore();
};
