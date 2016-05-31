import * as fetch from '~/fetch';

export const mockContext = async (sandbox, f, rsp, state = {}) => {
  const auth = { token: 'token' };
  const getState = sandbox.stub().returns({
    authentication: auth,
    ...state,
  });
  const dispatch = sandbox.spy();
  const fetchStub = sandbox.stub(fetch, 'fetch').returns({
    json: () => rsp,
  });
  await f({ auth, getState, dispatch, fetchStub });
  fetchStub.restore();
};
