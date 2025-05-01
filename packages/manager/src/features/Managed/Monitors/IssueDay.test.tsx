import { DateTime } from 'luxon';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { IssueDay } from './IssueDay';

import type { IssueDayProps } from './IssueDay';

describe('IssueDay', () => {
  it('should include basic Monitor actions', () => {
    const date = DateTime.fromISO('2020-10-01');
    const props: IssueDayProps = {
      day: date.toISO()!,
      issues: [],
    };
    const { getByText } = renderWithTheme(<IssueDay {...props} />);
    getByText('2020-10-01');
  });
});
