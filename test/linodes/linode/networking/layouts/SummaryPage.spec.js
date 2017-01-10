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

  describe('public network', () => {
    it('renders add public ip button', async () => {
      const page = shallow(
        <SummaryPage
          linodes={linodes}
          params={params}
        />);

      const button = page.find('section').at(0).find('header .btn');
      expect(button.text()).to.equal('Add public IP address');
    });

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
        const ipv4 = testLinode.ipv4;
        const inet = `${ipv4} (li1-1.members.linode.com)`;
        const page = shallow(
          <SummaryPage
            linodes={linodes}
            params={params}
          />);

        const content = page.find('section').at(0);
        const ipv4Sect = content.find('.col-sm-6').at(0);
        const inetCol = ipv4Sect.find('.col-sm-9').at(0);
        expect(inetCol.text()).to.equal(inet);
      });

      it('renders gateway', async () => {
        const ipv4 = testLinode.ipv4;
        const gateway = `${ipv4.substring(0, ipv4.lastIndexOf('.'))}.1`;
        const page = shallow(
          <SummaryPage
            linodes={linodes}
            params={params}
          />);

        const content = page.find('section').at(0);
        const ipv4Sect = content.find('.col-sm-6').at(0);
        const gatewayCol = ipv4Sect.find('.col-sm-9').at(2);
        expect(gatewayCol.text()).to.equal(gateway);
      });

      it('renders nameservers', async () => {
        const page = shallow(
          <SummaryPage
            linodes={linodes}
            params={params}
          />);

        const content = page.find('section').at(0);
        const ipv4Sect = content.find('.col-sm-6').at(0);
        const nsCol = ipv4Sect.find('.col-sm-9').at(3);
        expect(nsCol.text()).to.equal(ipv4ns[testLinode.datacenter.id].join(''));
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

      it('renders address ip', async () => {
        const ipv6 = testLinode.ipv6;
        const page = shallow(
          <SummaryPage
            linodes={linodes}
            params={params}
          />);

        const content = page.find('section').at(0);
        const ipv6Sect = content.find('.col-sm-6').at(1);
        const inetCol = ipv6Sect.find('.col-sm-9').at(0);
        expect(inetCol.text()).to.equal(`${ipv6}`);
      });

      it('renders gateway');

      it('renders nameservers', async () => {
        const page = shallow(
          <SummaryPage
            linodes={linodes}
            params={params}
          />);

        const content = page.find('section').at(0);
        const ipv6Sect = content.find('.col-sm-6').at(1);
        const nsCol = ipv6Sect.find('.col-sm-9').at(2);
        expect(nsCol.text())
          .to.equal(
            ipv6nsSuffix.map(
              suffix => ipv6ns[testLinode.datacenter.id] + suffix
            ).join('')
          );
      });

      it('renders global pool');
    });
  });

  describe('private network', () => {
    it('renders add private ip button when no ipv4s are present', async () => {
      const page = shallow(
        <SummaryPage
          linodes={linodes}
          params={{ linodeLabel: 'test-linode-1245' }}
        />);

      const button = page.find(
        '.LinodesLinodeNetworkingSummaryPage-addPrivateIp');
      expect(button.text()).to.equal('Enable private IP address');
    });

    it('renders private ip', async () => {
      const page = shallow(
        <SummaryPage
          linodes={linodes}
          params={{ linodeLabel: 'test-linode' }}
        />);

      const p = page.find(
        '.LinodesLinodeNetworkingSummaryPage-privateIpv4 span');
      expect(p.length).to.equal(2);

      const privateIp = linodes.linodes[1234]._ips.ipv4.private[0];

      expect(p.at(0).text()).to.equal(`${privateIp.address}/17 `);
      expect(p.at(1).text()).to.equal(`(${privateIp.rdns})`);
    });

    it('renders link-local', async () => {
      const page = shallow(
        <SummaryPage
          linodes={linodes}
          params={{ linodeLabel: 'test-linode' }}
        />);

      const label = page.find('.LinodesLinodeNetworkingSummaryPage-linkLocal');
      expect(label.text()).to.equal(
        linodes.linodes[1234]._ips.ipv6_ranges['link-local']);
    });
  });
});
