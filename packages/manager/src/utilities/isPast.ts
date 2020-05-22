import {DateTime} from 'luxon'

export default (a: string) => (b: string): boolean =>
  DateTime.fromISO(b,{zone:'utc'}) >= DateTime.fromISO(a, {zone:'utc'});
