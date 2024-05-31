import React from 'react';

import { Typography } from 'src/components/Typography';
import { DEFAULT_ERROR_MESSAGE } from 'src/constants';

import { getAPIErrorOrDefault, getErrorStringOrDefault } from './errorUtils';

import type { FormattedAPIError } from 'src/types/FormattedAPIError';

const error: FormattedAPIError[] = [
  {
    field: 'a field',
    formattedReason: <Typography>Formatted reason</Typography>,
    reason: 'a reason',
  },
];

const multiError: FormattedAPIError[] = [
  {
    field: 'field 1',
    formattedReason: <Typography>reason 1</Typography>,
    reason: 'reason 1',
  },
  {
    field: 'field 2',
    formattedReason: <Typography>reason 2</Typography>,
    reason: 'reason 2',
  },
];

describe('Error handling utilities', () => {
  describe('getAPIErrorOrDefault', () => {
    it('should override a default error', () => {
      expect(
        getAPIErrorOrDefault(
          [
            {
              formattedReason: DEFAULT_ERROR_MESSAGE,
              reason: DEFAULT_ERROR_MESSAGE,
            },
          ],
          'New error message'
        )
      ).toEqual([{ reason: 'New error message' }]);
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
  });
});
