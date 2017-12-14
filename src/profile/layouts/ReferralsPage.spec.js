import React from 'react';
import { shallow } from 'enzyme';

import { ReferralsPage } from './ReferralsPage';

const referrals = {
  code: 'ABC123',
  url: 'http://somesite.com/?referral=ABC123',
  total: 0,
  completed: [],
  pending: [],
  credit: 999.99,
};

describe('profiles/ReferralsPage', () => {
  it('should render without error', () => {
    const wrapper = shallow(<ReferralsPage referrals={referrals} />);
    expect(wrapper).toMatchSnapshot();
  });
});
