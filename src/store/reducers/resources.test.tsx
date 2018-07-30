import reducer, { oneOfType, request, response } from './resources';

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

  const resources: Linode.ResourcesState = {
    regions: { loading: false, data: [], },
    types: { loading: false, data: { data: [], results: 0, pages: 1, page: 0 }, },
    kernels: { loading: false, data: [], },
    profile: {
      loading: false, data: {
        uid: 1,
        username: '',
        email: '',
        timezone: '',
        email_notifications: false,
        referrals: {
          code: '',
          url: '',
          total: 0,
          completed: 0,
          pending: 0,
          credit: 0,
        },
        ip_whitelist_enabled: false,
        lish_auth_method: 'password_keys',
        authorized_keys: [],
        two_factor_auth: false,
        restricted: false,
      },
    }
  };

  it('should ignore irrelevant actions', () => {
    result = reducer(resources, { type: 'not-involved' });
    expect(result).toEqual(resources);
  });

  describe('when type === REQUEST', () => {
    it('should set loading to true.', () => {
      result = reducer(resources, request(['types']));
      expect(result.types).toHaveProperty('loading', true);
    });
  });

  describe('when type === RESPONSE', () => {
    beforeEach(() => {
      result = reducer(resources, response(['types'], data));
    });

    it('should set loading to false', () => {
      expect(result.types).toHaveProperty('loading', false);
    });

    xit('should set path.data to the payload', () => {
      expect(result.types).toHaveProperty('data', data);
    });

    describe('and is error', () => {
      beforeEach(() => {
        result = reducer(resources, response(['types'], err));
      });

      it('should set loading to false', () => {
        expect(result.types).toHaveProperty('loading', false);
      });

      xit(`should set path.data to error`, () => {
        expect(result.types).toHaveProperty('data', err);
      });

      it(`should set path.error to true`, () => {
        expect(result.types).toHaveProperty('error', true);
      });
    });
  });
});
