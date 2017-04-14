import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import NewMasterZone from '~/domains/components/NewMasterZone';

describe('domains/components/NewMasterZone', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders data', () => {
    const component = shallow(
      <NewMasterZone
        soa_email="test@mail.net"
        domain="my-domain.net"
        onSubmit={() => {}}
        onChange={() => {}}
        loading={false}
        errors={{}}
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
        domain=""
        onSubmit={() => {}}
        onChange={onChange}
        loading={false}
        errors={{}}
      />
    );

    expect(onChange.callCount).to.equal(2);
    expect(onChange.firstCall.args[0]).to.equal('domain');
    expect(onChange.secondCall.args[0]).to.equal('soa_email');
  });

  it('calls onSubmit when form is submitted', () => {
    const onSubmit = sandbox.spy();
    const component = shallow(
      <NewMasterZone
        soa_email="test@mail.net"
        domain=""
        onSubmit={onSubmit}
        onChange={() => {}}
        loading={false}
        errors={{}}
      />
    );

    component.find('Form').simulate('submit');
    expect(onSubmit.callCount).to.equal(1);
  });
});
