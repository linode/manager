import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { mount } from 'enzyme';

import Details from '~/linodes/create/components/Details';

describe('linodes/create/components/Details', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders the card', () => {
    const c = mount(<Details />);
    expect(c.contains(<h2>Details</h2>)).to.equal(true);
    expect(c.find('input').length).to.equal(5);
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

  it('submits inputs when submitted', () => {
    const onSubmit = sandbox.spy();
    // eslint-disable-next-line react/jsx-boolean-value
    const c = mount(<Details submitEnabled={true} onSubmit={onSubmit} />);
    const updateInput = (name, value) =>
      c.find(`input[name="${name}"]`).simulate('change', { target: { value } });
    updateInput('label', 'my-label');
    updateInput('password', 'my-password');
    updateInput('enableBackups', true);
    c.find('form').simulate('submit');

    expect(onSubmit.calledOnce).to.equal(true);
    expect(onSubmit.firstCall.args[0]).to.deep.equal({
      password: 'my-password',
      labels: ['my-label'],
      backups: true,
      group: '',
    });
  });
});
