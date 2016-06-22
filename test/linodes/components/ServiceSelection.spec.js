import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import ServiceSelection from '~/linodes/components/ServiceSelection';

describe('linodes/components/ServiceSelection', () => {
  it('renders the card header', () => {
    const c = shallow(<ServiceSelection />);
    expect(c.contains(<h2>Select a plan</h2>)).to.equal(true);
  });
});
