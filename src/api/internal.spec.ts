import {
  ONE,
  PUT,
  MANY,
  POST,
  DELETE,

  createDefaultState,
  isPlural,
  addParentRefs,
  fullyQualified,
  parseIntIfActualInt,
  genActions,
  generateDefaultStateFull,
  generateDefaultStateOne,

} from './internal';

import {
  testConfigOne,
  testConfigMany,
  testConfigDelete,
  resource,
  page
} from '../data/reduxGen';

describe('internal', () => {
  describe('createDefaultState', () => {
    it('should return default state with name: {}', () => {
      expect(createDefaultState('whatever')).toEqual({
        totalPages: -1,
        totalResults: -1,
        ids: [],
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
      const actionOne = actions.one(resource, '23');

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

    it('should return an object with recursively initialized default state', () => {
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

  // describe('ReducerGenerator');
});
