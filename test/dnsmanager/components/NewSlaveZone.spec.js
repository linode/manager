import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import NewSlaveZone from '~/dnsmanager/components/NewSlaveZone';

describe('dnsmanager/components/NewSlaveZone', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders data', () => {
    const component = shallow(
      <NewSlaveZone
        masters="98.139.180.149"
        dnszone="my-domain.net"
        onSubmit={() => {}}
        onChange={() => {}}
      />
    );

    expect(component.find('input').at(0).props().value).to.equal('my-domain.net');
    expect(component.find('textarea').at(0).props().value).to.equal('98.139.180.149');
  });

  it('calls onChange when fields change', () => {
    const onChange = sandbox.stub();
    shallow(
      <NewSlaveZone
        masters="98.139.180.149"
        dnszone=""
        onSubmit={() => {}}
        onChange={onChange}
      />
    );

    expect(onChange.calledTwice).to.equal(true);
    expect(onChange.firstCall.args[0]).to.equal('dnszone');
    expect(onChange.secondCall.args[0]).to.equal('masters');
  });

  it('calls onSubmit when form is submitted', () => {
    const onSubmit = sandbox.spy();
    const component = shallow(
      <NewSlaveZone
        masters="98.139.180.149"
        dnszone=""
        onSubmit={onSubmit}
        onChange={() => {}}
      />
    );

    component.find('form').simulate('submit');
    expect(onSubmit.calledOnce).to.equal(true);
  });
});
