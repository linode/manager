import { DateTime } from 'luxon';

import { parseAPIDate } from 'src/utilities/date';

export const getDateOptions = (linodeCreated: string) => {
  const currentTime = DateTime.local();
  const currentMonth = currentTime.month;
  const currentYear = currentTime.year;
  const options: [string, string][] = [['24', 'Last 24 Hours']];
  const createdDate = parseAPIDate(linodeCreated);

  const creationFirstOfMonth = createdDate.startOf('month');
  let [testMonth, testYear] = [currentMonth, currentYear];
  let testDate;
  do {
    // When we request Linode stats for the CURRENT month/year, the data we get back is
    // from the last 30 days. We want the options to reflect this.
    //
    // Example: If it's Jan. 15, the options would be "Last 24 Hours", "Last 30 Days", "Dec 2018" ... etc.
    const optionDisplay =
      testYear === currentYear && testMonth === currentMonth
        ? 'Last 30 Days'
        : currentTime
            .set({ month: testMonth, year: testYear })
            .toFormat('LLL yyyy');
    options.push([
      `${testYear} ${testMonth.toString().padStart(2, '0')}`,
      optionDisplay,
    ]);

    if (testMonth === 1) {
      testMonth = 12;
      testYear -= 1;
    } else {
      testMonth -= 1;
    }
    // same comment as above. Month needs to be prepended with a "0"
    // if it's only one digit to appease moment.js
    testDate = DateTime.fromObject({
      day: 1,
      month: testMonth,
      year: testYear,
    });
  } while (testDate >= creationFirstOfMonth);
  return options.map((option) => {
    return { label: option[1], value: option[0] };
  });
};
