import reducer, {
  // Utilities
  oneOfType,

  // Action Creators
  request,
  response,
} from './resources';

describe('oneOfType', () => {
  it('should returns true', () => {
    const result = oneOfType({ type: 'b' }, ['a', 'b', 'c', 'd']);
    expect(result).toBeTruthy();
  });

  it('should return false', () => {
    const result = oneOfType({ type: 'z' }, ['a', 'b', 'c', 'd']);
    expect(result).toBeFalsy();
  });
});

describe('ResourcesReducer', () => {
  const data = { key: 'value' };
  const err = new Error();
  let result: Linode.ResourcesState;

  it('should ignore irrelevant actions', () => {
    result = reducer({}, { type: 'not-involved' });
    expect(result).toEqual({});
  });

  describe('when type === REQUEST', () => {
    it('should set loading to true.', () => {
      result = reducer({}, request(['types']));
      expect(result.types).toHaveProperty('loading', true);
    });
  });

  describe('when type === RESPONSE', () => {
    beforeEach(() => {
      result = reducer({}, response(['types'], data));
    });

    it('should set loading to false', () => {
      expect(result.types).toHaveProperty('loading', false);
    });

    it('should set path.data to the payload', () => {
      expect(result.types).toHaveProperty('data', data);
    });

    describe('and is error', () => {
      beforeEach(() => {
        result = reducer({}, response(['types'], err));
      });

      it('should set loading to false', () => {
        expect(result.types).toHaveProperty('loading', false);
      });

      it(`should set path.data to error`, () => {
        expect(result.types).toHaveProperty('data', err);
      });

      it(`should set path.error to true`, () => {
        expect(result.types).toHaveProperty('error', true);
      });
    });
  });
});
