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

    expect(
      `${new Date(
        getOptionValue('Past 30 Minutes')!.value(november_20_2019_255PM)
      )}`
    ).toMatch(/Nov 20 2019 14:25/gim);

    expect(
      `${new Date(
        getOptionValue('Past 12 Hours')!.value(november_20_2019_255PM)
      )}`
    ).toMatch(/Nov 20 2019 02:55/gim);

    expect(
      `${new Date(
        getOptionValue('Past 24 Hours')!.value(november_20_2019_255PM)
      )}`
    ).toMatch(/Nov 19 2019 14:55/gim);

    expect(
      `${new Date(
        getOptionValue('Past 7 Days')!.value(november_20_2019_255PM)
      )}`
    ).toMatch(/Nov 13 2019 14:55/gim);

    expect(
      `${new Date(
        getOptionValue('Past 30 Days')!.value(november_20_2019_255PM)
      )}`
    ).toMatch(/Oct 21 2019 15:55/gim);

    expect(
      `${new Date(
        getOptionValue('2019' as any)!.value(november_20_2019_255PM)
      )}`
    ).toMatch(/Jan 01 2019 00:00/gim);
  });
});
