import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { mount } from 'enzyme';

import Details from '~/linodes/create/components/Details';
import { api } from '@/data';
import { expectObjectDeepEquals } from '@/common';

describe('linodes/create/components/Details', () => {
  const { types } = api.types;
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders errors', () => {
    const error = 'There was an error';
    const errors = { label: [{ reason: error }] };
    const details = mount(<Details errors={errors} selectedType={null} />);
    const feedback = details.find('.form-control-feedback');

    expect(feedback.length).to.equal(1);
    expect(feedback.children().length).to.equal(1);
    expect(feedback.childAt(0).text()).to.equal(error);
  });

  it('submits inputs when submitted', async () => {
    const onSubmit = sandbox.spy();
    const details = mount(
      <Details submitEnabled onSubmit={onSubmit} selectedType={null} />
    );

    details.find('#label').simulate('change', { target: { value: 'my-label' } });
    details.find('input[type="password"]').simulate('change', { target: { value: 'my-password' } });
    details.find('#backups').simulate('change', { target: { checked: true } });

    await details.find('form').props().onSubmit();

    expect(onSubmit.callCount).to.equal(1);

    expectObjectDeepEquals(onSubmit.firstCall.args[0], {
      password: 'my-password',
      label: 'my-label',
      backups: true,
    });
  });

  it('pulls backups price from selectedType', () => {
    const details = mount(<Details selectedType={types['linode2048.5']} />);
    expect(details.find('#backups + span').text()).to.contain('$2.50');
  });
});
