import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import NewSlaveZone from '~/domains/components/NewSlaveZone';

describe('domains/components/NewSlaveZone', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders data', () => {
    const component = shallow(
      <NewSlaveZone
        master_ips={['127.0.0.1']}
        domain="my-domain.net"
        onSubmit={() => {}}
        onChange={() => {}}
        loading={false}
        errors={{}}
      />
    );

    expect(component.find('Input').at(0).props().value).to.equal('my-domain.net');
    expect(component.find('textarea').at(0).props().value).to.equal('127.0.0.1');
  });

  it('calls onChange when fields change', () => {
    const onChange = sandbox.stub();
    shallow(
      <NewSlaveZone
        master_ips={['98.139.180.149']}
        domain=""
        onSubmit={() => {}}
        onChange={onChange}
        loading={false}
        errors={{}}
      />
    );

    expect(onChange.calledTwice).to.equal(true);
    expect(onChange.firstCall.args[0]).to.equal('domain');
    expect(onChange.secondCall.args[0]).to.equal('master_ips');
  });

  it('calls onSubmit when form is submitted', () => {
    const onSubmit = sandbox.spy();
    const component = shallow(
      <NewSlaveZone
        master_ips={['98.139.180.149']}
        domain=""
        onSubmit={onSubmit}
        onChange={() => {}}
        loading={false}
        errors={{}}
      />
    );

    component.find('Form').simulate('submit');
    expect(onSubmit.calledOnce).to.equal(true);
  });
});
