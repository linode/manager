import { screen } from '@testing-library/react';
import * as React from 'react';
import { DateTime } from 'luxon';
import { getTimeRemaining } from './ConfirmTransferDialog';

describe('Accept Entity Transfer confirmation dialog', () => {
  describe('getTimeRemaining helper function', () => {
    it('should return a large time in hours remaining', () => {
      expect(
        getTimeRemaining(
          DateTime.local()
            .plus({ hours: 23 })
            .toISO()
        )
      ).toMatch(/in 23 hours/);
    });

    it('should return smaller time in minutes remaining', () => {
      expect(
        getTimeRemaining(
          DateTime.local()
            .plus({ minutes: 8 })
            .toISO()
        )
      ).toMatch(/in 8 minutes/);
    });
  });
});
