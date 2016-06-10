import sinon from 'sinon';
import { expect } from 'chai';
import * as fetch from '~/fetch';
import { API_ROOT } from '~/constants';

describe('fetch', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const token = 'my token';
  const defaultHeaders = {
    mode: 'cors',
    headers: {
      Accept: 'application/json',
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
      'X-CORS-Status': 'true',
    },
  };

  const getFetchStub = (status = 200) => sandbox.stub(fetch, 'rawFetch')
    .returns(new Promise((accept) => accept({
      headers: {
        get() {
          return status;
        },
      },
      status: 200,
    })));

  it('should default to cors mode and headers for token', async () => {
    const fetchStub = getFetchStub();
    await fetch.fetch(token, '');

    expect(fetchStub.calledWith(
      API_ROOT,
      defaultHeaders,
    )).to.equal(true);
  });

  it('should fetch the correct path', async () => {
    const fetchStub = getFetchStub();
    await fetch.fetch(token, 'path');

    expect(fetchStub.calledWith(
      `${API_ROOT}path`,
      defaultHeaders,
    ));
  });

  it('should include data', async () => {
    const fetchStub = getFetchStub();
    const data = { data: { foo: 'bar' } };
    await fetch.fetch(token, '', data);

    expect(fetchStub.calledWith(
      API_ROOT,
      {
        ...defaultHeaders,
        ...data,
      }
    ));
  });

  it('should handle X-Status', async () => {
    getFetchStub(201);
    const resp = await fetch.fetch(token, 'path');
    expect(resp.statusCode).to.equal(201);
  });

  it('should handle X-Status errors', async () => {
    getFetchStub(400);
    try {
      await fetch.fetch(token, 'path');
      expect(true).to.equal(false);
    } catch (resp) {
      expect(resp.statusCode).to.equal(400);
    }
  });
});
