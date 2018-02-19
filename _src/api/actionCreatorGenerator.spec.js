import actionCreatorGenerator from './actionCreatorGenerator';
import {
  genThunkOne,
  genThunkPage,
  genThunkAll,
  genThunkDelete,
  genThunkPut,
  genThunkPost,
} from './external';

jest.mock('./external.js', () => ({
  genThunkOne: jest.fn(() => 'ONE')
    .mockName('genThunkOne'),

  genThunkPage: jest.fn(() => 'PAGE')
    .mockName('genThunkPage'),

  genThunkAll: jest.fn(() => 'ALL')
    .mockName('genThunkAll'),

  genThunkDelete: jest.fn(() => 'DELETE')
    .mockName('genThunkDelete'),

  genThunkPut: jest.fn(() => 'PUT')
    .mockName('genThunkPut'),

  genThunkPost: jest.fn(() => 'POST')
    .mockName('genThunkPost'),

}));

describe('apiActionReducerGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should should return an object', () => {
    const config = { supports: [], name: 'configName' };
    const result = actionCreatorGenerator(config, {});

    expect(result).toBeInstanceOf(Object);
    expect(result).toHaveProperty('type', 'configName');
  });


  [
    ['one', 'ONE', genThunkOne],
    ['delete', 'DELETE', genThunkDelete],
    ['put', 'PUT', genThunkPut],
    ['post', 'POST', genThunkPost],
  ].forEach(([prop, FEATURE, fn]) => {
    describe(`when config supports ${FEATURE}`, () => {
      it(`should contain '${prop}' prop`, () => {
        const config = { supports: [FEATURE], name: 'configName' };
        const result = actionCreatorGenerator(config, {});

        expect(result).toHaveProperty(prop);
      });

      it(`should call ${fn.getMockName()}`, () => {
        jest.clearAllMocks();
        actionCreatorGenerator({ supports: [FEATURE] }, {});
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenLastCalledWith({ supports: [FEATURE] }, {});
      });
    });
  });

  describe('when config supports MANY', () => {
    const config = { supports: ['MANY'], name: 'configName' };
    const actions = { name: 'whatever' };

    it('should contain `page` and `all` props ', () => {
      const result = actionCreatorGenerator(config, actions);
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('all');
    });

    it('should call genThunkAll and genThunkPage', () => {
      jest.clearAllMocks();
      actionCreatorGenerator(config, actions);
      expect(genThunkPage).toHaveBeenCalledWith(config, actions);
      expect(genThunkAll).toHaveBeenCalledWith(config, actions, 'PAGE');
    });
  });

  describe('when config has subresources', () => {
    it('should return an object w/ the subresource as a prop', () => {
      const config = {
        name: 'configName',
        supports: ['ONE'],
        subresources: { sub1: { name: 'sub1', supports: ['ONE'] } },
      };
      const result = actionCreatorGenerator(config, {});
      expect(result).toHaveProperty('sub1');
    });

    /**
     * This is how I chose to check recursion. Verifying that the MANY
     *  calls were made, in addition to the ONE call supported by the sub.
     */
    it('should call subresource functions', () => {
      const config = {
        name: 'configName',
        supports: ['MANY'],
        subresources: { sub1: { name: 'sub1', supports: ['ONE'] } },
      };
      actionCreatorGenerator(config, {});

      expect(genThunkPage).toHaveBeenCalledTimes(1);
      expect(genThunkAll).toHaveBeenCalledTimes(1);
      expect(genThunkOne).toHaveBeenCalledTimes(1);
    });
  });
});
