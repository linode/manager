import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { push } from 'react-router-redux';

import { IndexPage } from '~/dnszones/layouts/IndexPage';
import { api, freshState } from '@/data';
import { SHOW_MODAL } from '~/actions/modal';

const { dnszones } = api;

describe('dnszones/layouts/IndexPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('redirects to /dnszones/create when you have no DNS Zones', async () => {
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        selected={{}}
        dnszones={{
          ...freshState.api.dnszones,
          totalPages: 1,
        }}
      />);
    await page.instance().componentDidMount();
    expect(dispatch.calledWith(push('/dnszones/create')))
      .to.equal(true);
  });

  it('renders a list of DNS Zones', () => {
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        selected={{}}
        dnszones={dnszones}
      />
    );

    const table = page.find('table');
    expect(table.length).to.equal(1);
    expect(table.find('tbody tr').length).to.equal(
      Object.keys(dnszones.dnszones).length);
  });

  it('shows the delete modal when delete is pressed', () => {
    const page = shallow(
      <IndexPage
        dispatch={dispatch}
        selected={{}}
        dnszones={dnszones}
      />
    );

    const zoneDelete = page.find('table tbody tr a').at(1);
    zoneDelete.simulate('click');
    expect(dispatch.calledOnce).to.equal(true);
    expect(dispatch.firstCall.args[0])
      .to.have.property('type').which.equals(SHOW_MODAL);
  });
});
