import sinon from 'sinon';
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import makeApiList, {
  makeFetchPage,
  makeUpdateItem,
  makeUpdateUntil,
  makeDeleteItem,
} from '~/api-store';
import * as fetch from '~/fetch';

const mockFoobarsResponse = {
  foobars: [
    { id: 'foobar_1' },
    { id: 'foobar_2' },
  ],
  total_pages: 3,
  total_results: 25 * 3 - 4,
  page: 1,
};

describe('api-store', () => {
  const auth = { token: 'token' };

  const sandbox = sinon.sandbox.create();

  describe('api-store/makeApiList', () => {
    afterEach(() => {
      sandbox.restore();
    });

    it('should handle initial state', () => {
      const s = makeApiList('foobars', 'foobar', {
        update_singular: 'UPDATE_ONE',
        update_many: 'UPDATE_MANY',
        delete_one: 'DELETE_ONE',
      });

      expect(
        s(undefined, {})
      ).to.be.eql({
        pagesFetched: [], totalPages: -1, foobars: {},
        _singular: 'foobar', _plural: 'foobars',
      });
    });

    it('should not handle actions not specified', () => {
      const s = makeApiList('foobars', 'foobar', {
        update_singular: 'UPDATE_ONE',
      });
      const state = s(undefined, {});
      deepFreeze(state);

      expect(
        s(state, { type: 'DELETE_ONE' })
      ).to.be.eql(state);
    });

    it('should handle updating many records', () => {
      const s = makeApiList('foobars', 'foobar', {
        update_many: 'UPDATE_MANY',
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
      const s = makeApiList('foobars', 'foobar', {
        update_many: 'UPDATE_MANY',
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
      const s = makeApiList('foobars', 'foobar', {
        update_many: 'UPDATE_MANY',
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
      const s = makeApiList('foobars', 'foobar', {
        update_singular: 'UPDATE_SINGLE',
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
      const s = makeApiList('foobars', 'foobar', {
        update_singular: 'UPDATE_SINGLE',
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
      const s = makeApiList('foobars', 'foobar', {
        delete_one: 'DELETE_ONE',
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
      const f = makeFetchPage('FETCH_FOOBARS', 'foobars');
      expect(f).to.be.a('function');
      expect(f()).to.be.a('function');
    });

    it('fetches a page of items from the API', async () => {
      const dispatch = getDispatch();
      const fetchStub = getFetchStub(mockFoobarsResponse);
      const getState = getGetState();
      const f = makeFetchPage('FETCH_FOOBARS', 'foobars');
      const p = f();

      await p(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/foobars?page=1')).to.equal(true);
      expect(dispatch.calledWith({
        type: 'FETCH_FOOBARS',
        response: mockFoobarsResponse,
      })).to.equal(true);
    });

    it('fetches the requested page', async () => {
      const dispatch = getDispatch();
      const fetchStub = getFetchStub(mockFoobarsResponse);
      const getState = getGetState();
      const f = makeFetchPage('FETCH_FOOBARS', 'foobars');
      const p = f(1);

      await p(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/foobars?page=2')).to.equal(true);
    });
  });

  describe('api-store/makeUpdateItem', () => {
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
      const f = makeUpdateItem('UPDATE_FOOBAR', 'foobars', 'foobar');
      expect(f).to.be.a('function');
      expect(f()).to.be.a('function');
    });

    it('fetches an item from the API', async () => {
      const dispatch = getDispatch();
      const fetchStub = getFetchStub(mockFoobarsResponse.foobars[0]);
      const getState = getGetState();
      const f = makeUpdateItem('UPDATE_FOOBAR', 'foobars', 'foobar');
      const p = f('foobar_1');

      await p(dispatch, getState);

      expect(fetchStub.calledWith(
        auth.token, '/foobars/foobar_1')).to.equal(true);
      expect(dispatch.calledWith({
        type: 'UPDATE_FOOBAR',
        foobar: mockFoobarsResponse.foobars[0],
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

  describe('api-store/makeUpdateUntil', () => {
    afterEach(() => {
      sandbox.restore();
    });

    it('should perform API requests until a condition is met', async () => {
      const fetchStub = sandbox.stub(fetch, 'fetch');
      fetchStub.onCall(0).returns({ json: () => ({ state: 'wait' }) });
      fetchStub.onCall(1).returns({ json: () => ({ state: 'wait' }) });
      fetchStub.returns({ json: () => ({ state: 'done' }) });

      const f = makeUpdateUntil('UPDATE_FOOBAR', 'foobars', 'foobar');
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

      const f = makeUpdateUntil('UPDATE_FOOBAR', 'foobars', 'foobar');
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
});
