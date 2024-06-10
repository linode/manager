import { DateTime } from 'luxon';

import { generateStartTime } from './TimeRangeSelect';

describe('Utility Functions', () => {
  it('should create values as functions that return the correct datetime', () => {
    const GMT_november_20_2019_849PM = 1574282998;

    expect(
      generateStartTime('Past 30 Minutes', GMT_november_20_2019_849PM)
    ).toEqual(
      DateTime.fromSeconds(GMT_november_20_2019_849PM)
        .minus({ minutes: 30 })
        .toSeconds()
    );

    expect(
      generateStartTime('Past 12 Hours', GMT_november_20_2019_849PM)
    ).toEqual(
      DateTime.fromSeconds(GMT_november_20_2019_849PM)
        .minus({ hours: 12 })
        .toSeconds()
    );

    expect(
      generateStartTime('Past 24 Hours', GMT_november_20_2019_849PM)
    ).toEqual(
      DateTime.fromSeconds(GMT_november_20_2019_849PM)
        .minus({ hours: 24 })
        .toSeconds()
    );

    expect(
      generateStartTime('Past 7 Days', GMT_november_20_2019_849PM)
    ).toEqual(
      DateTime.fromSeconds(GMT_november_20_2019_849PM)
        .minus({ days: 7 })
        .toSeconds()
    );

    expect(
      generateStartTime('Past 30 Days', GMT_november_20_2019_849PM)
    ).toEqual(
      DateTime.fromSeconds(GMT_november_20_2019_849PM)
        .minus({ hours: 24 * 30 })
        .toSeconds()
    );
  });
});
