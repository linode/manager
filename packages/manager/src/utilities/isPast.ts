import * as moment from 'moment';

export default (a: string) => (b: string): boolean =>
  moment.utc(b).isAfter(moment.utc(a));
