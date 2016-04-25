import {expect} from 'chai';
import sinon from 'sinon';

import * as actions from '../../src/actions/linodes';
import * as fetch from '../../src/fetch';

describe("linodes actions", sinon.test(() => {
  let auth = { token: 'token' };
  let getState = sinon.stub().returns({
    authentication: auth,
    linodes: {
      linodes: {
        "1": {
          "state": "booting"
        }
      }
    }
  });

  let dispatch = sinon.spy();

  beforeEach(() => {
    dispatch.reset();
    getState.reset();
  });
  
  it('should update linodes', async () => {
    let fetchResponse = {
      page: 1,
      total_pages: 1,
      total_results: 0,
      linodes: []
    };

    let fetchStub = sinon.stub(fetch, 'fetch').returns({
      json: () => fetchResponse
    });

    await actions.fetchLinodes()(dispatch, getState);

    sinon.assert.calledWith(fetchStub, auth.token, '/linodes?page=1');
    sinon.assert.calledWith(dispatch, {
      type: actions.UPDATE_LINODES,
      response: fetchResponse
    });

    fetchStub.restore();
  });

  it("should update linode", async () => {
    let fetchResponse = { id: 1 };

    let fetchStub = sinon.stub(fetch, 'fetch').returns({
      json: () => fetchResponse
    });

    await actions.updateLinode(fetchResponse.id)(dispatch, getState);

    sinon.assert.calledWith(fetchStub, auth.token, `/linodes/${fetchResponse.id}`);
    sinon.assert.calledWith(dispatch, {
      type: actions.UPDATE_LINODE,
      linode: fetchResponse
    });

    fetchStub.restore();
  });

  it("should update linode until test passes", async () => {
    let fetchResponse = { id: 1, state: 'booting' };
    let test = linode => linode.state == 'running';

    let fetchStub = sinon.stub(fetch, 'fetch');
    fetchStub.onCall(0).returns({ json: () => fetchResponse });
    fetchStub.onCall(1).returns({ json: () => {
      return { ...fetchResponse, state: 'running' };
    } });

    let timeout = 0; // default is non-zero
    let p = actions.updateLinodeUntil(fetchResponse.id, test, timeout);
    await p(dispatch, getState);

    expect(fetchStub.callCount).to.equal(2);
    expect(dispatch.callCount).to.equal(4);
    sinon.assert.calledWith(dispatch.getCall(1), {
      type: actions.UPDATE_LINODE,
      linode: fetchResponse
    });
    dispatch.getCall(2).calledWith({
      ...fetchResponse,
      state: 'running'
    });

    fetchStub.restore();
  });
}));
