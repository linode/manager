import sinon from 'sinon';
import * as fetch from '~/fetch';

export const mock_context = async (f, rsp, state={}) => {
  const auth = { token: 'token' };
  let getState = sinon.stub().returns({
    authentication: auth,
    ...state
  });
  let dispatch = sinon.spy();
  let fetchStub = sinon.stub(fetch, "fetch").returns({
    json: () => rsp
  });
  await f({auth, getState, dispatch, fetchStub});
  fetchStub.restore();
};
