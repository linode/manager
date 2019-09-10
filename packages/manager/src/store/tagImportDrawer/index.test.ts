import tagDrawer, * as T from './index';

describe('tagImportDrawer Redux duck', () => {
  describe('reducer', () => {
    it('should be closed by default', () => {
      expect(T.defaultState).toHaveProperty('open', false);
    });

    it('should handle an open action', () => {
      expect(tagDrawer(T.defaultState, T.openDrawer())).toEqual({
        ...T.defaultState,
        open: true
      });
    });

    it('should handle a "close" action', () => {
      const newState = tagDrawer(
        { ...T.defaultState, open: true },
        T.closeDrawer()
      );
      expect(newState).toHaveProperty('open', false);
    });

    it('should handle a tag import initialization', () => {
      const newState = tagDrawer(T.defaultState, T.importTagsActions.started());
      expect(newState).toHaveProperty('loading', true);
      expect(newState).toHaveProperty('errors', []);
    });

    it('should handle a successful import', () => {
      const newState = tagDrawer(
        { ...T.defaultState, loading: true },
        T.importTagsActions.done({})
      );
      expect(newState).toHaveProperty('loading', false);
      expect(newState).toHaveProperty('success', true);
    });

    it('should handle a failed import', () => {
      const errors = [
        { entityId: 12345, reason: 'No reason' },
        { entityId: 6789, reason: 'Reason' }
      ];
      const newState = tagDrawer(
        { ...T.defaultState, loading: true },
        T.importTagsActions.failed({ error: errors })
      );
      expect(newState).toHaveProperty('errors', errors);
    });

    it('should handle a reset action', () => {
      const newState = tagDrawer(
        {
          open: true,
          loading: true,
          success: true,
          errors: []
        },
        T.handleReset()
      );
      expect(newState).toEqual(T.defaultState);
    });
  });
});
