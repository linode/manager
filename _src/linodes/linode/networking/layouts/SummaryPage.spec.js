import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';

import { SHOW_MODAL } from '~/actions/modal';
import { SummaryPage } from '~/linodes/linode/networking/layouts/SummaryPage';

import { expectRequest } from '~/test.helpers';
import { testLinode, testLinode1247 } from '~/data/linodes';


describe('linodes/linode/networking/layouts/SummaryPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  const ipv4s = Object.values(testLinode._ips).filter(
    ip => ip.type === 'ipv4');
  const ipv6s = Object.values(testLinode._ips).filter(
    ip => ip.type === 'ipv6');

  it.skip('renders ipv4 addresses', function () {
    const page = mount(
      <SummaryPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );

    const rows = page.find('Table').at(0).find('tbody tr');

    expect(rows.length).toBe(ipv4s.length);

    rows.forEach(function (row) {
      const columns = row.find('td');

      const address = columns.at(0).text();
      const ip = testLinode._ips[address];

      expect(columns.at(1).text()).toBe(ip.rdns);
      expect(columns.at(2).text().toLowerCase()).toBe(ip.key);
    });
  });

  it.skip('renders ipv6 addresses', function () {
    const page = mount(
      <SummaryPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );

    const rows = page.find('Table').at(1).find('tbody tr');

    expect(rows.length).toBe(ipv6s.length);

    rows.forEach(function (row) {
      const columns = row.find('td');

      const address = columns.at(0).text();
      const ip = testLinode._ips[address.split.skip('/')[0].trim()];

      expect(columns.at(1).text()).toBe(ip.rdns || '');
      expect(columns.at(2).text().toLowerCase()).toBe(ip.key);
    });
  });

  it.skip('opens the add modal on click if has private IP', function () {
    const page = mount(
      <SummaryPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );

    dispatch.reset();
    const button = page.find('PrimaryButton');

    expect(button.props().options.length).toBe(0);

    button.props().onClick();
    expect(dispatch.callCount).toBe(1);
    expect(dispatch.firstCall.args[0].type, SHOW_MODAL);
    expect(dispatch.firstCall.args[0].title, 'Add a Public IP Address');
  });

  it.skip('adds a private IP on click if doesnt exist', function () {
    const page = mount(
      <SummaryPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );

    dispatch.reset();
    const button = page.find('PrimaryButton');

    expect(button.props().options.length).toBe(0);

    button.props().onClick();
    expect(dispatch.callCount).toBe(1);
    expectRequest(dispatch.firstCall.args[0], `/linode/instances/${testLinode.id}/ips`, {
      method: 'POST',
      body: { type: 'private' },
    });
  });

  it.skip('opens the more info modal on click', function () {
    const page = mount(
      <SummaryPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );

    dispatch.reset();
    page.find('#more-info').at(0).props()
      .onClick();
    expect(dispatch.callCount).toBe(1);
    expect(dispatch.firstCall.args[0].type, SHOW_MODAL);
  });

  it.skip('opens the edit rdns modal on click', function () {
    const page = mount(
      <SummaryPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );

    dispatch.reset();
    page.find('#edit-rdns').at(0).props()
      .onMouseDown();
    expect(dispatch.callCount).toBe(1);
    expect(dispatch.firstCall.args[0].type, SHOW_MODAL);
  });

  it.skip('triggers reset rdns on click', function () {
    const page = mount(
      <SummaryPage
        dispatch={dispatch}
        linode={testLinode1247}
      />
    );
    dispatch.reset();
    page.find('#reset-rdns').at(0).props()
      .onMouseDown();
    expect(dispatch.callCount).toBe(1);
    expect(dispatch.firstCall.args[0].type, SHOW_MODAL);
  });

  it.skip('hides reset rdns on click if members.linode.com', function () {
    const page = mount(
      <SummaryPage
        dispatch={dispatch}
        linode={testLinode}
      />
    );

    expect(page.find('#reset-rdns')).to.have.length(0);
  });
});
