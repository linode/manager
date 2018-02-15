import 'jest';

import { fetch } from './fetch';
import { fullyLoadedObject } from './external';

import {
  genThunkOne,
  genThunkPage,
  genThunkAll,
  genThunkDelete,
  genThunkPut,
  genThunkPost,
} from '~/api/external.js';

jest.mock('./fetch', () => ({
  fetch: {
    get: jest.fn(),
    put: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('external.js', () => {
  describe('fullyLoadedObject', () => {
    it('should return TRUE if no _name properties are found', () => {
      const result = fullyLoadedObject({
        something: {},
      });
      expect(result).toEqual(true);
    });

    it('should return FALSE if _name properties are found', () => {
      const result = fullyLoadedObject({ _something: {} });
      expect(result).toEqual(false);
    });
  });

  describe('genThunkOne', () => {
    const config = { endpoint: jest.fn() };
    const actions = { one: jest.fn() };
    const dispatch = jest.fn();

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('generates a function', () => {
      const oneFunc = genThunkOne(config, actions);
      expect(oneFunc).toBeInstanceOf(Function);
    });

    it('generates a function that calls fetch.get', async () => {
      const oneFunc = genThunkOne(config, actions);
      await oneFunc()(dispatch);
      expect(fetch.get).toHaveBeenCalled();
    });

    it('generates a function that calls fetch.get with an id path', async () => {
      const config2 = {
        endpoint: (id1, id2) => {
          return `${id1}/${id2}`;
        },
      };
      const oneFunc = genThunkOne(config2, actions);
      await oneFunc(['a', 'b'])(dispatch);
      expect(fetch.get.mock.calls[0][0]).toBe('a/b');
    });

    it('generates a function that calls actions.one', async () => {
      const oneFunc = genThunkOne(config, actions);
      await oneFunc()(dispatch);
      expect(actions.one).toHaveBeenCalled();
    });
  });

  describe('genThunkPage', () => {
    const config = { endpoint: jest.fn(), name: 'resname' };
    const actions = { many: jest.fn() };
    const dispatch = jest.fn();

    beforeEach(() => {
      jest.resetAllMocks();
      dispatch.mockImplementation(() => ({ data: { testKey: 'testVal' }, pages: 1, resname: {} }));
    });

    it('generates a function', () => {
      const pageFunc = genThunkPage(config, actions);
      expect(pageFunc).toBeInstanceOf(Function);
    });

    it('generates a function that calls fetch.get', async () => {
      const pageFunc = genThunkPage(config, actions);
      await pageFunc()(dispatch);
      expect(fetch.get).toHaveBeenCalled();
    });

    it('generates a function that calls fetch.get with an id path and page number', async () => {
      const config2 = {
        endpoint: (id1, id2) => {
          return `${id1}/${id2}`;
        },
      };
      const pageFunc = genThunkPage(config2, actions);
      await pageFunc(11, ['a', 'b'])(dispatch);
      expect(fetch.get.mock.calls[0][0]).toBe('a/b?page=12');
    });

    it('generates a function that calls actions.many', async () => {
      const pageFunc = genThunkPage(config, actions);
      await pageFunc()(dispatch);
      expect(actions.many).toHaveBeenCalled();
    });

    it('generates a function that returns an object', async () => {
      const pageFunc = genThunkPage(config, actions);
      const res = await pageFunc()(dispatch);
      expect(res.resname.testKey).toBe('testVal');
    });
  });

  describe('genThunkAll', () => {
    const config = { endpoint: jest.fn(), name: 'resname' };
    const actions = { many: jest.fn() };
    const dispatch = jest.fn();

    beforeEach(() => {
      jest.resetAllMocks();
      dispatch.mockImplementation(() => ({ data: {}, pages: 5, resname: {} }));
    });

    it('generates a function', () => {
      const allFunc = genThunkAll(config, actions, jest.fn());
      expect(allFunc).toBeInstanceOf(Function);
    });

    it('generates a function that returns an array of resources', async () => {
      const allFunc = genThunkAll(config, actions, jest.fn());
      const res = await allFunc()(dispatch);
      expect(Array.isArray(res.resname)).toBeTruthy();
    });

    it('generates a function that calls fetchPage for each page', async () => {
      const genThunkMock = jest.fn();
      const allFunc = genThunkAll(config, actions, genThunkMock);
      await allFunc()(dispatch);
      expect(genThunkMock).toHaveBeenCalledTimes(5);
    });
  });

  describe('genThunkDelete', () => {
    const config = { endpoint: jest.fn(), name: 'resname' };
    const actions = { delete: jest.fn() };
    const dispatch = jest.fn();

    beforeEach(() => {
      jest.resetAllMocks();
      dispatch.mockImplementation(() => ({ data: { testKey: 'testVal' } }));
    });

    it('generates a function', () => {
      const delFunc = genThunkDelete(config, actions);
      expect(delFunc).toBeInstanceOf(Function);
    });

    it('generates a function that calls fetch.delete', async () => {
      const delFunc = genThunkDelete(config, actions);
      await delFunc()(dispatch);
      expect(fetch.delete).toHaveBeenCalled();
    });

    it('generates a function that dispatches actions.delete with ids', async () => {
      const delFunc = genThunkDelete(config, actions);
      await delFunc(1, 2, 3)(dispatch);
      expect(actions.delete).toHaveBeenCalledWith(1, 2, 3);
    });

    it('returns the deleted object', async () => {
      const delFunc = genThunkDelete(config, actions);
      const res = await delFunc(1, 2, 3)(dispatch);
      expect(res.data.testKey).toBe('testVal');
    });
  });

  describe('genThunkPut', () => {
    const config = { endpoint: () => '/test', name: 'resname' };
    const actions = { one: jest.fn() };
    const dispatch = jest.fn();

    beforeEach(() => {
      jest.resetAllMocks();
      dispatch.mockImplementation(() => ({ testKey: 'testVal' }));
    });

    it('generates a function', () => {
      const putFunc = genThunkPut(config, actions);
      expect(putFunc).toBeInstanceOf(Function);
    });

    it('generates a function that calls fetch.put', async () => {
      const putFunc = genThunkPut(config, actions);
      await putFunc({ testKey: 'testVal' })(dispatch);
      expect(fetch.put).toHaveBeenCalledWith('/test', { testKey: 'testVal' });
    });

    it('generates a function that dispatches actions.one with a resource and ids', async () => {
      const putFunc = genThunkPut(config, actions);
      await putFunc({ testKey: 'testVal' }, 11, 22)(dispatch);
      // NB: this comes from the dispatch mock
      expect(actions.one).toHaveBeenCalledWith({ testKey: 'testVal' }, 11, 22);
    });

    it('returns the put object', async () => {
      const putFunc = genThunkPut(config, actions);
      const res = await putFunc({ testKey: 'testVal' })(dispatch);
      expect(res.testKey).toBe('testVal');
    });
  });

  describe('genThunkPost', () => {
    const config = { endpoint: () => '/test', name: 'resname' };
    const actions = { one: jest.fn() };
    const dispatch = jest.fn();

    beforeEach(() => {
      jest.resetAllMocks();
      dispatch.mockImplementation(() => ({ testKey: 'testVal' }));
    });

    it('generates a function', () => {
      const postFunc = genThunkPost(config, actions);
      expect(postFunc).toBeInstanceOf(Function);
    });

    it('generates a function that calls fetch.post', async () => {
      const postFunc = genThunkPost(config, actions);
      await postFunc({ testKey: 'testVal' })(dispatch);
      expect(fetch.post).toHaveBeenCalledWith('/test', { testKey: 'testVal' });
    });

    it('generates a function that dispatches actions.one with a resource and ids', async () => {
      const postFunc = genThunkPost(config, actions);
      await postFunc({ testKey: 'testVal' }, 11, 22)(dispatch);
      expect(actions.one).toHaveBeenCalledWith({ testKey: 'testVal' }, 11, 22);
    });

    it('returns the posted object', async () => {
      const postFunc = genThunkPost(config, actions);
      const res = await postFunc({ testKey: 'testVal' })(dispatch);
      expect(res.testKey).toBe('testVal');
    });
  });
});
