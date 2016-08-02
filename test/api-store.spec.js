import sinon from 'sinon';
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import makeApiList, {
  makeFetchPage,
  makeFetchItem,
  makeFetchUntil,
  makeDeleteItem,
  makePutItem,
  makeCreateItem,
  invalidateCache,
  setFilter,
} from '~/api-store';
import * as fetch from '~/fetch';

describe('api-store', () => {
  const mockFoobarsResponse = {
    foobars: [
      { id: 'foobar_1' },
      { id: 'foobar_2' },
    ],
    total_pages: 3,
    total_results: 25 * 3 - 4,
    page: 1,
  };

  const auth = { token: 'token' };

  const sandbox = sinon.sandbox.create();

  describe('api-store/makeApiList', () => {
    afterEach(() => {
      sandbox.restore();
    });

    it('should handle initial state', () => {
      const s = makeApiList({
        plural: 'foobars',
        singular: 'foobar',
        actions: {
          update_singular: 'UPDATE_ONE',
          update_many: 'UPDATE_MANY',
          delete_one: 'DELETE_ONE',
        },
      });

      expect(
        s(undefined, {})
      ).to.be.eql({
        pagesFetched: [], totalPages: -1, foobars: {},
        filter: null, singular: 'foobar', plural: 'foobars',
      });
    });

    it('should not handle actions not specified', () => {
      const s = makeApiList({
        plural: 'foobars',
        singular: 'foobar',
        actions: { update_singular: 'UPDATE_ONE' },
      });
      const state = s(undefined, {});
      deepFreeze(state);

      expect(
        s(state, { type: 'DELETE_ONE' })
      ).to.be.eql(state);
    });

    it('should handle updating many records', () => {
      const s = makeApiList({
        plural: 'foobars',
        singular: 'foobar',
        actions: { update_many: 'UPDATE_MANY' },
      });

      const state = s(undefined, {});
      deepFreeze(state);

      const result = s(state, {
        type: 'UPDATE_MANY',
        response: mockFoobarsResponse,
      });

      expect(result)
        .to.have.property('foobars')
        .which.has.keys('foobar_1', 'foobar_2');
    });

    it('should add internal properties to objects', () => {
      const s = makeApiList({
        plural: 'foobars',
        singular: 'foobar',
        actions: { update_many: 'UPDATE_MANY' },
      });

      const state = s(undefined, {});
      deepFreeze(state);

      const result = s(state, {
        type: 'UPDATE_MANY',
        response: {
          foobars: [
            { id: 'foobar_1' },
            { id: 'foobar_2' },
          ],
          total_pages: 3,
          total_results: 25 * 3 - 4,
          page: 1,
        },
      });

      expect(result)
        .to.have.property('foobars')
        .which.has.property('foobar_1')
        .which.has.property('_polling');
    });

    it('should invoke custom transforms', () => {
      const s = makeApiList({
        plural: 'foobars',
        singular: 'foobar',
        actions: { update_many: 'UPDATE_MANY' },
      }, o => ({ ...o, test: 1234 }));

      const state = s(undefined, {});
      deepFreeze(state);

      const result = s(state, {
        type: 'UPDATE_MANY',
        response: {
          foobars: [
            { id: 'foobar_1' },
            { id: 'foobar_2' },
          ],
          total_pages: 3,
          total_results: 25 * 3 - 4,
          page: 1,
        },
      });

      expect(result)
        .to.have.property('foobars')
        .which.has.property('foobar_1')
        .which.has.property('test')
        .which.equals(1234);
    });

    it('should handle adding a single resource', () => {
      const s = makeApiList({
        plural: 'foobars',
        singular: 'foobar',
        actions: { update_singular: 'UPDATE_SINGLE' },
      });

      const state = s(undefined, {});
      deepFreeze(state);

      const result = s(state, {
        type: 'UPDATE_SINGLE',
        foobar: { id: 'foobar_1' },
      });

      expect(result)
        .to.have.property('foobars')
        .which.has.keys('foobar_1');
    });

    it('should handle updating a single resource', () => {
      const s = makeApiList({
        plural: 'foobars',
        singular: 'foobar',
        actions: { update_singular: 'UPDATE_SINGLE' },
      });

      let state = s(undefined, {});
      state = {
        ...state,
        foobars: {
          ...state.foobars,
          foobar_1: { id: 'foobar_1' },
        },
      };
      deepFreeze(state);

      const result = s(state, {
        type: 'UPDATE_SINGLE',
        foobar: { id: 'foobar_1', name: 'hello' },
      });

      expect(result)
        .to.have.property('foobars')
        .which.has.property('foobar_1')
        .which.has.property('name')
        .which.equals('hello');
    });

    it('should handle deleting a single resource', () => {
      const s = makeApiList({
        plural: 'foobars',
        singular: 'foobar',
        actions: { delete_one: 'DELETE_ONE' },
      });

      let state = s(undefined, {});
      state = {
        ...state,
        foobars: {
          ...state.foobars,
          foobar_1: { id: 'foobar_1' },
        },
      };
      deepFreeze(state);

      const result = s(state, {
        type: 'DELETE_ONE',
        id: 'foobar_1',
      });

      expect(result)
        .to.have.property('foobars')
        .which/* .does*/.not.have.property('foobar_1');
    });

    it('should handle invalidate cache actions', () => {
      const s = makeApiList({
        plural: 'foobars',
        singular: 'foobar',
        actions: { },
      });

      let state = s(undefined, { });
      state = {
        ...state,
        foobars: {
          ...state.foobars,
          foobar_1: { id: 'foobar_1' },
        },
        totalPages: 2,
        pagesFetched: [0],
      };
      deepFreeze(state);

      const result = s(state, { type: '@@foobars/INVALIDATE_CACHE' });

      expect(result)
        .to.have.property('totalPages')
        .which.equals(-1);

      expect(result)
        .to.have.property('pagesFetched')
        .which.has.length(0);

      expect(result)
        .to.have.property('foobars')
        .which.deep.equals({ });
    });

    it('should handle set filter actions', () => {
      const s = makeApiList({ plural: 'foobars', singular: 'foobar', actions: { } });
      const state = s(undefined, { });
      deepFreeze(state);
      const action = { type: '@@foobars/SET_FILTER', filter: { foo: 'bar' } };
      const result = s(state, action);
      expect(result)
        .to.have.property('filter')
        .that.deep.equals({ foo: 'bar' });
    });
  });

  function makeApiListWithSub() {
    return makeApiList({
      plural: 'foobars',
      singular: 'foobar',
      actions: { update_many: 'UPDATE_MANY' },
      subresources: {
        foobazes: {
          singular: 'foobaz',
          plural: 'foobazes',
          actions: { update_singular: 'UPDATE_ONE_FOOBAZ' },
        },
      },
    });
  }

  it('should wire up subresources for items', () => {
    const s = makeApiListWithSub();
    const state = s(undefined, {});
    deepFreeze(state);

    const result = s(state, {
      type: 'UPDATE_MANY',
      response: mockFoobarsResponse,
    });

    expect(result)
      .to.have.property('foobars')
      .which.has.property('foobar_1')
      .which.has.property('foobazes')
      .which.has.keys(
        'totalPages',
        'foobazes',
        'filter',
        'pagesFetched',
        'singular',
        'plural');
  });

  it('should handle subresource update singular', () => {
    const s = makeApiListWithSub();

    const state = s(undefined, {
      type: 'UPDATE_MANY',
      response: mockFoobarsResponse,
    });
    deepFreeze(state);

    const result = s(state, {
      type: 'UPDATE_ONE_FOOBAZ',
      foobaz: { id: 'foobaz_123', test: 'hello world' },
      foobars: 'foobar_1',
    });

    expect(result)
      .to.have.property('foobars')
      .which.has.property('foobar_1')
      .which.has.property('foobazes')
      .which.has.property('foobazes')
      .which.has.property('foobaz_123')
      .which.has.property('test').that.equals('hello world');
  });

  describe('api-store/makeFetchPage', () => {
    afterEach(() => {
      sandbox.restore();
    });

    const getGetState = (state = {}) => sandbox.stub().returns({
      authentication: auth,
      ...state,
    });
    const getDispatch = () => sandbox.spy();
    const getFetchStub = (rsp) => sandbox.stub(fetch, 'fetch').returns({ json() { return rsp; } });

    it('returns a function that itself returns a function', () => {
      const config = {
        plural: 'foobars',
        actions: { update_many: 'FETCH_FOOBARS' },
      };
      const f = makeFetchPage(config, 'foobars');
      expect(f).to.be.a('function');
      expect(f()).to.be.a('function');
    });

    it('fetches a page of items from the API', async () => {
      const dispatch = getDispatch();
      const fetchStub = getFetchStub(mockFoobarsResponse);
      const getState = getGetState({
        api: { foobars: { totalPages: -1 } },
      });
      const config = {
        plural: 'foobars',
        actions: { update_many: 'FETCH_FOOBARS' },
      };
      const f = makeFetchPage(config);
      const p = f();

      await p(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/foobars?page=1')).to.equal(true);
      expect(dispatch.calledWith({
        type: 'FETCH_FOOBARS',
        response: mockFoobarsResponse,
      })).to.equal(true);
    });

    it('fetches a sub resource page of items from the API', async () => {
      const dispatch = getDispatch();
      const fetchStub = getFetchStub(mockFoobarsResponse);
      const getState = getGetState({
        api: {
          foobars: {
            foobars: {
              foobar_1: { foobazes: { totalPages: -1 } },
            },
          },
        },
      });
      const config = {
        plural: 'foobars',
        actions: { update_many: 'FETCH_FOOBARS' },
        subresources: {
          foobazes: {
            plural: 'foobazes',
            actions: { update_many: 'FETCH_FOOBAZES' },
          },
        },
      };
      const f = makeFetchPage(config, 'foobazes');
      const p = f(0, 'foobar_1');

      await p(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/foobars/foobar_1/foobazes?page=1')).to.equal(true);
      expect(dispatch.calledWith({
        type: 'FETCH_FOOBAZES',
        response: mockFoobarsResponse,
        foobars: 'foobar_1',
      })).to.equal(true);
    });

    it('fetches the requested page', async () => {
      const dispatch = getDispatch();
      const fetchStub = getFetchStub(mockFoobarsResponse);
      const getState = getGetState({
        api: { foobars: { totalPages: -1 } },
      });
      const config = {
        plural: 'foobars',
        actions: { update_many: 'FETCH_FOOBARS' },
      };
      const f = makeFetchPage(config);
      const p = f(1);

      await p(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/foobars?page=2')).to.equal(true);
    });
  });

  describe('api-store/makeFetchItem', () => {
    afterEach(() => {
      sandbox.restore();
    });

    const getGetState = (state = {}) => sandbox.stub().returns({
      authentication: auth,
      ...state,
    });
    const getDispatch = () => sandbox.spy();
    const getFetchStub = (rsp) => sandbox.stub(fetch, 'fetch').returns({ json() { return rsp; } });

    it('returns a function that itself returns a function', () => {
      const f = makeFetchItem('UPDATE_FOOBAR', 'foobar', 'foobars');
      expect(f).to.be.a('function');
      expect(f()).to.be.a('function');
    });

    it('fetches an item from the API', async () => {
      const dispatch = getDispatch();
      const fetchStub = getFetchStub(mockFoobarsResponse.foobars[0]);
      const getState = getGetState();
      const f = makeFetchItem('UPDATE_FOOBAR', 'foobar', 'foobars');
      const p = f('foobar_1');

      await p(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/foobars/foobar_1')).to.equal(true);
      expect(dispatch.calledWith({
        type: 'UPDATE_FOOBAR',
        foobar: mockFoobarsResponse.foobars[0],
        foobars: 'foobar_1',
      })).to.equal(true);
    });

    it('fetches a sub resource from the API', async () => {
      const dispatch = getDispatch();
      const foobaz = { id: 'foobaz_1234' };
      const fetchStub = getFetchStub(foobaz);
      const getState = getGetState();
      const f = makeFetchItem('UPDATE_ONE_FOOBAZ', 'foobaz', 'foobars', 'foobazes');
      const p = f('foobar_1', 'foobaz_1234');

      await p(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/foobars/foobar_1/foobazes/foobaz_1234')).to.equal(true);
      expect(dispatch.calledWith({
        type: 'UPDATE_ONE_FOOBAZ',
        foobars: 'foobar_1',
        foobazes: 'foobaz_1234',
        foobaz,
      })).to.equal(true);
    });
  });

  describe('api-store/makeDeleteItem', () => {
    afterEach(() => {
      sandbox.restore();
    });

    it('returns a function that itself returns a function', () => {
      const f = makeDeleteItem('DELETE_FOOBAR', 'foobars');
      expect(f).to.be.a('function');
      expect(f()).to.be.a('function');
    });

    const getGetState = (state = {}) => sandbox.stub().returns({
      authentication: auth,
      ...state,
    });
    const getDispatch = () => sandbox.spy();
    const getFetchStub = (rsp) => sandbox.stub(fetch, 'fetch').returns({ json() { return rsp; } });

    const emptyResponse = {};
    it('performs the API request', async () => {
      const dispatch = getDispatch();
      const fetchStub = getFetchStub(emptyResponse);
      const getState = getGetState();
      const f = makeDeleteItem('DELETE_FOOBAR', 'foobars');
      const p = f('foobar_1');

      await p(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/foobars/foobar_1', { method: 'DELETE' })).to.equal(true);
      expect(dispatch.calledWith({
        type: 'DELETE_FOOBAR',
        id: 'foobar_1',
      })).to.equal(true);
    });
  });

  describe('api-store/makePutItem', () => {
    afterEach(() => {
      sandbox.restore();
    });

    it('returns a function that itself returns a function', () => {
      const f = makePutItem('PUT_FOOBAR', 'foobars');
      expect(f).to.be.a('function');
      expect(f({ id: '', data: {} })).to.be.a('function');
    });

    const getGetState = (state = {}) => sandbox.stub().returns({
      authentication: auth,
      ...state,
    });
    const getDispatch = () => sandbox.spy();
    const getFetchStub = (rsp) => sandbox.stub(fetch, 'fetch').returns({ json() { return rsp; } });

    const emptyResponse = {};
    it('performs the API request', async () => {
      const dispatch = getDispatch();
      const fetchStub = getFetchStub(emptyResponse);
      const getState = getGetState();
      const f = makePutItem('PUT_FOOBAR', 'foobars');
      const p = f({ id: 'foobar_1', data: { foo: 'bar' } });

      await p(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/foobars/foobar_1', { method: 'PUT', body: JSON.stringify({ foo: 'bar' }) }
      )).to.equal(true);
      expect(dispatch.calledWith({
        type: 'PUT_FOOBAR',
        id: 'foobar_1',
        data: { foo: 'bar' },
      })).to.equal(true);
    });
  });

  describe('api-store/makeCreateItem', () => {
    afterEach(() => {
      sandbox.restore();
    });

    it('returns a function that itself returns a function', () => {
      const f = makeCreateItem('CREATE_FOOBAR', 'foobars', 'foobar');
      expect(f).to.be.a('function');
      expect(f({ data: {} })).to.be.a('function');
    });

    const getGetState = (state = {}) => sandbox.stub().returns({
      authentication: auth,
      ...state,
    });
    const getDispatch = () => sandbox.spy();
    const getFetchStub = (rsp) => sandbox.stub(fetch, 'fetch').returns({
      json() { return rsp; },
    });

    it('performs the API request', async () => {
      const dispatch = getDispatch();
      const fetchStub = getFetchStub({ name: 'foobar' });
      const getState = getGetState();
      const f = makeCreateItem('CREATE_FOOBAR', 'foobars', 'foobar');
      const p = f({ name: 'foobar' });

      await p(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/foobars', { method: 'POST', body: JSON.stringify({ name: 'foobar' }) }
      )).to.equal(true);
      expect(dispatch.calledWith({
        type: 'CREATE_FOOBAR',
        foobar: { name: 'foobar' },
      })).to.equal(true);
    });
  });

  describe('api-store/makeFetchUntil', () => {
    afterEach(() => {
      sandbox.restore();
    });

    it('should perform API requests until a condition is met', async () => {
      const fetchStub = sandbox.stub(fetch, 'fetch');
      fetchStub.onCall(0).returns({ json: () => ({ state: 'wait' }) });
      fetchStub.onCall(1).returns({ json: () => ({ state: 'wait' }) });
      fetchStub.returns({ json: () => ({ state: 'done' }) });

      const f = makeFetchUntil('UPDATE_FOOBAR', 'foobars', 'foobar');
      const p = f('foobar_1', v => v.state === 'done', 1);

      const state = {
        authentication: { token: 'token' },
        api: { foobars: { foobars: { foobar_1: { state: 'wait' } } } },
      };

      await p(() => { }, () => state);
      expect(fetchStub.calledThrice).to.equal(true);
      expect(fetchStub.calledWith('token', '/foobars/foobar_1'));
    });

    it('should submit update actions for each request performed', async () => {
      const fetchStub = sandbox.stub(fetch, 'fetch');
      fetchStub.onCall(0).returns({ json: () => ({ state: 'wait' }) });
      fetchStub.onCall(1).returns({ json: () => ({ state: 'wait' }) });
      fetchStub.returns({ json: () => ({ state: 'done' }) });

      const dispatch = sandbox.spy();
      const getState = sandbox.stub();

      const f = makeFetchUntil('UPDATE_FOOBAR', 'foobars', 'foobar');
      const p = f('foobar_1', v => v.state === 'done', 1);

      const state = {
        authentication: { token: 'token' },
        api: { foobars: { foobars: { foobar_1: { state: 'wait' } } } },
      };
      getState.returns(state);

      await p(dispatch, getState);

      expect(getState.callCount).to.equal(2);
      expect(dispatch.calledWith({
        type: 'UPDATE_FOOBAR',
        foobar: { state: 'done' },
      })).to.equal(true);
      expect(dispatch.callCount).to.equal(5);
    });
  });

  describe('api-store/invalidateCache', () => {
    it('should return a cache invalidation action', () => {
      const action = invalidateCache('foobars');
      expect(action).to.deep.equal({
        type: '@@foobars/INVALIDATE_CACHE',
      });
    });
  });

  describe('api-store/setFilter', () => {
    it('should return a set filter action', () => {
      const action = setFilter('foobars', { foo: 'bar' });
      expect(action).to.deep.equal({
        type: '@@foobars/SET_FILTER',
        filter: { foo: 'bar' },
      });
    });
  });
});
