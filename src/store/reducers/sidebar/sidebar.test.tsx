import sidebar, {
  addBackupsToSidebar,
  CLEAR_CTA,
  clearSidebar,
  defaultState,
  SET_CTA,
} from './sidebar';

describe("Redux sidebar", () => {
  describe("Sidebar reducer", () => {
    it("should handle SET_CTA", () => {
      expect(sidebar(defaultState, { type: SET_CTA }))
        .toEqual({ backupsCTA: true });
    });
    it("should handle CLEAR", () => {
      expect(sidebar({ backupsCTA: true}, { type: CLEAR_CTA }))
        .toEqual(defaultState);
    });
  });
  describe("Action creators", () => {
    it("clearSidebar should call CLEAR_CTA", () => {
      expect(clearSidebar()).toEqual({ type: CLEAR_CTA });
    });
  });
  it("setSideBarComponent should set backupsCTA to true", () => {
    expect(addBackupsToSidebar()).toEqual({ type: SET_CTA });
  });
});
