import sinon from 'sinon';
import { expect } from 'chai';
import { mockInternalFetchContext } from './contexts';
import { fetch } from '~/fetch';
import { API_ROOT } from '~/constants';

describe('fetch', () => {
  let sandbox = null;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

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
    },
  };

  it('should default to cors mode and headers for token', async () => {
    await mockInternalFetchContext(sandbox, async ({ fetchStub }) => {
      await fetch(token, '');

      expect(fetchStub.calledWith(
        API_ROOT,
        defaultHeaders,
      )).to.equal(true);
    });
  });

  it('should fetch the correct path', async () => {
    await mockInternalFetchContext(sandbox, async ({ fetchStub }) => {
      await fetch(token, 'path');

      expect(fetchStub.calledWith(
        `${API_ROOT}path`,
        defaultHeaders,
      ));
    });
  });

  it('should include data', async () => {
    await mockInternalFetchContext(sandbox, async ({ fetchStub }) => {
      const data = { data: { foo: 'bar' } };
      await fetch(token, '', data);

      expect(fetchStub.calledWith(
        API_ROOT,
        {
          ...defaultHeaders,
          ...data,
        }
      ));
    });
  });
});
