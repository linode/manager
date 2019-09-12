import * as moment from 'moment';
import * as React from 'react';

import useTimezone from 'src/hooks/useTimezone';
import { ExtendedIssue } from 'src/store/managed/issues.actions';
import IssueDay from './IssueDay';

const TOTAL_DAYS = 10;

interface Props {
  issues: ExtendedIssue[];
}

export const IssueCalendar: React.FC<Props> = props => {
  const { issues } = props;
  const timezone = useTimezone();

  /**
   * To maintain continuity with Classic, we have to generate
   * a mock calendar of the past 10 days. If an issue was created
   * on that day, it belongs to that day and is passed to the
   * display component.
   *
   * The number of issues affecting a given monitor should be small,
   * so imo it would be ineffective to memoize this computation.
   */
  const days: JSX.Element[] = [];
  let i = 0;
  // Start with today, since it will be at the top of our list.
  const day = moment.utc().tz(timezone);
  for (i; i < TOTAL_DAYS; i++) {
    /**
     * Iterate through the past 10 days
     */
    let j = 0;
    const relevantIssues = [];
    for (j; j < issues.length; j++) {
      // Iterate through the available issues.
      const thisIssue = issues[j];
      // Was this issue opened on the current day?
      if (
        moment
          .utc(thisIssue.created)
          .tz(timezone)
          .isSame(day, 'day')
      ) {
        relevantIssues.push(thisIssue);
      }
    }
    days.push(
      <IssueDay
        key={`issue-day-${i}`}
        issues={relevantIssues}
        day={day.toISOString()}
      />
    );
    // Move the calendar back a day
    day.subtract(1, 'day');
  }

  return <>{days}</>;
};

export default IssueCalendar;
