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

  it('renders errors', () => {
    const error = 'There was an error';
    const errors = { label: [error] };
    const details = mount(<Details errors={errors} selectedType={null} />);
    const alert = details.find('.alert.alert-danger');

    expect(alert.length).to.equal(1);
    const errorList = alert.find('ul');
    expect(errorList.find('li').length).to.equal(1);
    expect(errorList.find('li').text()).to.equal(error);
  });

  it('submits inputs when submitted', () => {
    const onSubmit = sandbox.spy();
    const details = mount(
      <Details submitEnabled onSubmit={onSubmit} selectedType={null} />
    );

    const find = (name) => details.find(`.LinodesCreateDetails-${name}`);

    find('label').find('input').simulate('change', { target: { value: 'my-label' } });
    find('password').find('input').simulate('change', { target: { value: 'my-password' } });
    find('enableBackups').find('input').simulate('change', { target: { checked: true } });

    details.find('form').simulate('submit');

    expect(onSubmit.calledOnce).to.equal(true);
    expect(onSubmit.firstCall.args[0]).to.deep.equal({
      password: 'my-password',
      label: 'my-label',
      backups: true,
    });
  });

  it('does not show password and backup options when no distro is selected', () => {
    const details = shallow(
      <Details
        onSubmit={sandbox.spy}
        selectedDistribution={'none'}
        selectedType={null}
      />
    );

    expect(details.find({ label: 'Root password', showIf: false }).length).to.equal(1);
    expect(details.find({ label: 'Enable backups', showIf: false }).length).to.equal(1);
  });

  it('pulls backups price from selectedType', () => {
    const details = mount(<Details selectedType={types['linode2048.5']} />);
    expect(details.find('.LinodesCreateDetails-enableBackups').text()).to.contain('$2.50');
  });
});
