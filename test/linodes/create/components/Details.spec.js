import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import Details from '~/linodes/create/components/Details';

describe('linodes/create/components/Details', () => {
  it('renders the card', () => {
    const c = mount(<Details />);
    expect(c.contains(<h2>Details</h2>)).to.equal(true);
    expect(c.find('input').length).to.equal(3);
  });

  it('renders errors', () => {
    const error = 'There was an error';
    const errors = { label: [error] };
    const c = mount(<Details errors={errors} />);
    const a = c.find('.alert');

    expect(a).to.exist;
    const errorList = a.find('ul');
    expect(errorList.find('li').length).to.equal(1);
    expect(errorList.find('li').text()).to.equal(error);
  });
});
