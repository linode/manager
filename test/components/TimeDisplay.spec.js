import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import moment from 'moment';
import TimeDisplay from '~/components/TimeDisplay';

describe('components/TimeDisplay', () => {
  it('renders properly', () => {
    const timeIso = '2017-03-30T16:48:10';
    const tDisplay = shallow(<TimeDisplay time={timeIso} />);
    const timeLong = moment.utc(timeIso, moment.ISO_8601).format('MMM D YYYY h:mm A z');
    const timeRelative = moment.utc(timeIso, moment.ISO_8601).fromNow();

    expect(tDisplay.html()).to.equal(`<span title="${timeLong}">${timeRelative}</span>`);
  });
});

