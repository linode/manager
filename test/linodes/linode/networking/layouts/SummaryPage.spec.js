import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import { SummaryPage } from '~/linodes/linode/networking/layouts/SummaryPage';
import { ipv4ns, ipv6ns, ipv6nsSuffix } from '~/constants';
import { testLinode, testLinode1245 } from '@/data/linodes';

describe('linodes/linode/networking/layouts/SummaryPage', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  describe('IPv4', () => {
    it('renders help button', async () => {
      const path = 'https://www.linode.com/docs/networking/linux-static-ip-configuration';
      const page = shallow(
        <SummaryPage
          linode={testLinode}
        />);

      expect(page.find('HelpButton').at(0).props())
        .to.have.property('to')
        .which.equals(path);
    });

    it('renders address ip and url', async () => {
      const { ipv4 } = testLinode._ips;
      const page = shallow(
        <SummaryPage
          linode={testLinode}
        />);

      const ipv4Section = page.find('#publicIpv4 li');

      const { address, rdns } = ipv4.public[0];
      expect(ipv4Section.at(0).text()).to.equal(`${address}(${rdns})`);
    });

    it('renders gateway', async () => {
      const { ipv4 } = testLinode._ips;
      const page = shallow(
        <SummaryPage
          linode={testLinode}
        />);

      const gateway = page.find('#ipv4Gateway');
      expect(gateway.text()).to.equal(ipv4.public[0].gateway);
    });

    it('renders nameservers', async () => {
      const page = shallow(
        <SummaryPage
          linode={testLinode}
        />);

      const expectedNameservers = ipv4ns[testLinode.region.id];
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
          linode={testLinode}
        />);

      expect(page.find('HelpButton').at(1).props())
        .to.have.property('to')
        .which.equals(path);
    });

    it('renders slaac ip', async () => {
      const { ipv6 } = testLinode._ips;
      const page = shallow(
        <SummaryPage
          linode={testLinode}
        />);

      const slaac = page.find('#slaac');
      expect(slaac.text()).to.equal(`${ipv6.slaac.address} / ${ipv6.slaac.prefix}`);
    });

    /* TODO: add test when gateways are returned for ipv6 objects */
    it('renders gateway');

    it('renders nameservers', async () => {
      const page = shallow(
        <SummaryPage
          linode={testLinode}
        />);

      const expectedNameservers = ipv6nsSuffix.map(
        prefix => ipv6ns[testLinode.region.id] + prefix);
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
        linode={testLinode1245}
      />);

    const button = page.find('#addPrivateIp');
    expect(button.length).to.equal(1);
  });

  it('renders private ip', async () => {
    const page = shallow(
      <SummaryPage
        linode={testLinode}
      />);

    const li = page.find('#privateIpv4 li');
    const privateIp = testLinode._ips.ipv4.private[0];

    expect(li.at(0).text()).to.equal(`${privateIp.address}(${privateIp.rdns})`);
  });

  it('renders link_local', async () => {
    const page = shallow(
      <SummaryPage
        linode={testLinode}
      />);

    const li = page.find('#linkLocal li');
    expect(li.at(0).text()).to.equal(testLinode._ips.ipv6.link_local);
  });
});
