import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import DatacenterSelection from '~/linodes/components/DatacenterSelection';

describe('linodes/components/DatacenterSelection', () => {
  it('renders the card header', () => {
    const c = shallow(<DatacenterSelection />);
    expect(c.contains(<h2>Select a datacenter</h2>)).to.equal(true);
  });
});
