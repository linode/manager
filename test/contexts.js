import sinon from 'sinon';
import * as fetch from '~/fetch';

export const mockContext = async (sandbox, stubInfo, f) => {
  const stubs = stubInfo.map(({ obj, accessor, rsp }) =>
    sinon.stub(obj, accessor).returns(rsp));

  await f(stubs);

  stubs.forEach(stub => {
    stub.restore();
  });
};

export const mockFetchContext = async (sandbox, f, rsp, state = {}) => {
  const auth = { token: 'token' };
  const getState = sinon.stub().returns({
    authentication: auth,
    ...state,
  });
  const dispatch = sinon.spy();
  const stubInfo = [
    { obj: fetch, accessor: 'fetch', rsp: { json: () => rsp } },
  ];

  const fCurried = async ([fetchStub]) => {
    await f({ auth, getState, dispatch, fetchStub });
  };
  return mockContext(sandbox, stubInfo, fCurried, state);
};

export const mockInternalFetchContext = async (sandbox, f) => {
  const stubInfo = [
    { obj: fetch, accessor: 'rawFetch', rsp: null },
  ];
  const fCurried = async ([fetchStub]) => {
    await f({ fetchStub });
  };
  return mockContext(sandbox, stubInfo, fCurried);
};
