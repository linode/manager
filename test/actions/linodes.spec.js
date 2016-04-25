import {expect} from 'chai';
import sinon from 'sinon';

import * as actions from '../../src/actions/linodes';
import * as fetch from '../../src/fetch';

describe("linodes actions", sinon.test(() => {
  let auth = { token: 'token' };
  let getState = sinon.stub().returns({
    authentication: auth,
    linodes: { linodes: { 1: { id: 1, _polling: false } } }
  });

  let dispatch = sinon.spy();

  beforeEach(() => {
    // Make sure callCount is reset after each test, etc.
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
    sinon.assert.calledWith(dispatch.getCall(0), {
      type: actions.UPDATE_LINODE,
      linode: { id: fetchResponse.id, _polling: true }
    })
    sinon.assert.calledWith(dispatch.getCall(1), {
      type: actions.UPDATE_LINODE,
      linode: fetchResponse
    });
    sinon.assert.calledWith(dispatch.getCall(2), {
      type: actions.UPDATE_LINODE,
      linode: { ...fetchResponse, state: 'running' }
    });
    sinon.assert.calledWith(dispatch.getCall(3), {
      type: actions.UPDATE_LINODE,
      linode: { id: fetchResponse.id, _polling: false}
    })

    fetchStub.restore();
  });

  function testLinodeAction(action, tempState, finalState) {
    return async () => {
      let fetchResponse = { id: 1, state: tempState};

      let fetchStub = sinon.stub(fetch, 'fetch');
      // POST /linodes/<id>/<action>
      fetchStub.onCall(0).returns({});
      // GET /linodes/<id>
      fetchStub.onCall(1).returns({ json: () => fetchResponse });
      fetchStub.onCall(2).returns({ json: () => {
        return { ...fetchResponse, state: finalState };
      } });

      let callCount = 0;
      let dispatch = sinon.spy(async (action) => {
        callCount++;
        if (callCount !== 2) return;

        // Second call must dispatch updateLinodeUntil() result.
        await action(dispatch, getState);
      });

      let timeout = 0; // speed things up
      let p = action(fetchResponse.id, timeout);
      await p(dispatch, getState);

      expect(fetchStub.callCount).to.equal(3);
      expect(dispatch.callCount).to.equal(6);

      sinon.assert.calledWith(dispatch.getCall(0), {
        type: actions.UPDATE_LINODE,
        linode: fetchResponse
      });
      // Second call dispatches updateLinodeUntil
      sinon.assert.calledWith(dispatch.getCall(2), {
        type: actions.UPDATE_LINODE,
        linode: { id: fetchResponse.id, _polling: true }
      })
      sinon.assert.calledWith(dispatch.getCall(3), {
        type: actions.UPDATE_LINODE,
        linode: fetchResponse
      });
      sinon.assert.calledWith(dispatch.getCall(4), {
        type: actions.UPDATE_LINODE,
        linode: { ...fetchResponse, state: finalState }
      });
      sinon.assert.calledWith(dispatch.getCall(5), {
        type: actions.UPDATE_LINODE,
        linode: { id: fetchResponse.id, _polling: false }
      })

      fetchStub.restore();
    };
  }

  it("should power on linode and check till running",
     testLinodeAction(actions.powerOnLinode, "booting", "running"));

  it("should power off linode and check till offline",
     testLinodeAction(actions.powerOffLinode, "shutting_down", "offline"));

  it("should reboot linode and check till running",
     testLinodeAction(actions.rebootLinode, "rebooting", "running"));
}));
