import React from 'react';
import { shallow } from 'enzyme';
import moment from 'moment';
import TimeDisplay from '~/components/TimeDisplay';

describe('components/TimeDisplay', () => {
  it('should render without error', () => {
    const wrapper = shallow(
      <TimeDisplay time="2017-03-30T16:48:10" />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders properly', () => {
    const timeIso = '2017-03-30T16:48:10';
    const tDisplay = shallow(<TimeDisplay time={timeIso} />);
    const timeLong = moment.utc(timeIso, moment.ISO_8601).format('MMM D YYYY h:mm A z');
    const timeRelative = moment.utc(timeIso, moment.ISO_8601).fromNow();

    expect(tDisplay.html()).toBe(`<span title="${timeLong}">${timeRelative}</span>`);
  });
});

