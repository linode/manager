import * as moment from 'moment';

import { formatDate } from 'src/utilities/format-date-iso8601';

export const humanize = (time:string) => {
  const then = moment(time);

  // @todo error handling
  if (!then) { return; }

  const now = moment();
  const delta = moment.duration(then.diff(now));
  if (delta > moment.duration(1, 'weeks')) {
    return formatDate(time);
  }
  return moment(time).fromNow();
}