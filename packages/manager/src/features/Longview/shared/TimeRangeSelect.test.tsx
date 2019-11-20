import { generateSelectOptions, Labels } from './TimeRangeSelect';

describe('Utility Functions', () => {
  it('should return limited options if not longview pro', () => {
    const optionLabels = generateSelectOptions(false, '2019').map(o => o.label);
    expect(optionLabels).toEqual(['Past 30 Minutes', 'Past 12 Hours']);
  });

  it('should return all options if longview pro', () => {
    const optionLabels = generateSelectOptions(true, '2019').map(o => o.label);
    expect(optionLabels).toEqual([
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
    const options = generateSelectOptions(true, '2019');
    const getOptionValue = (label: Labels) =>
      options.find(o => o.label === label);

    const GMT_november_20_2019_849PM = 1574282998914;

    const createDate = (value: any) =>
      new Date(value).toLocaleString('en-US', {
        timeZoneName: 'short',
        timeZone: 'GMT'
      });

    expect(
      `${createDate(
        getOptionValue('Past 30 Minutes')!.value(GMT_november_20_2019_849PM)
      )}`
    ).toMatch(/11\/20\/2019, 8:19:58 PM/gim);

    expect(
      `${createDate(
        getOptionValue('Past 12 Hours')!.value(GMT_november_20_2019_849PM)
      )}`
    ).toMatch(/11\/20\/2019, 8:49:58 AM/gim);

    expect(
      `${createDate(
        getOptionValue('Past 24 Hours')!.value(GMT_november_20_2019_849PM)
      )}`
    ).toMatch(/11\/19\/2019, 8:49:58 PM/gim);

    expect(
      `${createDate(
        getOptionValue('Past 7 Days')!.value(GMT_november_20_2019_849PM)
      )}`
    ).toMatch(/11\/13\/2019, 8:49:58 PM/gim);

    expect(
      `${createDate(
        getOptionValue('Past 30 Days')!.value(GMT_november_20_2019_849PM)
      )}`
    ).toMatch(/10\/21\/2019, 8:49:58 PM/gim);

    expect(
      /* 
        this isn't using createDate() because we want it to be 
        Jan 1 2019 12AM regardless of timezone 
      */
      `${new Date(
        getOptionValue('2019' as Labels)!.value(GMT_november_20_2019_849PM)
      ).toLocaleString()}`
    ).toMatch(/1\/1\/2019, 12:00:00 AM/gim);
  });
});
