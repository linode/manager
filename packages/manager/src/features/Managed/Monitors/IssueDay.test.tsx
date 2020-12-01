import * as React from 'react';
import { IssueDay, Props } from './IssueDay';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { DateTime } from 'luxon';

describe('IssueDay', () => {
  it('should include basic Monitor actions', () => {
    const date = DateTime.fromISO('2020-10-01');
    const props: Props = {
      day: date.toISO(),
      issues: []
    };
    const { getByText } = renderWithTheme(<IssueDay {...props} />);
    getByText('2020-10-01');
  });
});
