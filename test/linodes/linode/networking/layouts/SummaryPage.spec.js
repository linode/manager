import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { SHOW_MODAL } from '~/actions/modal';
import { SummaryPage } from '~/linodes/linode/networking/layouts/SummaryPage';

import { expectRequest } from '@/common';
import { testLinode } from '@/data/linodes';


describe('linodes/linode/networking/layouts/SummaryPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  const ipv4s = Object.values(testLinode._ips).filter(
    ip => ip.version === 'ipv4');
  const ipv6s = Object.values(testLinode._ips).filter(
    ip => ip.version === 'ipv6');

  it('renders ipv4 addresses', function () {
    const page = mount(
      <SummaryPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );

    const rows = page.find('Table').at(0).find('tbody tr');

    expect(rows.length).to.equal(ipv4s.length);

    rows.forEach(function (row) {
      const columns = row.find('td');

      const address = columns.at(0).text();
      const ip = testLinode._ips[address];

      expect(columns.at(1).text()).to.equal(ip.rdns);
      expect(columns.at(2).text().toLowerCase()).to.equal(ip.type);
    });
  });

  it('renders ipv6 addresses', function () {
    const page = mount(
      <SummaryPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );

    const rows = page.find('Table').at(1).find('tbody tr');

    expect(rows.length).to.equal(ipv6s.length);

    rows.forEach(function (row) {
      const columns = row.find('td');

      const address = columns.at(0).text();
      const ip = testLinode._ips[address.split('/')[0].trim()];

      expect(columns.at(1).text()).to.equal(ip.rdns || '');
      expect(columns.at(2).text().toLowerCase()).to.equal(ip.type);
    });
  });

  it('opens the add modal on click if has private IP', function () {
    const page = mount(
      <SummaryPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );

    dispatch.reset();
    const button = page.find('PrimaryButton');

    expect(button.props().options.length).to.equal(0);

    button.props().onClick();
    expect(dispatch.callCount).to.equal(1);
    expect(dispatch.firstCall.args[0].type, SHOW_MODAL);
    expect(dispatch.firstCall.args[0].title, 'Add a Public IP Address');
  });

  it('adds a private IP on click if doesnt exist', function () {
    const page = mount(
      <SummaryPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );

    dispatch.reset();
    const button = page.find('PrimaryButton');

    expect(button.props().options.length).to.equal(0);

    button.props().onClick();
    expect(dispatch.callCount).to.equal(1);
    expectRequest(dispatch.firstCall.args[0], `/linode/instances/${testLinode.id}/ips`, {
      method: 'POST',
      body: { type: 'private' },
    });
  });

  it('opens the more info modal on click', function () {
    const page = mount(
      <SummaryPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );

    dispatch.reset();
    page.find('#more-info').at(0).props()
        .onClick();
    expect(dispatch.callCount).to.equal(1);
    expect(dispatch.firstCall.args[0].type, SHOW_MODAL);
  });

  it('opens the edit rdns modal on click', function () {
    const page = mount(
      <SummaryPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );

    dispatch.reset();
    page.find('#edit-rdns').at(0).props()
        .onMouseDown();
    expect(dispatch.callCount).to.equal(1);
    expect(dispatch.firstCall.args[0].type, SHOW_MODAL);
  });

  it('triggers reset rdns on click', function () {
    const page = mount(
      <SummaryPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );

    dispatch.reset();
    page.find('#reset-rdns').at(0).props()
        .onMouseDown();
    expect(dispatch.callCount).to.equal(1);
    expect(dispatch.firstCall.args[0].type, SHOW_MODAL);
  });
});
