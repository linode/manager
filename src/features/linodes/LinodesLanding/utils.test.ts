import { parseMaintenanceStartTime } from './utils';

describe('Linode Landing Utilites', () => {
  it('should return "Maintenance Window Unknown" for invalid dates', () => {
    expect(parseMaintenanceStartTime('iVALid DATE')).toBe(
      'Maintenance Window Unknown'
    );
    expect(parseMaintenanceStartTime('Invalid Date')).toBe(
      'Maintenance Window Unknown'
    );
    expect(parseMaintenanceStartTime('valid')).toBe(
      'Maintenance Window Unknown'
    );
    expect(parseMaintenanceStartTime('2018-4-21T18:58:41')).toBe(
      'Maintenance Window Unknown'
    );
  });

  it('should return a parsed date stamp for a valid datetime', () => {
    expect(parseMaintenanceStartTime('2020-03-22T18:58:41')).toBe(
      '2020-03-22 18:58:41'
    );
    expect(parseMaintenanceStartTime('2018-04-21T18:58:41')).toBe(
      '2018-04-21 18:58:41'
    );
  });

  it('should return "No Maintenance Needed" if the datestamp is undefined or null', () => {
    expect(parseMaintenanceStartTime(undefined)).toBe('No Maintenance Needed');
    expect(parseMaintenanceStartTime(null)).toBe('No Maintenance Needed');
  });
});
