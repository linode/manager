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

    const november_20_2019_255PM = 1574279721660;

    const createDate = (value: any) =>
      new Date(value).toLocaleString('en-US', {
        timeZone: 'America/New_York',
        dateStyle: 'short',
        timeStyle: 'short'
      } as any);

    expect(
      `${createDate(
        getOptionValue('Past 30 Minutes')!.value(november_20_2019_255PM)
      )}`
    ).toMatch(/11\/20\/2019, 2:25:21 PM/gim);

    expect(
      `${createDate(
        getOptionValue('Past 12 Hours')!.value(november_20_2019_255PM)
      )}`
    ).toMatch(/11\/20\/2019, 2:55:21 AM/gim);

    expect(
      `${createDate(
        getOptionValue('Past 24 Hours')!.value(november_20_2019_255PM)
      )}`
    ).toMatch(/11\/19\/2019, 2:55:21 PM/gim);

    expect(
      `${createDate(
        getOptionValue('Past 7 Days')!.value(november_20_2019_255PM)
      )}`
    ).toMatch(/11\/13\/2019, 2:55:21 PM/gim);

    expect(
      `${createDate(
        getOptionValue('Past 30 Days')!.value(november_20_2019_255PM)
      )}`
    ).toMatch(/10\/21\/2019, 3:55:21 PM/gim);

    expect(
      `${createDate(
        getOptionValue('2019' as any)!.value(november_20_2019_255PM)
      )}`
    ).toMatch(/1\/1\/2019, 12:00:00 AM/gim);
  });
});
