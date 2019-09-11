import * as moment from 'moment';
import * as React from 'react';

import { ExtendedIssue } from 'src/store/managed/issues.actions';
import IssueDay from './IssueDay';

const TOTAL_DAYS = 10;

interface Props {
  issues: ExtendedIssue[];
}

export const IssueCalendar: React.FC<Props> = props => {
  const { issues } = props;

  const days: JSX.Element[] = [];
  let i = 0;
  const day = moment.utc().tz('GMT');
  for (i; i < TOTAL_DAYS; i++) {
    let j = 0;
    const relevantIssues = [];
    for (j; j < issues.length; j++) {
      const thisIssue = issues[j];
      if (moment.utc(thisIssue.created).tz('GMT').isSame(day, 'day')) {
          relevantIssues.push(thisIssue);
      }
    }
    days.push(<IssueDay issues={relevantIssues} day={day.toISOString()} />);
    day.subtract(1, 'day');
  }

  return (
    <>
      {days}
    </>
  )

}

export default IssueCalendar;