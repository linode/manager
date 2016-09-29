import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';

import Details from '~/linodes/create/components/Details';

describe('linodes/create/components/Details', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders the card', () => {
    const c = shallow(<Details />);
    expect(c.find('h2').text()).to.equal('Details');
    // 1 label + 1 group + 1 backup + 1 quantity = 4
    // PasswordInput doesn't show up because shallow mount
    expect(c.find('input').length).to.equal(4);
  });

  it('renders multiple labels', () => {
    const c = shallow(<Details />);
    c.find('[name="quantity"]').simulate('change', { target: { value: 3 } });
    // 3 labels + 1 group + 1 backups + 1 quantity = 6
    // PasswordInput input doesn't show up because shallow mount
    expect(c.find('input').length).to.equal(6);
    expect(c.state('labels')).to.have.lengthOf(3);
    expect(c.state('labels')).to.have.members(['', null, null]);
    expect(c.find('[name="label"]').at(0).props().placeholder).to.equal('my-label');
    expect(c.find('[name="label"]').at(1).props().placeholder).to.equal('my-label-1');
    expect(c.find('[name="label"]').at(2).props().placeholder).to.equal('my-label-2');

    c.find('[name="quantity"]').simulate('change', { target: { value: 2 } });
    expect(c.state('labels')).to.have.lengthOf(2);
    expect(c.state('labels')).to.have.members(['', null]);
  });

  it('renders errors', () => {
    const error = 'There was an error';
    const errors = { label: [error] };
    const c = shallow(<Details errors={errors} />);
    const a = c.find('.alert.alert-danger');

    expect(a.length).to.equal(1);
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
    c.find('input[name="enableBackups"]').simulate('change',
      { target: { checked: true } });
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
