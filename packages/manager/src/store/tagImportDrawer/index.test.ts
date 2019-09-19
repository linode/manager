import tagDrawer, * as T from './index';

jest.mock('src/store');

describe('tagImportDrawer Redux duck', () => {
  describe('reducer', () => {
    it('should be closed by default', () => {
      expect(T.defaultState).toHaveProperty('open', false);
    });
    it('should handle OPEN', () => {
      expect(tagDrawer(T.defaultState, T.openGroupDrawer())).toEqual({
        ...T.defaultState,
        open: true
      });
    });
    it('should handle CLOSE', () => {
      const newState = tagDrawer(
        { ...T.defaultState, open: true },
        T.closeGroupDrawer()
      );
      expect(newState).toHaveProperty('open', false);
    });
    it('should handle UPDATE', () => {
      const newState = tagDrawer(T.defaultState, T.handleUpdate() as any);
      expect(newState).toHaveProperty('loading', true);
    });
    it('should handle SUCCESS', () => {
      const newState = tagDrawer(
        { ...T.defaultState, loading: true },
        T.handleSuccess() as any
      );
      expect(newState).toHaveProperty('loading', false);
      expect(newState).toHaveProperty('success', true);
    });
    it('should handle ERROR', () => {
      const errors = [
        { entityId: 12345, reason: 'No reason' },
        { entityId: 6789, reason: 'Reason' }
      ];
      const newState = tagDrawer(
        { ...T.defaultState, loading: true },
        T.handleError(errors) as any
      );
      expect(newState).toHaveProperty('errors', errors);
    });
    it('should handle RESET', () => {
      const newState = tagDrawer(
        {
          open: true,
          loading: true,
          success: true,
          errors: []
        },
        T.handleReset() as any
      );
      expect(newState).toEqual(T.defaultState);
    });
  });
});
