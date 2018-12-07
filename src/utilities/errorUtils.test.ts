import { getAPIErrorOrDefault, getErrorStringOrDefault } from './errorUtils';

describe("Error utilities", () => {
  describe("getAPIErrorOrDefault", () => {
    it("should pass", () => {
      expect(getAPIErrorOrDefault).toBeDefined();
    });
  });
  describe("getErrorStringOrDefault", () => {
    it("should pass", () => {
      expect(getErrorStringOrDefault).toBeDefined();
    })
  });
});