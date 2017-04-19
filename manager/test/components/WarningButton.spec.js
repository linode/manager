import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import WarningButton from '~/components/WarningButton';

describe('components/WarningButton', () => {
  it('renders warning button with target blank', () => {
    const button = shallow(
      <WarningButton to="http://example.org" />
    );

    expect(button.find('Link').props().to).to.equal('http://example.org');
    expect(button.find('Link').props().target).to.equal('');
  });

  it('renders warning button with target _parent', () => {
    const button = shallow(
      <WarningButton to="http://example.org" target="_parent" />
    );

    expect(button.find('Link').props().to).to.equal('http://example.org');
    expect(button.find('Link').props().target).to.equal('_parent');
  });
});
