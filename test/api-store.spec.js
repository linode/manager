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
      { id: 1 },
      { id: 2 },
    ],
    total_pages: 3,
    total_results: 25 * 3 - 4,
    page: 1,
  };

  const auth = { token: 'token' };

  const sandbox = sinon.sandbox.create();

  const config = {
    singular: 'foobar',
    plural: 'foobars',
    actions: {
      updateItems: 'UPDATE_FOOBARS',
      updateItem: 'UPDATE_FOOBAR',
      deleteItem: 'DELETE_FOOBAR',
    },
    subresources: {
      foobazes: {
        singular: 'foobaz',
        plural: 'foobazes',
        actions: {
          updateItems: 'UPDATE_FOOBAZES',
          updateItem: 'UPDATE_FOOBAZ',
          deleteItem: 'DELETE_FOOBAZ',
        },
      },
    },
  };

  describe('api-store/makeApiList', () => {
    afterEach(() => {
      sandbox.restore();
    });

    it('should handle initial state', () => {
      const s = makeApiList(config);

      expect(
        s(undefined, {})
      ).to.be.eql({
        pagesFetched: [], totalResults: -1, totalPages: -1, foobars: {},
        filter: null, singular: 'foobar', plural: 'foobars',
      });
    });

    it('should not handle actions not specified', () => {
      const s = makeApiList(config);
      const state = s(undefined, {});
      deepFreeze(state);

      expect(
        s(state, { type: 'buttslol' })
      ).to.be.eql(state);
    });

    it('should handle updating many records', () => {
      const s = makeApiList(config);

      const state = s(undefined, {});
      deepFreeze(state);

      const result = s(state, {
        type: config.actions.updateItems,
        response: mockFoobarsResponse,
      });

      expect(result)
        .to.have.property('foobars')
        .to.have.property(1);
      expect(result)
        .to.have.property('foobars')
        .to.have.property(2);
    });

    it('should update the pagesFetched property appropriately', () => {
      const s = makeApiList(config);

      const state = {
        ...s(undefined, {}),
        totalPages: 3,
        pagesFetched: [2],
      };
      deepFreeze(state);

      const result = s(state, {
        type: config.actions.updateItems,
        response: mockFoobarsResponse,
      });

      expect(result)
        .to.have.property('pagesFetched')
        .which.includes(1, 2);
    });

    it('should add internal properties to objects', () => {
      const s = makeApiList(config);

      const state = s(undefined, {});
      deepFreeze(state);

      const result = s(state, {
        type: config.actions.updateItems,
        response: {
          foobars: [
            { id: 1 },
            { id: 2 },
          ],
          total_pages: 3,
          total_results: 25 * 3 - 4,
          page: 1,
        },
      });

      expect(result)
        .to.have.property('foobars')
        .which.has.property(1)
        .which.has.property('_polling');
    });

    it('should invoke custom transforms', () => {
      const s = makeApiList(config, o => ({ ...o, test: 1234 }));

      const state = s(undefined, {});
      deepFreeze(state);

      const result = s(state, {
        type: config.actions.updateItems,
        response: {
          foobars: [
            { id: 1 },
            { id: 2 },
          ],
          total_pages: 3,
          total_results: 25 * 3 - 4,
          page: 1,
        },
      });

      expect(result)
        .to.have.property('foobars')
        .which.has.property(1)
        .which.has.property('test')
        .which.equals(1234);
    });

    it('should handle adding a single resource', () => {
      const s = makeApiList(config);

      const state = s(undefined, {});
      deepFreeze(state);

      const result = s(state, {
        type: config.actions.updateItem,
        foobar: { id: 1 },
        foobars: 1,
      });

      expect(result)
        .to.have.property('foobars')
        .to.have.property(1);
    });

    it('should handle updating a single resource', () => {
      const s = makeApiList(config);

      let state = s(undefined, {});
      state = {
        ...state,
        foobars: {
          ...state.foobars,
          1: { id: 1 },
        },
      };
      deepFreeze(state);

      const result = s(state, {
        type: config.actions.updateItem,
        foobar: { id: 1, name: 'hello' },
        foobars: 1,
      });

      expect(result)
        .to.have.property('foobars')
        .which.has.property(1)
        .which.has.property('name')
        .which.equals('hello');
    });

    it('should handle deleting a single resource', () => {
      const s = makeApiList(config);

      let state = s(undefined, {});
      state = {
        ...state,
        foobars: {
          ...state.foobars,
          1: { id: 1 },
        },
      };
      deepFreeze(state);

      const result = s(state, {
        type: config.actions.deleteItem,
        foobars: 1,
      });

      expect(result)
        .to.have.property('foobars')
        .which/* .does*/.not.have.property(1);
    });

    it('should handle invalidate cache actions', () => {
      const s = makeApiList(config);

      let state = s(undefined, { });
      state = {
        ...state,
        foobars: {
          ...state.foobars,
          1: { id: 1 },
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
      const s = makeApiList(config);
      const state = s(undefined, { });
      deepFreeze(state);
      const action = { type: '@@foobars/SET_FILTER', filter: { foo: 'bar' } };
      const result = s(state, action);
      expect(result)
        .to.have.property('filter')
        .that.deep.equals({ foo: 'bar' });
    });
  });

  it('should wire up subresources for items', () => {
    const s = makeApiList(config);
    const state = s(undefined, {});
    deepFreeze(state);

    const result = s(state, {
      type: config.actions.updateItems,
      response: mockFoobarsResponse,
    });

    expect(result)
      .to.have.property('foobars')
      .which.has.property(1)
      .which.has.property('foobazes')
      .which.has.keys(
        'totalPages',
        'totalResults',
        'foobazes',
        'filter',
        'pagesFetched',
        'singular',
        'plural');
  });

  it('should handle subresource update singular', () => {
    const s = makeApiList(config);

    const state = s(undefined, {
      type: config.actions.updateItems,
      response: mockFoobarsResponse,
    });
    deepFreeze(state);

    const result = s(state, {
      type: config.subresources.foobazes.actions.updateItem,
      foobaz: { id: 123, test: 'hello world' },
      foobars: 1,
      foobazes: 123,
    });

    expect(result)
      .to.have.property('foobars')
      .which.has.property(1)
      .which.has.property('foobazes')
      .which.has.property('foobazes')
      .which.has.property(123)
      .which.has.property('test').that.equals('hello world');
  });

  it('should handle subresource delete', () => {
    const s = makeApiList(config);

    const state = s(undefined, {
      type: config.actions.updateItems,
      response: mockFoobarsResponse,
    });
    deepFreeze(state);

    const result = s(state, {
      type: config.subresources.foobazes.actions.deleteItem,
      foobaz: 123,
      foobars: 1,
    });

    expect(result)
      .to.have.property('foobars')
      .which.has.property(1)
      .which.has.property('foobazes')
      .which.has.property('foobazes')
      .which./* does */not.have.property(123);
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
      const f = makeFetchPage(config);
      const p = f();

      await p(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/foobars?page=1')).to.equal(true);
      expect(dispatch.calledWith({
        type: config.actions.updateItems,
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
              1: { foobazes: { totalPages: -1 } },
            },
          },
        },
      });
      const f = makeFetchPage(config, 'foobazes');
      const p = f(0, 1);

      await p(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/foobars/1/foobazes?page=1')).to.equal(true);
      expect(dispatch.calledWith({
        type: config.subresources.foobazes.actions.updateItems,
        response: mockFoobarsResponse,
        foobars: 1,
      })).to.equal(true);
    });

    it('fetches the requested page', async () => {
      const dispatch = getDispatch();
      const fetchStub = getFetchStub(mockFoobarsResponse);
      const getState = getGetState({
        api: { foobars: { totalPages: -1 } },
      });
      const f = makeFetchPage(config);
      const p = f(1);

      await p(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/foobars?page=2')).to.equal(true);
    });

    it('invalidates and refetches on inconsistent results', async () => {
      const fetchStub = getFetchStub(mockFoobarsResponse);
      const getState = getGetState({
        api: { foobars: { totalPages: 1, totalResults: 25 * 3 - 2, pagesFetched: [2] } },
      });
      const dispatch = sandbox.spy(
        a => typeof a === 'function' ? a(dispatch, getState) : null);
      const f = makeFetchPage(config);
      const p = f();

      fetchStub.onCall(1).returns({
        json: () => ({
          ...mockFoobarsResponse,
          page: 2,
        }),
      });
      getState.onCall(3).returns({
        authentication: { token: 'token' },
        api: { foobars: { totalPages: -1, totalResults: -1, pagesFetched: [] } },
      });

      await p(dispatch, getState);

      expect(dispatch.calledWith(invalidateCache('foobars')))
        .to.equal(true);
      expect(fetchStub.calledWith(
        auth.token, '/foobars?page=1')).to.equal(true);
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
      const f = makeFetchItem(config.actions.updateItem, 'foobar', 'foobars');
      expect(f).to.be.a('function');
      expect(f()).to.be.a('function');
    });

    it('fetches an item from the API', async () => {
      const dispatch = getDispatch();
      const fetchStub = getFetchStub(mockFoobarsResponse.foobars[0]);
      const getState = getGetState({
        api: { foobars: { totalPages: -1, foobars: { } } },
      });
      const f = makeFetchItem(config);
      const p = f(1);

      await p(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/foobars/1')).to.equal(true);
      expect(dispatch.calledWith({
        type: config.actions.updateItem,
        foobar: mockFoobarsResponse.foobars[0],
        foobars: 1,
      })).to.equal(true);
    });

    it('fetches a sub resource from the API', async () => {
      const dispatch = getDispatch();
      const foobaz = { id: 1234 };
      const fetchStub = getFetchStub(foobaz);
      const getState = getGetState({
        api: {
          foobars: {
            foobars: {
              1: {
                foobazes: { totalPages: -1, foobazes: { } },
              },
            },
          },
        },
      });
      const f = makeFetchItem(config, 'foobazes');
      const p = f(1, 1234);

      await p(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/foobars/1/foobazes/1234')).to.equal(true);
      expect(dispatch.calledWith({
        type: config.subresources.foobazes.actions.updateItem,
        foobars: 1,
        foobazes: 1234,
        foobaz,
      })).to.equal(true);
    });
  });

  describe('api-store/makeDeleteItem', () => {
    afterEach(() => {
      sandbox.restore();
    });

    it('returns a function that itself returns a function', () => {
      const f = makeDeleteItem(config);
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
      const getState = getGetState({
        api: { foobars: { totalPages: -1, foobars: { } } },
      });
      const f = makeDeleteItem(config);
      const p = f(1);

      await p(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/foobars/1', { method: 'DELETE' })).to.equal(true);
      expect(dispatch.calledWith({
        type: config.actions.deleteItem,
        foobars: 1,
      })).to.equal(true);
    });

    it('supports subresources', async () => {
      const dispatch = getDispatch();
      const fetchStub = getFetchStub(emptyResponse);
      const getState = getGetState({
        api: { foobars: { totalPages: -1, foobars: {
          1: {
            foobazes: {
              totalPages: -1,
              foobazes: { },
            },
          },
        } } },
      });
      const f = makeDeleteItem(config, 'foobazes');
      const p = f(1, 1);

      await p(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/foobars/1/foobazes/1',
        { method: 'DELETE' })).to.equal(true);
      expect(dispatch.calledWith({
        type: config.subresources.foobazes.actions.deleteItem,
        foobars: 1,
        foobazes: 1,
      })).to.equal(true);
    });
  });

  describe('api-store/makePutItem', () => {
    afterEach(() => {
      sandbox.restore();
    });

    it('returns a function that itself returns a function', () => {
      const f = makePutItem(config);
      expect(f).to.be.a('function');
      expect(f({ id: -1, data: {} })).to.be.a('function');
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
      const f = makePutItem(config);
      const p = f({ id: 1, data: { foo: 'bar' } });

      await p(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token,
        '/foobars/1',
        { method: 'PUT', body: JSON.stringify({ foo: 'bar' }) }
      )).to.equal(true);
      expect(dispatch.calledWith({
        type: config.actions.updateItem,
        foobars: 1,
        foobar: { foo: 'bar' },
      })).to.equal(true);
    });
  });

  describe('api-store/makeCreateItem', () => {
    afterEach(() => {
      sandbox.restore();
    });

    it('returns a function that itself returns a function', () => {
      const f = makeCreateItem(config);
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
      const fetchStub = getFetchStub({ id: 1234, name: 'foobar' });
      const getState = getGetState();
      const f = makeCreateItem(config);
      const p = f({ name: 'foobar' });

      await p(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/foobars', { method: 'POST', body: JSON.stringify({ name: 'foobar' }) }
      )).to.equal(true);
      expect(dispatch.calledWith({
        type: config.actions.updateItem,
        foobar: { id: 1234, name: 'foobar' },
        foobars: 1234,
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

      const f = makeFetchUntil(config);
      const p = f(1, v => v.state === 'done', 1);

      const state = {
        authentication: { token: 'token' },
        api: { foobars: { foobars: { 1: { state: 'wait' } } } },
      };

      await p(() => { }, () => state);
      expect(fetchStub.calledThrice).to.equal(true);
      expect(fetchStub.calledWith('token', '/foobars/1'));
    });

    it('should submit update actions for each request performed', async () => {
      const fetchStub = sandbox.stub(fetch, 'fetch');
      fetchStub.onCall(0).returns({ json: () => ({ state: 'wait' }) });
      fetchStub.onCall(1).returns({ json: () => ({ state: 'wait' }) });
      fetchStub.returns({ json: () => ({ state: 'done' }) });

      const dispatch = sandbox.spy();
      const getState = sandbox.stub();

      const f = makeFetchUntil(config);
      const p = f(1, v => v.state === 'done', 1);

      const state = {
        authentication: { token: 'token' },
        api: { foobars: { foobars: { 1: { state: 'wait' } } } },
      };
      getState.returns(state);

      await p(dispatch, getState);

      expect(getState.callCount).to.equal(2);
      expect(dispatch.calledWith({
        type: config.actions.updateItem,
        foobar: { state: 'done' },
        foobars: 1,
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
