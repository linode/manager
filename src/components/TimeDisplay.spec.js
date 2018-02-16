import React from 'react';
import { shallow } from 'enzyme';
import moment from 'moment';
import TimeDisplay from '~/components/TimeDisplay';

describe('components/TimeDisplay', () => {
  it('renders properly', () => {
    const timeIso = '2017-03-30T16:48:10';
    const tDisplay = shallow(<TimeDisplay time={timeIso} />);
    const timeLong = moment.utc(timeIso, moment.ISO_8601).tz('UTC');
    const timeRelative = timeLong.fromNow();
    const timeFormatted = timeLong.format('MMM D YYYY h:mm A z');

    expect(tDisplay.html()).toBe(`<span title="${timeFormatted}">${timeRelative}</span>`);
  });
});

