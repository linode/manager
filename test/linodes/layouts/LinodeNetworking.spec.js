import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { testLinode } from '@/data/linodes';
import { LinodeNetworking } from '~/linodes/layouts/LinodeNetworking';
import { ipv4ns, ipv6ns, ipv6nsSuffix } from '~/constants';

describe('linodes/layouts/LinodeNetworking', () => {
  const sandbox = sinon.sandbox.create();
  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  const linodes = {
    pagesFetched: [0],
    totalPages: 1,
    linodes: {
      [testLinode.id]: testLinode,
      linode_1235: {
        ...testLinode,
        id: 'linode_1235',
        datacenter: {
          id: 'newark',
        },
        group: '',
        ips: {
          public: {
            ipv4: [
              '123.456.789.1',
              '123.456.789.2',
              '123.456.789.3',
            ],
            ipv6: '2600:3c03::f03c:91ff:fe96:0f13',
          },
          private: {
            ipv4: [],
            link_local: 'fe80::f03c:91ff:fe96:0f13',
          },
        },
      },
    },
    _singular: 'linode',
    _plural: 'linodes',
  };
  const params = {
    linodeId: testLinode.id,
  };

  describe('public network', () => {
    it('renders add ip button', async () => {
      const page = shallow(
        <LinodeNetworking
          linodes={linodes}
          params={params}
        />);

      const content = page.find('.col-xl-12').at(0);
      const button = content.find('button').at(0);
      expect(button.text()).to.equal('Add IP address');
    });

    describe('IPv4', () => {
      it('renders help button', async () => {
        const path = 'https://www.linode.com/docs/networking/linux-static-ip-configuration';
        const page = shallow(
          <LinodeNetworking
            linodes={linodes}
            params={params}
          />);

        expect(page.find('HelpButton').at(0).props())
          .to.have.property('to')
          .which.equals(path);
      });

      it('renders inet ip and url', async () => {
        const ipv4 = testLinode.ips['public'].ipv4[0];
        const inet = `${ipv4} / 24 ( li-${ipv4.split('.')[3]}.members.linode.com )`;
        const page = shallow(
          <LinodeNetworking
            linodes={linodes}
            params={params}
          />);

        const content = page.find('.network-content').at(0);
        const ipv4Sect = content.find('.col-sm-6').at(0);
        const inetCol = ipv4Sect.find('.col-sm-8').at(0);
        expect(inetCol.text()).to.equal(inet);
      });

      it('renders gateway', async () => {
        const ipv4 = testLinode.ips['public'].ipv4[0];
        const gateway = `${ipv4.substring(0, ipv4.lastIndexOf('.'))}.1`;
        const page = shallow(
          <LinodeNetworking
            linodes={linodes}
            params={params}
          />);

        const content = page.find('.network-content').at(0);
        const ipv4Sect = content.find('.col-sm-6').at(0);
        const gatewayCol = ipv4Sect.find('.col-sm-8').at(1);
        expect(gatewayCol.text()).to.equal(gateway);
      });

      it('renders nameservers', async () => {
        const page = shallow(
          <LinodeNetworking
            linodes={linodes}
            params={params}
          />);

        const content = page.find('.network-content').at(0);
        const ipv4Sect = content.find('.col-sm-6').at(0);
        const nsCol = ipv4Sect.find('.col-sm-8').at(2);
        expect(nsCol.text()).to.equal(ipv4ns[testLinode.datacenter.id].join(''));
      });
    });

    describe('IPv6', () => {
      it('renders help button', async () => {
        const path = 'https://www.linode.com/docs/networking/native-ipv6-networking';
        const page = shallow(
          <LinodeNetworking
            linodes={linodes}
            params={params}
          />);

        expect(page.find('HelpButton').at(1).props())
          .to.have.property('to')
          .which.equals(path);
      });

      it('renders inet ip', async () => {
        const ipv6 = testLinode.ips['public'].ipv6;
        const page = shallow(
          <LinodeNetworking
            linodes={linodes}
            params={params}
          />);

        const content = page.find('.network-content').at(0);
        const ipv6Sect = content.find('.col-sm-6').at(1);
        const inetCol = ipv6Sect.find('.col-sm-8').at(0);
        expect(inetCol.text()).to.equal(`${ipv6} / 64`);
      });

      it('renders gateway', async () => {
        const page = shallow(
          <LinodeNetworking
            linodes={linodes}
            params={params}
          />);

        const content = page.find('.network-content').at(0);
        const ipv6Sect = content.find('.col-sm-6').at(1);
        const gatewayCol = ipv6Sect.find('.col-sm-8').at(1);
        expect(gatewayCol.text())
          .to.equal(`${testLinode.ips['private'].link_local.split(':')[0]}::1`);
      });

      it('renders nameservers', async () => {
        const page = shallow(
          <LinodeNetworking
            linodes={linodes}
            params={params}
          />);

        const content = page.find('.network-content').at(0);
        const ipv6Sect = content.find('.col-sm-6').at(1);
        const nsCol = ipv6Sect.find('.col-sm-8').at(2);
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
    it('renders help button', async () => {
      const path = 'https://www.linode.com/docs/networking/linux-static-ip-configuration';
      const page = shallow(
        <LinodeNetworking
          linodes={linodes}
          params={params}
        />);

      expect(page.find('HelpButton').at(2).props())
        .to.have.property('to')
        .which.equals(path);
    });

    it('renders add ip button', async () => {
      const page = shallow(
        <LinodeNetworking
          linodes={linodes}
          params={params}
        />);

      const content = page.find('.col-xl-12').at(0);
      const button = content.find('button').at(1);
      expect(button.text()).to.equal('Add IP address');
    });

    it('renders no private ips', async () => {
      const page = shallow(
        <LinodeNetworking
          linodes={linodes}
          params={{ linodeId: 'linode_1235' }}
        />);

      const content = page.find('.network-content').at(1);
      const noIP = content.find('.row').at(1);
      expect(noIP.text()).to.equal('No private IP addresses.');
    });

    it('renders private ips', async () => {
      const ipv4 = testLinode.ips['private'].ipv4[0];
      const page = shallow(
        <LinodeNetworking
          linodes={linodes}
          params={params}
        />);

      const content = page.find('.network-content').at(1);
      const privIP = content.find('.col-sm-8').at(0);
      expect(privIP.text()).to.equal(`${ipv4} / 17`);
    });

    it('renders link-local', async () => {
      const page = shallow(
        <LinodeNetworking
          linodes={linodes}
          params={params}
        />);

      const content = page.find('.network-content').at(1);
      const localLinkRow = content.find('.row').at(2);
      const localLinkCol = localLinkRow.find('.col-sm-8').at(0);
      expect(localLinkCol.text())
        .to.equal(testLinode.ips['private'].link_local);
    });
  });
});
