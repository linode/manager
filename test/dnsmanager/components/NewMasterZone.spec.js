import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import NewMasterZone from '~/dnsmanager/components/NewMasterZone';

describe('dnsmanager/components/NewMasterZone', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders data', () => {
    const component = shallow(
      <NewMasterZone
        soa_email="test@mail.net"
        dnszone="my-domain.net"
        onSubmit={() => {}}
        onChange={() => {}}
        loading=false
        errors={}
      />
    );

    expect(component.find('Input').at(0).props().value).to.equal('my-domain.net');
    expect(component.find('Input').at(1).props().value).to.equal('test@mail.net');
  });

  it('calls onChange when fields change', () => {
    const onChange = sandbox.stub();
    shallow(
      <NewMasterZone
        soa_email="test@mail.net"
        dnszone=""
        onSubmit={() => {}}
        onChange={onChange}
        loading=false
        errors={}
      />
    );

    expect(onChange.calledTwice).to.equal(true);
    expect(onChange.firstCall.args[0]).to.equal('dnszone');
    expect(onChange.secondCall.args[0]).to.equal('soa_email');
  });

  it('calls onSubmit when form is submitted', () => {
    const onSubmit = sandbox.spy();
    const component = shallow(
      <NewMasterZone
        soa_email="test@mail.net"
        dnszone=""
        onSubmit={onSubmit}
        onChange={() => {}}
        loading=false
        errors={}
      />
    );

    component.find('form').simulate('submit');
    expect(onSubmit.calledOnce).to.equal(true);
  });
});
