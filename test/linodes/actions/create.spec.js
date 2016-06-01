import { expect } from 'chai';
import sinon from 'sinon';
import * as actions from '~/linodes/actions/create';
import * as linodeActions from '~/actions/api/linodes';
import { pushPath } from 'redux-simple-router';
import * as fetch from '~/fetch';

describe('linodes/actions/create', () => {
  let sandbox = null;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  describe('changeSourceTab', () => {
    it('should return a CHANGE_SOURCE_TAB action', () => {
      expect(actions.changeSourceTab(1))
        .to.deep.equal({
          type: actions.CHANGE_SOURCE_TAB,
          tab: 1,
        });
    });
  });

  describe('selectSource', () => {
    it('should return a SELECT_SOURCE action', () => {
      expect(actions.selectSource('distribution_1234'))
        .to.deep.equal({
          type: actions.SELECT_SOURCE,
          source: 'distribution_1234',
        });
    });
  });

  describe('selectDatacenter', () => {
    it('should return a SELECT_DATACENTER action', () => {
      expect(actions.selectDatacenter('datacenter_1234'))
        .to.deep.equal({
          type: actions.SELECT_DATACENTER,
          datacenter: 'datacenter_1234',
        });
    });
  });

  describe('selectService', () => {
    it('should return a SELECT_SERVICE action', () => {
      expect(actions.selectService('service_1234'))
        .to.deep.equal({
          type: actions.SELECT_SERVICE,
          service: 'service_1234',
        });
    });
  });

  describe('toggleAllPlans', () => {
    it('should return a TOGGLE_ALL_PLANS action', () => {
      expect(actions.toggleAllPlans())
        .to.deep.equal({ type: actions.TOGGLE_ALL_PLANS });
    });
  });

  describe('setLabel', () => {
    it('should return a SET_LABEL action', () => {
      expect(actions.setLabel('hello-world'))
        .to.deep.equal({
          type: actions.SET_LABEL,
          label: 'hello-world',
        });
    });
  });

  describe('generatePassword', () => {
    it('should return a GENERATE_PASSWORD action', () => {
      expect(actions.generatePassword())
        .to.deep.equal({ type: actions.GENERATE_PASSWORD });
    });
  });

  describe('toggleShowPassword', () => {
    it('should return a TOGGLE_SHOW_PASSWORD action', () => {
      expect(actions.toggleShowPassword())
        .to.deep.equal({ type: actions.TOGGLE_SHOW_PASSWORD });
    });
  });

  describe('createLinode', () => {
    afterEach(() => {
      sandbox.restore();
    });

    const auth = { token: 'token' };
    const getGetState = (_state = {}) => sandbox.stub().returns({
      authentication: auth,
      ..._state,
    });
    const getDispatch = () => sandbox.spy();
    const getFetchStub = (rsp) => sandbox.stub(fetch, 'fetch').returns({ json() { return rsp; } });

    const state = {
      authentication: {
        token: 'token',
      },
      linodes: {
        create: {
          label: 'label',
          datacenter: 'datacenter_123',
          service: 'service_123',
          source: 'distro_123',
          password: 'password',
        },
      },
    };
    const response = {
      id: 'linode_1234',
      label: 'label',
    };

    it('should return a function', () => {
      expect(actions.createLinode()).to.be.a('function');
    });

    it('should call getState() once', async () => {
      const dispatch = getDispatch();
      const getState = getGetState(state);
      getFetchStub(response);
      const func = actions.createLinode();
      await func(dispatch, getState);
      expect(getState.calledOnce).to.equal(true);
    });

    it('should dispatch a TOGGLE_CREATING action', async () => {
      const dispatch = getDispatch();
      const getState = getGetState(state);
      getFetchStub(response);
      const func = actions.createLinode();
      await func(dispatch, getState);
      expect(dispatch.calledWith({
        type: actions.TOGGLE_CREATING,
      })).to.equal(true);
    });

    it('should perform an HTTP POST to /linodes', async () => {
      const fetchStub = getFetchStub(response);
      const getState = getGetState(state);
      const dispatch = getDispatch();
      const func = actions.createLinode();
      await func(dispatch, getState);
      expect(fetchStub.calledWith(
        'token', '/linodes', {
          method: 'POST',
          body: JSON.stringify({
            label: 'label',
            datacenter: 'datacenter_123',
            service: 'service_123',
            source: 'distro_123',
            root_pass: 'password',
          }),
        }
      )).to.equal(true);
    });

    it('should dispatch an UPDATE_LINODE action with the new linode', async () => {
      const dispatch = getDispatch();
      const getState = getGetState(state);
      getFetchStub(response);
      const func = actions.createLinode();
      await func(dispatch, getState);
      expect(dispatch.calledWith({
        type: linodeActions.UPDATE_LINODE,
        linode: response,
      })).to.equal(true);
    });

    it('should dispatch a routing action to navigate to the detail page', async () => {
      const dispatch = getDispatch();
      const getState = getGetState(state);
      getFetchStub(response);
      const func = actions.createLinode();
      await func(dispatch, getState);
      expect(dispatch.calledWith(
        pushPath(`/linodes/${response.id}`)
      )).to.equal(true);
    });

    it('should dispatch a CLEAR_FORM action', async () => {
      const dispatch = getDispatch();
      const getState = getGetState(state);
      getFetchStub(response);
      const func = actions.createLinode();
      await func(dispatch, getState);
      expect(dispatch.calledWith({ type: actions.CLEAR_FORM })).to.equal(true);
    });

    it('should update the linode until it finishes provisioning', async () => {
      const dispatch = getDispatch();
      const getState = getGetState(state);
      getFetchStub(response);
      const func = actions.createLinode();
      const update = sandbox.spy(() => { });
      sandbox.stub(linodeActions, 'updateLinodeUntil', update);
      await func(dispatch, getState);
      expect(update.calledWith(response.id)).to.equal(true);
      expect(update.args[0][1]).to.be.a('function');
      expect(update.args[0][1]({ state: 'provisioning' })).to.equal(false);
      expect(update.args[0][1]({ state: 'powered_off' })).to.equal(true);
    });
  });
});
