import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import Details from '~/linodes/create/components/Details';

import { api } from '@/data';


describe('linodes/create/components/Details', () => {
  const { types } = api.types;
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('submits inputs when submitted', async () => {
    const onSubmit = sandbox.spy();
    const details = mount(
      <Details
        selectedType={null}
        onSubmit={onSubmit}
        onChange={() => {}}
        selectedDistribution={null}
        loading={false}
        label={"my-label"}
        password={"my-password"}
        backups
        errors={{}}
      />
    );

    await details.find('form').props().onSubmit({ preventDefault() {} });
    expect(onSubmit.callCount).to.equal(1);
  });

  it('pulls backups price from selectedType', () => {
    const details = mount(
      <Details
        selectedType={types['linode2048.5']}
        onSubmit={() => {}}
        onChange={() => {}}
        selectedDistribution={null}
        loading={false}
        label={"my-label"}
        password={"my-password"}
        backups
        errors={{}}
      />
    );
    expect(details.find('#backups + span').text()).to.contain('$2.50');
  });
});
