import * as actions from '~/actions/errors';

describe('actions/errors', () => {
  describe('toggleDetails', () => {
    it('should return a TOGGLE_DETAILS action', () => {
      expect(actions.toggleDetails()).toEqual({ type: actions.TOGGLE_DETAILS });
    });
  });

  describe('setError', () => {
    const dispatch = jest.fn();

    afterEach(() => {
      dispatch.mockReset();
    });

    it('should return a thunk', () => {
      expect(typeof actions.setError({})).toBe('function');
    });

    it('dispatches a SET_ERROR action', async () => {
      const thunk = actions.setError({ status: 404 });
      await thunk(dispatch);
      expect(dispatch.mock.calls.length).toBe(1);
      expect(dispatch.mock.calls[0][0]).toEqual({
        type: actions.SET_ERROR,
        status: 404,
      });
    });
  });
});
