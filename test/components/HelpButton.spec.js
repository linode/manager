import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { HelpButton } from 'linode-components/buttons';

describe('components/buttons/HelpButton', () => {
  it('renders a Link to the suggested article', () => {
    const button = shallow(
      <HelpButton to="http://example.org" />
    );

    expect(button.find('Link').props().to).to.equal('http://example.org');
    expect(button.find('Link').props().target).to.equal('_blank');
  });
});
