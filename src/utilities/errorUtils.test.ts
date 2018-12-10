import { mockAPIFieldErrors } from 'src/services';

import { getAPIErrorOrDefault, getErrorStringOrDefault } from './errorUtils';

const fakeError = mockAPIFieldErrors(['label', 'password']);
const defaultError = [{'reason': 'An unexpected error occurred.'}]

describe("Error utilities", () => {
  describe("getAPIErrorOrDefault", () => {
    it("should return an error array if provided", () => {
      expect(getAPIErrorOrDefault(fakeError)).toEqual(fakeError);
    });
    it("should return the default if the array is empty", () => {
      expect(getAPIErrorOrDefault([])).toEqual(defaultError);
    });
    it("should pass the user's default if given", () => {
      expect(getAPIErrorOrDefault([], 'An Error')).toEqual([{'reason': 'An Error'}]);
    });
    it("should attach an optional field to the default error", () => {
      expect(getAPIErrorOrDefault([], 'An error', 'username')).toEqual([{reason: 'An error', field: 'username'}]);
    });
  });
  describe("getErrorStringOrDefault", () => {
    it("should return the reason of the first error in the array", () => {
      expect(getErrorStringOrDefault(fakeError)).toEqual(fakeError[0].reason);
    });
    it("should return the default string if the error is empty", () => {
      expect(getErrorStringOrDefault([])).toMatch('An unexpected error occurred.');
    });
    it("should pass the user's default if provided", () => {
      expect(getErrorStringOrDefault([], 'An error')).toMatch('An error');
    });
  });
});