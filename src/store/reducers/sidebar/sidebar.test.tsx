import * as React from 'react';
import sidebar, {
  CLEAR,
  clearSidebar,
  defaultState,
  SET,
  setSidebarComponent,
} from './sidebar';

const comp = <div/>;

describe("Redux sidebar", () => {
  describe("Sidebar reducer", () => {
    it("should handle SET", () => {
      expect(sidebar(defaultState, { type: SET, data: [comp]}))
        .toEqual({ components: [comp]});
    });
    it("should handle CLEAR", () => {
      expect(sidebar({ components: [comp]}, { type: CLEAR }))
        .toEqual(defaultState);
    });
  });
  describe("Action creators", () => {
    it("clearSidebar should call CLEAR", () => {
      expect(clearSidebar()).toEqual({ type: CLEAR });
    });
  });
  it("setSideBarComponent should pass an array of JSX elements", () => {
    expect(setSidebarComponent([comp])).toEqual({ type: SET, data: [comp]});
  });
});
