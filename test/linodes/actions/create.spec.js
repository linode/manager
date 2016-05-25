import { expect } from 'chai';
import sinon from 'sinon';
import * as actions from '~/linodes/actions/create';
import * as linode_actions from '~/actions/api/linodes';
import { mock_context } from '~/../test/mocks';
import { pushPath } from 'redux-simple-router'

describe("linodes/actions/create", () => {
  describe("changeSourceTab", () => {
    it("should return a CHANGE_SOURCE_TAB action", () => {
      expect(actions.changeSourceTab(1))
        .to.deep.equal({
          type: actions.CHANGE_SOURCE_TAB,
          tab: 1
        });
    });
  });

  describe("selectSource", () => {
    it("should return a SELECT_SOURCE action", () => {
      expect(actions.selectSource("distribution_1234"))
        .to.deep.equal({
          type: actions.SELECT_SOURCE,
          source: "distribution_1234"
        });
    });
  });

  describe("selectDatacenter", () => {
    it("should return a SELECT_DATACENTER action", () => {
      expect(actions.selectDatacenter("datacenter_1234"))
        .to.deep.equal({
          type: actions.SELECT_DATACENTER,
          datacenter: "datacenter_1234"
        });
    });
  });

  describe("selectService", () => {
    it("should return a SELECT_SERVICE action", () => {
      expect(actions.selectService("service_1234"))
        .to.deep.equal({
          type: actions.SELECT_SERVICE,
          service: "service_1234"
        });
    });
  });

  describe("toggleAllPlans", () => {
    it("should return a TOGGLE_ALL_PLANS action", () => {
      expect(actions.toggleAllPlans())
        .to.deep.equal({ type: actions.TOGGLE_ALL_PLANS });
    });
  });

  describe("setLabel", () => {
    it("should return a SET_LABEL action", () => {
      expect(actions.setLabel("hello-world"))
        .to.deep.equal({
          type: actions.SET_LABEL,
          label: "hello-world"
        });
    });
  });

  describe("generatePassword", () => {
    it("should return a GENERATE_PASSWORD action", () => {
      expect(actions.generatePassword())
        .to.deep.equal({ type: actions.GENERATE_PASSWORD });
    });
  });

  describe("toggleShowPassword", () => {
    it("should return a TOGGLE_SHOW_PASSWORD action", () => {
      expect(actions.toggleShowPassword())
        .to.deep.equal({ type: actions.TOGGLE_SHOW_PASSWORD });
    });
  });

  describe("createLinode", () => {
    let sandbox = null;
    
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
      sandbox.restore();
    });

    const state = {
      authentication: {
        token: 'token'
      },
      linodes: {
        create: {
          label: "label",
          datacenter: "datacenter_123",
          service: "service_123",
          source: "distro_123",
          password: "password"
        }
      }
    };
    const response = {
      id: "linode_1234",
      label: "label"
    };

    it("should return a function", () => {
      expect(actions.createLinode()).to.be.a("function");
    });

    it("should call getState() once", async () => {
      await mock_context(sandbox, async ({
          auth, dispatch, getState, fetchStub
        }) => {
          const func = actions.createLinode();
          await func(dispatch, getState);
          expect(getState.calledOnce).to.be.true;
        }, response, state);
    });

    it("should dispatch a TOGGLE_CREATING action", async () => {
      await mock_context(sandbox, async ({
          auth, dispatch, getState, fetchStub
        }) => {
          const func = actions.createLinode();
          await func(dispatch, getState);
          expect(dispatch.calledWith({
            type: actions.TOGGLE_CREATING
          })).to.be.true;
        }, response, state);
    });

    it("should perform an HTTP POST to /linodes", async () => {
      await mock_context(sandbox, async ({
          auth, dispatch, getState, fetchStub
        }) => {
          const func = actions.createLinode();
          await func(dispatch, getState);
          expect(fetchStub.calledWith(
            'token', "/linodes", {
              method: 'POST',
              body: JSON.stringify({
                label: "label",
                datacenter: "datacenter_123",
                service: "service_123",
                source: "distro_123",
                root_pass: "password"
              })
            }
          )).to.be.true;
        }, response, state);
    });

    it("should dispatch an UPDATE_LINODE action with the new linode", async () => {
      await mock_context(sandbox, async ({
          auth, dispatch, getState, fetchStub
        }) => {
          const func = actions.createLinode();
          await func(dispatch, getState);
          expect(dispatch.calledWith({
            type: linode_actions.UPDATE_LINODE,
            linode: response
          })).to.be.true;
        }, response, state);
    });

    it("should dispatch a routing action to navigate to the detail page", async () => {
      await mock_context(sandbox, async ({
          auth, dispatch, getState, fetchStub
        }) => {
          const func = actions.createLinode();
          await func(dispatch, getState);
          expect(dispatch.calledWith(
            pushPath(`/linodes/${response.id}`)
          )).to.be.true;
        }, response, state);
    });

    it("should dispatch a CLEAR_FORM action", async () => {
      await mock_context(sandbox, async ({
          auth, dispatch, getState, fetchStub
        }) => {
          const func = actions.createLinode();
          await func(dispatch, getState);
          expect(dispatch.calledWith({ type: actions.CLEAR_FORM })).to.be.true;
        }, response, state);
    });

    it("should update the linode until it finishes provisioning", async () => {
      await mock_context(sandbox, async ({
          auth, dispatch, getState, fetchStub
        }) => {
          const func = actions.createLinode();
          const update = sandbox.spy(() => { });
          const _update = sandbox.stub(linode_actions, "updateLinodeUntil", update);
          await func(dispatch, getState);
          expect(update.calledWith(response.id)).to.be.true;
          expect(update.args[0][1]).to.be.a("function");
          expect(update.args[0][1]({ state: "provisioning" })).to.be.false;
          expect(update.args[0][1]({ state: "powered_off" })).to.be.true;
        }, response, state);
    });
  });
});
