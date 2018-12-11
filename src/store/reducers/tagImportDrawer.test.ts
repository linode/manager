import tagDrawer, * as T from './tagImportDrawer';

describe("tagImportDrawer Redux duck", () => {
  describe("reducer", () => {
    it.skip("should be closed by default", () => {
      expect(T.defaultState).toHaveProperty('open', false);
    })
    it("should handle OPEN", () => {
      expect(tagDrawer(T.defaultState, T.open())).toEqual(
        {...T.defaultState, open: true}
      )
    });
    it("should handle CLOSE", () => {
      const newState = tagDrawer(
        {...T.defaultState, open: true }, T.close());
      expect(newState).toHaveProperty('open', false)
    });
    it("should handle UPDATE", () => {
      const newState = tagDrawer(
        T.defaultState, T.handleUpdate() as any
      );
      expect(newState).toHaveProperty('loading', true);
    });
    it("should handle SUCCESS", () => {
      const newState = tagDrawer(
        {...T.defaultState, loading: true}, T.handleSuccess() as any
      );
      expect(newState).toHaveProperty('loading', false);
      expect(newState).toHaveProperty('success', true);
    });
    it("should handle ERROR", () => {
      const errors = [{ entityId: 12345, reason: 'No reason'},
                      { entityId: 6789, reason: 'Reason' }];
      const newState = tagDrawer(
        {...T.defaultState, loading: true}, T.handleError(
          errors
        ) as any
      );
      expect(newState).toHaveProperty('errors', errors);
    });
  });
});