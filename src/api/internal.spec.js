import {
  genActions,
  isPlural,
  ONE,
  PUT,
  MANY,
  POST,
  DELETE,
  addParentRefs,
  fullyQualified,
  generateDefaultStateFull,
  generateDefaultStateOne,
  createDefaultState,
  parseIntIfActualInt,
  ReducerGenerator,
} from './internal';

import { testConfigOne, testConfigMany, testConfigDelete } from '~/data/reduxGen';
import { resource, page } from '~/data/reduxGen';

const now = new Date();

describe('internal', () => {
  describe('createDefaultState', () => {
    it('should return default state with name: {}', () => {
      expect(createDefaultState('whatever')).toEqual({
        totalPages: -1,
        totalResults: -1,
        ids: [],
        pageIDsBy_id: [],
        whatever: {},
      });
    });
  });

  describe('isPlural', () => {
    it('should return true if config supports plural', () => {
      expect(
        isPlural({ supports: [MANY] })
      ).toBe(true);
    });

    it('should return false if config does not support plural', () => {
      expect(
        isPlural({ supports: [ONE, PUT, POST, DELETE] })
      ).toBe(false);
    });
  });

  describe('addParentRefs', () => {
    it('should return an undefined parent if parent is undefined', () => {
      const config = { value: 1 };

      expect(
        addParentRefs(config)
      ).toEqual({ ...config, parent: undefined });
    });

    it('should add parent to config', () => {
      const config = { value: 1 };
      const parent = { value: 2 };

      expect(
        addParentRefs(config, parent)
      ).toEqual({ ...config, parent });
    });

    it('should add parent to subresource', () => {
      const parent = { value: 2 };
      const config = {
        value: 1,
        subresources: {
          _1: { value: 11 },
        },
      };

      const expected = {
        value: 1,
        parent,
        subresources: {
          _1: { value: 11 },
        },
      };

      expected.subresources._1.parent = expected;

      expect(
        addParentRefs(config, parent)
      ).toEqual(expected);
    });

    it('should add parent to multiple subresources', () => {
      const config = {
        value: 1,
        subresources: {
          _1: { value: 11 },
          _2: { value: 12 },
        },
      };

      const expected = {
        value: 1,
        parent: { value: 2 },
        subresources: {
          _1: { value: 11 },
          _2: { value: 12 },
        },
      };

      expected.subresources._1.parent = expected;
      expected.subresources._2.parent = expected;

      expect(
        addParentRefs(config, { value: 2 })
      ).toEqual(expected);
    });
  });


  describe('fullyQualified', () => {
    const o = { name: 'name' };
    const parent = { name: 'parent' };
    const grandparent = { name: 'grandparent' };

    it('should return a simple path', () => {
      expect(fullyQualified(o)).toBe('name');
    });

    it('should should return a parent path', () => {
      expect(fullyQualified({
        ...o,
        parent,
      })).toBe('parent.name');
    });

    it('should should return a grandparent path', () => {
      expect(fullyQualified({
        ...o,
        parent: {
          ...parent,
          parent: grandparent,
        },
      })).toBe('grandparent.parent.name');
    });
  });

  describe('parseIntIfActualInt', () => {
    it('should return unmodified arg if arg is not a number', () => {
      expect(parseIntIfActualInt('self')).toBe('self');
    });

    it('should return parsed integer if arg is a number', () => {
      expect(parseIntIfActualInt('1')).toBe(1);
    });

    it('should return parsed integer if arg is a number', () => {
      expect(parseIntIfActualInt('Andrew is number 1')).toBe('Andrew is number 1');
    });
  });

  describe('genActions', () => {
    it('generates an action to update one resource', function () {
      const config = testConfigOne;
      const actions = genActions(config);
      const actionOne = actions.one(resource, '23', now);

      expect(actionOne.resource.label).toBe('nodebalancer-1');
      expect(actionOne.type).toBe('GEN@nodebalancers/ONE');
      expect(actionOne.ids[0]).toBe(23);
    });

    it('generates an action to update many resources', function () {
      const config = testConfigMany;

      const actions = genActions(config);
      const actionMany = actions.many(page);

      expect(actionMany.page.nodebalancers[0].label)
        .toBe('nodebalancer-1');
      expect(actionMany.page.nodebalancers[1].label)
        .toBe('nodebalancer-2');
      expect(actionMany.type).toBe('GEN@nodebalancers/MANY');
    });

    it('generates an action to delete a resource', function () {
      const config = testConfigDelete;

      const actions = genActions(config);
      const deleteAction = actions.delete('23');

      expect(deleteAction.ids[0]).toBe(23);
      expect(deleteAction.type).toBe('GEN@nodebalancers/DELETE');
    });

    it('should recursively call genAction on subresources', () => {
      const config = {
        name: 'linodes',
        supports: [ONE, MANY, DELETE],
        subresources: {
          _configs: {
            name: 'configs',
            supports: [ONE, MANY, DELETE],
          },
        },
      };

      const {
        type,
        one,
        many,
        delete: ddelete,
        configs: {
          type: cType,
          one: cOne,
          many: cMany,
          delete: cDelete,
        },
      } = genActions(config);

      expect(type).toBe('linodes');
      expect(one).toBeInstanceOf(Function);
      expect(many).toBeInstanceOf(Function);
      expect(ddelete).toBeInstanceOf(Function);


      expect(cType).toBe('configs');
      expect(cOne).toBeInstanceOf(Function);
      expect(cMany).toBeInstanceOf(Function);
      expect(cDelete).toBeInstanceOf(Function);
    });

    it('should gracefully handle unexpected features', () => {
      const config = {
        name: 'linodes',
        supports: [ONE, MANY, DELETE, 'SHENANIGANS'],
      };

      const { type, one, many, delete: ddelete } = genActions(config);

      expect(type).toBe('linodes');
      expect(one).toBeInstanceOf(Function);
      expect(many).toBeInstanceOf(Function);
      expect(ddelete).toBeInstanceOf(Function);
    });
  });

  describe('generateDefaultStateFull', () => {
    it('should return empty object if non-plural', () => {
      const config = { supports: [] };
      const result = generateDefaultStateFull(config);

      expect(result).toEqual({});
    });

    it('should return default state if plural', () => {
      const config = { name: 'whatever', supports: [MANY] };
      const result = generateDefaultStateFull(config);
      const expected = createDefaultState('whatever');

      expect(result).toEqual(expected);
    });
  });

  describe('generateDefaultStateOne', () => {
    it('should return the spread ONE object parameter', () => {
      const expected = { one: 'one' };
      const result = generateDefaultStateOne({}, { one: 'one' });

      expect(result).toEqual(expected);
    });

    it('should an object with recursively initialized default state', () => {
      const subresources = {
        _1: { _1key: '_1value', supports: [] },
        _2: { _2key: '_2value', supports: [] },
      };
      const result = generateDefaultStateOne(subresources, { one: 'one' });
      const expected = { _1: {}, _2: {}, one: 'one' };

      expect(result).toEqual(expected);
    });

    it('handle undefined subresources gracefully', () => {
      const result = generateDefaultStateOne(undefined, { one: 'one' });
      const expected = { one: 'one' };

      expect(result).toEqual(expected);
    });
  });

  describe('ReducerGenerator', () => {
    describe('#one', () => {
      it('should return state merged with action.resource if config does not support MANY', () => {
        const config = {
          supports: ['ONE'],
        };

        const state = {
          stateKey: 'state',
        };

        const action = {
          resource: {
            resourceKey: 'resource',
          },
        };

        const result = ReducerGenerator.one(config, state, action, now);

        const expected = {
          stateKey: 'state',
          resourceKey: 'resource',
        };

        expect(result).toEqual(expected);
      });

      describe('when action does not contain IDs.', () => {
        it('should use the primaryKey label in the config', () => {
          const config = { supports: [MANY], primaryKey: 'id', name: 'test' };
          const state = { stateKey: 'state', test: {} };
          const action = {
            resource: { id: 1, name: 'one' },
          };

          const result = ReducerGenerator.one(config, state, action, now);
          const expected = {
            stateKey: 'state',
            test: {
              1: {
                id: 1,
                name: 'one',
                __updatedAt: now,
              },
            },
          };

          expect(result).toEqual(expected);
        });
      });

      describe('when action contains IDs', () => {
        it('should use the last ID provided as the new object key.', () => {
          const config = { supports: [MANY], name: 'test' };
          const state = { stateKey: 'state', test: {} };
          const action = {
            resource: { id: 1, name: 'one' },
            ids: [999],
          };

          const result = ReducerGenerator.one(config, state, action, now);
          const expected = {
            stateKey: 'state',
            test: {
              999: {
                id: 1,
                name: 'one',
                __updatedAt: now,
              },
            },
          };

          expect(result).toEqual(expected);
        });
      });

      describe('when state contains an existing resource', () => {
        it('should merge new resource onto old resource', () => {
          const config = { supports: [MANY], name: 'test' };
          const state = {
            stateKey: 'state', test: {
              999: { something: 'whatever', name: 'oldName' },
            },
          };
          const action = {
            resource: { id: 1, name: 'one' },
            ids: [999],
          };

          const result = ReducerGenerator.one(config, state, action, now);
          const expected = {
            stateKey: 'state',
            test: {
              999: {
                id: 1,
                name: 'one',
                something: 'whatever',
                __updatedAt: now,
              },
            },
          };

          expect(result).toEqual(expected);
        });
      });

      describe('when state does not contains an existing resource', () => {
        it('should ...', () => {
          const _sub1 = { supports: [MANY], name: 'sub1' };
          const config = { supports: [MANY], name: 'test', subresources: { _sub1 } };
          const state = {
            stateKey: 'state', test: {},
          };
          const action = {
            resource: { id: 1, name: 'one' },
            ids: [999],
          };

          const result = ReducerGenerator.one(config, state, action, now);
          const expected = {
            stateKey: 'state',
            test: {
              999: {
                ...(generateDefaultStateOne(config.subresources, action.resource)),
                id: 1,
                name: 'one',
                __updatedAt: now,
              },
            },
          };

          expect(result).toEqual(expected);
        });
      });
    });

    describe('#many', () => {
      describe('with simple config', () => {
        const config = { supports: [MANY], name: 'test', primaryKey: 'id' };
        const state = { stateKey: 'state', test: {} };
        const action = {
          page: {
            test: [
              { id: 234, name: '234' },
              { id: 567, name: '567' },
              { id: 890, name: '890' },
            ],
            pages: 5,
            results: 100,
          },
        };

        const result = ReducerGenerator.many(config, state, action, now);

        it('should return a new state with resources', () => {
          expect(result).toHaveProperty('test', {
            234: { id: 234, name: '234', __updatedAt: now },
            567: { id: 567, name: '567', __updatedAt: now },
            890: { id: 890, name: '890', __updatedAt: now },
          });
        });

        it('should return IDs', () => {
          expect(result).toHaveProperty('ids', [234, 567, 890]);
        });

        it.skip('should return sorted IDs', () => { });

        it('should return totalPages', () => {
          expect(result).toHaveProperty('totalPages', 5);
        });

        it('should should return totalResults', () => {
          expect(result).toHaveProperty('totalResults', 100);
        });
      });

      describe('with a sort config', () => {
        const config = {
          supports: [MANY],
          name: 'test',
          primaryKey: 'id',
          sortFn: (ids) => ids.sort((a, b) => {
            return b - a;
          }),
        };
        const state = { stateKey: 'state', test: {} };
        const action = {
          page: {
            test: [
              { id: 234, name: '234' },
              { id: 567, name: '567' },
              { id: 890, name: '890' },
            ],
            pages: 5,
            results: 100,
          },
        };

        const result = ReducerGenerator.many(config, state, action);
        it('should return a sorted list', () => {
          expect(result.ids[0]).toBe(890);
          expect(result.ids[1]).toBe(567);
          expect(result.ids[2]).toBe(234);
        });
      });
    });

    describe('#del', () => {
      describe('with simple values', () => {
        const config = { name: 'test' };
        const state = {
          stateKey: 'state',
          test: {
            5: { id: 5 },
            7: { id: 7 },
            9: { id: 9 },
          },
        };
        const action = { ids: [5] };
        const result = ReducerGenerator.del(config, state, action);

        it('should returns updated IDs', () => {
          expect(result).toHaveProperty('ids', [7, 9]);
        });

        it('should return updated state', () => {
          expect(result).toHaveProperty('test', {
            7: { id: 7 },
            9: { id: 9 },
          });
        });

        it('should leaves other state untouched.', () => {
          expect(result).toHaveProperty('stateKey', 'state');
        });
      });
    });

    describe('#subresource', () => {
      beforeEach(() => {
        jest.resetModules();
      });

      it.only('should calls ReducerGenerator.one with...', () => {
        jest.doMock('./internal.js');
        ReducerGenerator.one = jest.fn();
        ReducerGenerator.reducer = jest.fn(() => ({ key: 'value' }));

        const config = {
          name: 'linodes',
          supports: [MANY],
          subresources: {
            _configs: { name: 'configs' },
          },
        };

        const state = {
          linodes: {
            1234: {
              _configs: {},
            },
          },
        };

        const action = {
          type: 'gen@linodes.configs/ONE',
          ids: [1234, 5678],
        };

        ReducerGenerator.subresource(config, state, action);

        expect(ReducerGenerator.one)
          .toHaveBeenLastCalledWith(
            config,
            state, {
              ids: action.ids,
              resource: {
                _configs: { key: 'value' },
              },
            });

        expect(ReducerGenerator.reducer)
          .toHaveBeenLastCalledWith(
            config.subresources._configs,
            state.linodes['1234']._configs,
            { ...action, ids: [5678] }
          );
      });

      // it('should call ReducerGenerator.reducer with...', () => {

      // });
    });

    describe('#reducer', () => {
      beforeEach(() => {
        jest.resetModules();
      });

      describe('when matches ONE', () => {
        it('should call ReducerGenerator.one', () => {
          jest.doMock('./internal.js');
          ReducerGenerator.one = jest.fn();

          const config = { name: 'shenanigans', supports: [] };
          const state = { state: 'some state' };
          const action = { type: 'GEN@shenanigans/ONE' };

          ReducerGenerator.reducer(config, state, action);
          expect(ReducerGenerator.one).toHaveBeenCalledWith(config, state, action);
        });
      });

      describe('when matches MANY', () => {
        it('should call ReducerGenerator.many', () => {
          jest.doMock('./internal.js');
          ReducerGenerator.many = jest.fn();

          const config = { name: 'shenanigans', supports: [] };
          const state = { state: 'some state' };
          const action = { type: 'GEN@shenanigans/MANY' };

          ReducerGenerator.reducer(config, state, action);
          expect(ReducerGenerator.many).toHaveBeenLastCalledWith(config, state, action);
        });
      });

      describe('when matches DELETE', () => {
        it('should call ReducerGenerator.delete', () => {
          jest.doMock('./internal.js');
          ReducerGenerator.del = jest.fn();

          const config = { name: 'shenanigans', supports: [] };
          const state = { state: 'some state' };
          const action = { type: 'GEN@shenanigans/DELETE' };

          ReducerGenerator.reducer(config, state, action);
          expect(ReducerGenerator.del).toHaveBeenLastCalledWith(config, state, action);
        });
      });

      describe('when defaults', () => {
        describe('and is a subresource', () => {
          it('should call ReducerGenerator.subresource', () => {
            jest.doMock('./internal.js');
            ReducerGenerator.subresource = jest.fn();

            const config = { name: 'whatever', supports: [], parent: { name: 'something' } };
            const state = { state: 'some state' };
            const action = { type: 'GEN@something.whatever/' };

            ReducerGenerator.reducer(config, state, action);
            expect(ReducerGenerator.subresource).toHaveBeenLastCalledWith(config, state, action);
          });
        });

        describe('and is not a subresouce', () => {
          it('should return unmodified state', () => {
            const config = { name: 'whatever' };
            const state = { state: 'some state' };
            const action = { type: 'anything-else-in-the-world' };

            const result = ReducerGenerator.reducer(config, state, action);
            expect(result).toBe(state);
          });
        });
      });
    });

    describe('constructor', () => {
      beforeEach(() => {
        jest.resetModules();
      });

      it('should have a class method reducer', () => {
        const config = { supports: [ONE] };
        const result = new ReducerGenerator(config);

        expect(result).toBeInstanceOf(ReducerGenerator);
        expect(result).toHaveProperty('reducer');
      });

      it('should call ReducerGenerator.reducer when invoked', () => {
        const config = { supports: [ONE] };
        const state = { state: 'something... something... state' };
        const action = { type: 'something-action-y' };
        jest.doMock('./internal.js');
        ReducerGenerator.reducer = jest.fn();

        const reducer = new ReducerGenerator(config);
        reducer.reducer(state, action);

        expect(ReducerGenerator.reducer).toHaveBeenCalledWith(config, state, action);
      });
    });
  });
});
