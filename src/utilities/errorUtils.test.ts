import {
  mockAxiosError,
  mockAxiosErrorWithAPIErrorContent
} from 'src/__data__/axios';
import { getAPIErrorOrDefault, getErrorStringOrDefault } from './errorUtils';

const error = [{ field: 'a field', reason: 'a reason' }];

const multiError = [
  { field: 'field 1', reason: 'reason 1' },
  { field: 'field 2', reason: 'reason 2' }
];

describe('Error handling utilities', () => {
  describe('getAPIErrorOrDefault', () => {
    it('if no error is passed in, it should return a default API error using the provided string', () => {
      expect(getAPIErrorOrDefault(mockAxiosError, 'Default error')).toEqual([
        { reason: 'Default error' }
      ]);
    });

    it('should provide a default error if no error string is provided', () => {
      expect(getAPIErrorOrDefault(mockAxiosError)).toEqual([
        { reason: 'An unexpected error occurred.' }
      ]);
    });

    it('should use the optional 3rd param as a field name for the default error (if provided)', () => {
      expect(
        getAPIErrorOrDefault(mockAxiosError, 'Label error', 'label')
      ).toEqual([{ field: 'label', reason: 'Label error' }]);
    });
  });

  describe('getErrorStringOrDefault', () => {
    it('should return the reason for the first error in the APIError array', () => {
      expect(getErrorStringOrDefault(error)).toMatch('a reason');
      expect(getErrorStringOrDefault(multiError)).toMatch('reason 1');
    });

    it('should return the given default string if the error object is empty', () => {
      expect(getErrorStringOrDefault([], 'A horrible error occurred.')).toMatch(
        'A horrible error occurred.'
      );
    });

    it('should return its own default as a final fallback', () => {
      expect(getErrorStringOrDefault([])).toMatch(
        'An unexpected error occurred.'
      );
    });

    it('should just return the string if you pass it a string', () => {
      expect(getErrorStringOrDefault('a', 'b')).toBe('a');
    });

    it('should access response.data.errors if passed an AxiosError', () => {
      expect(
        getErrorStringOrDefault(mockAxiosErrorWithAPIErrorContent)
      ).toMatch(
        mockAxiosErrorWithAPIErrorContent.response.data.errors[0].reason
      );
    });
  });
});
