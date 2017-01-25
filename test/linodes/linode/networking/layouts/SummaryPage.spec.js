import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import { SummaryPage } from '~/linodes/linode/networking/layouts/SummaryPage';
import { ipv4ns, ipv6ns, ipv6nsSuffix } from '~/constants';
import { testLinode } from '@/data/linodes';
import { state } from '@/data';

const { linodes } = state.api;

describe('linodes/linode/networking/layouts/SummaryPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  const params = {
    linodeLabel: testLinode.label,
  };

  describe('IPv4', () => {
    it('renders help button', async () => {
      const path = 'https://www.linode.com/docs/networking/linux-static-ip-configuration';
      const page = shallow(
        <SummaryPage
          linodes={linodes}
          params={params}
        />);

      expect(page.find('HelpButton').at(0).props())
        .to.have.property('to')
        .which.equals(path);
    });

    it('renders address ip and url', async () => {
      const { ipv4 } = testLinode._ips;
      const page = shallow(
        <SummaryPage
          linodes={linodes}
          params={params}
        />);

      const ipv4Section = page.find('#publicIpv4 li');

      const { address, rdns } = ipv4.public[0];
      expect(ipv4Section.at(0).text()).to.equal(`${address}(${rdns})`);
    });

    it('renders gateway', async () => {
      const { ipv4 } = testLinode._ips;
      const page = shallow(
        <SummaryPage
          linodes={linodes}
          params={params}
        />);

      const gateway = page.find('#ipv4Gateway');
      expect(gateway.text()).to.equal(ipv4.public[0].gateway);
    });

    it('renders nameservers', async () => {
      const page = shallow(
        <SummaryPage
          linodes={linodes}
          params={params}
        />);

      const expectedNameservers = ipv4ns[testLinode.datacenter.id];
      const nameservers = page.find('#ipv4Nameservers li');
      nameservers.map((nameserver, i) =>
        expect(nameserver.text()).to.equal(expectedNameservers[i]));
    });
  });

  describe('IPv6', () => {
    it('renders help button', async () => {
      const path = 'https://www.linode.com/docs/networking/native-ipv6-networking';
      const page = shallow(
        <SummaryPage
          linodes={linodes}
          params={params}
        />);

      expect(page.find('HelpButton').at(1).props())
        .to.have.property('to')
        .which.equals(path);
    });

    it('renders slaac ip', async () => {
      const { ipv6 } = testLinode._ips;
      const page = shallow(
        <SummaryPage
          linodes={linodes}
          params={params}
        />);

      const slaac = page.find('#slaac');
      expect(slaac.text()).to.equal(`${ipv6.slaac} / 64`);
    });

    /* TODO: add test when gateways are returned for ipv6 objects */
    it('renders gateway');

    it('renders nameservers', async () => {
      const page = shallow(
        <SummaryPage
          linodes={linodes}
          params={params}
        />);

      const expectedNameservers = ipv6nsSuffix.map(
        suffix => ipv6ns[testLinode.datacenter.id] + suffix);
      const nameservers = page.find('#ipv6Nameservers li');
      nameservers.map((nameserver, i) =>
        expect(nameserver.text()).to.equal(expectedNameservers[i]));
    });

    /* TODO: add tests when we render global pools */
    it('renders global pool');
  });

  it('renders add private ip button when no ipv4s are present', async () => {
    const page = shallow(
      <SummaryPage
        linodes={linodes}
        params={{ linodeLabel: 'test-linode-1245' }}
      />);

    const button = page.find('#addPrivateIp');
    expect(button.length).to.equal(1);
  });

  it('renders private ip', async () => {
    const page = shallow(
      <SummaryPage
        linodes={linodes}
        params={{ linodeLabel: 'test-linode' }}
      />);

    const li = page.find('#privateIpv4 li');
    const privateIp = linodes.linodes[1234]._ips.ipv4.private[0];

    expect(li.at(0).text()).to.equal(`${privateIp.address}(${privateIp.rdns})`);
  });

  it('renders link-local', async () => {
    const page = shallow(
      <SummaryPage
        linodes={linodes}
        params={{ linodeLabel: 'test-linode' }}
      />);

    const li = page.find('#linkLocal li');
    expect(li.at(0).text()).to.equal(linodes.linodes[1234]._ips.ipv6['link-local']);
  });
});
