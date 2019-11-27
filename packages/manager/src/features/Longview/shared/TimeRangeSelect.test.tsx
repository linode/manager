import {
  generateSelectOptions,
  generateStartTime,
  Labels
} from './TimeRangeSelect';

describe('Utility Functions', () => {
  it('should return limited options if not longview pro', () => {
    const optionLabels = generateSelectOptions(false, '2019').map(o => o.label);
    expect(optionLabels).toEqual([
      'Select a time range',
      'Past 30 Minutes',
      'Past 12 Hours'
    ]);
  });

  it('should return all options if longview pro', () => {
    const optionLabels = generateSelectOptions(true, '2019').map(o => o.label);
    expect(optionLabels).toEqual([
      'Select a time range',
      'Past 30 Minutes',
      'Past 12 Hours',
      'Past 24 Hours',
      'Past 7 Days',
      'Past 30 Days',
      'Past Year',
      '2019'
    ]);
  });

  it('should create values as functions that return the correct datetime', () => {
    const GMT_november_20_2019_849PM = 1574282998;

    const createDate = (value: any) =>
      /* 3 0s to turn into milliseconds */
      new Date(value * 1000).toLocaleString('en-US', {
        timeZoneName: 'short',
        timeZone: 'GMT'
      });

    expect(
      `${createDate(
        generateStartTime('Past 30 Minutes', GMT_november_20_2019_849PM, 2019)
      )}`
    ).toMatch(/11\/20\/2019, 8:19:58 PM/gim);

    expect(
      `${createDate(
        generateStartTime('Past 12 Hours', GMT_november_20_2019_849PM, 2019)
      )}`
    ).toMatch(/11\/20\/2019, 8:49:58 AM/gim);

    expect(
      `${createDate(
        generateStartTime('Past 24 Hours', GMT_november_20_2019_849PM, 2019)
      )}`
    ).toMatch(/11\/19\/2019, 8:49:58 PM/gim);

    expect(
      `${createDate(
        generateStartTime('Past 7 Days', GMT_november_20_2019_849PM, 2019)
      )}`
    ).toMatch(/11\/13\/2019, 8:49:58 PM/gim);

    expect(
      `${createDate(
        generateStartTime('Past 30 Days', GMT_november_20_2019_849PM, 2019)
      )}`
    ).toMatch(/10\/21\/2019, 8:49:58 PM/gim);

    expect(
      /* 
        this isn't using createDate() because we want it to be 
        Jan 1 2019 12AM regardless of timezone 
      */
      `${new Date(
        generateStartTime('2019' as Labels, GMT_november_20_2019_849PM, 2019) *
          1000
      ).toLocaleString()}`
    ).toMatch(/1\/1\/2019, 12:00:00 AM/gim);
  });
});
