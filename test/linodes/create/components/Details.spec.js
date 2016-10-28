import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';

import Details from '~/linodes/create/components/Details';
import { api } from '@/data';

describe('linodes/create/components/Details', () => {
  const { types } = api.types;
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders the card', () => {
    const c = shallow(<Details selectedType={null} />);
    expect(c.find('h2').text()).to.equal('Details');
    // PasswordInput doesn't show up because shallow mount
    expect(c.find('input').length).to.equal(2);
  });

  it('renders multiple labels', () => {
    const c = shallow(<Details selectedType={null} />);
    // PasswordInput input doesn't show up because shallow mount
    expect(c.find('input').length).to.equal(2);
    expect(c.find('[name="label"]').at(0).props().placeholder).to.equal('my-label');
    expect(c.state('labels')).to.have.lengthOf(1);
  });

  it('renders errors', () => {
    const error = 'There was an error';
    const errors = { label: [error] };
    const c = shallow(<Details errors={errors} selectedType={null} />);
    const a = c.find('.alert.alert-danger');

    expect(a.length).to.equal(1);
    const errorList = a.find('ul');
    expect(errorList.find('li').length).to.equal(1);
    expect(errorList.find('li').text()).to.equal(error);
  });

  it('submits inputs when submitted', () => {
    const onSubmit = sandbox.spy();
    // eslint-disable-next-line react/jsx-boolean-value
    const c = mount(
      <Details submitEnabled onSubmit={onSubmit} selectedType={null} />
    );
    const updateInput = (name, value) =>
      c.find(`input[name="${name}"]`).simulate('change', { target: { value } });
    updateInput('label', 'my-label');
    updateInput('password', 'my-password');
    c.find('.btn.btn-cancel').simulate('click');
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

  it('pulls backups price from selectedType', () => {
    const c = shallow(<Details selectedType={types['linode2048.5']} />);
    c.find('.btn.btn-cancel').simulate('click');
    expect(c.find('.checkbox label span').text()).to.contain('$2.50');
  });
});
