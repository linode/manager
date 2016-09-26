import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { testLinode } from '@/data/linodes';
import { NetworkingPage } from '~/linodes/linode/layouts/NetworkingPage';
import { ipv4ns, ipv6ns, ipv6nsSuffix } from '~/constants';

describe('linodes/linode/layouts/NetworkingPage', () => {
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
      1235: {
        ...testLinode,
        id: 1235,
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
    it('renders add public ip button', async () => {
      const page = shallow(
        <NetworkingPage
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
          <NetworkingPage
            linodes={linodes}
            params={params}
          />);

        expect(page.find('HelpButton').at(0).props())
          .to.have.property('to')
          .which.equals(path);
      });

      it('renders address ip and url', async () => {
        const ipv4 = testLinode.ipv4.address;
        const inet = `${ipv4}/24 ( ${testLinode.ipv4.rdns} )`;
        const page = shallow(
          <NetworkingPage
            linodes={linodes}
            params={params}
          />);

        const content = page.find('section').at(0);
        const ipv4Sect = content.find('.col-sm-6').at(0);
        const inetCol = ipv4Sect.find('.col-sm-8').at(0);
        expect(inetCol.text()).to.equal(inet);
      });

      it('renders gateway', async () => {
        const ipv4 = testLinode.ipv4.address;
        const gateway = `${ipv4.substring(0, ipv4.lastIndexOf('.'))}.1`;
        const page = shallow(
          <NetworkingPage
            linodes={linodes}
            params={params}
          />);

        const content = page.find('section').at(0);
        const ipv4Sect = content.find('.col-sm-6').at(0);
        const gatewayCol = ipv4Sect.find('.col-sm-8').at(1);
        expect(gatewayCol.text()).to.equal(gateway);
      });

      it('renders nameservers', async () => {
        const page = shallow(
          <NetworkingPage
            linodes={linodes}
            params={params}
          />);

        const content = page.find('section').at(0);
        const ipv4Sect = content.find('.col-sm-6').at(0);
        const nsCol = ipv4Sect.find('.col-sm-8').at(2);
        expect(nsCol.text()).to.equal(ipv4ns[testLinode.datacenter.id].join(''));
      });
    });

    describe('IPv6', () => {
      it('renders help button', async () => {
        const path = 'https://www.linode.com/docs/networking/native-ipv6-networking';
        const page = shallow(
          <NetworkingPage
            linodes={linodes}
            params={params}
          />);

        expect(page.find('HelpButton').at(1).props())
          .to.have.property('to')
          .which.equals(path);
      });

      it('renders address ip', async () => {
        const ipv6 = testLinode.ipv6.range;
        const page = shallow(
          <NetworkingPage
            linodes={linodes}
            params={params}
          />);

        const content = page.find('section').at(0);
        const ipv6Sect = content.find('.col-sm-6').at(1);
        const inetCol = ipv6Sect.find('.col-sm-8').at(0);
        expect(inetCol.text()).to.equal(`${ipv6}`);
      });

      it('renders gateway');

      it('renders nameservers', async () => {
        const page = shallow(
          <NetworkingPage
            linodes={linodes}
            params={params}
          />);

        const content = page.find('section').at(0);
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
    it('renders add private ip button', async () => {
      const page = shallow(
        <NetworkingPage
          linodes={linodes}
          params={params}
        />);

      const button = page.find('section').at(1).find('header .btn');
      expect(button.text()).to.equal('Add private IP address');
    });

    it('renders no private ips', async () => {
      const page = shallow(
        <NetworkingPage
          linodes={linodes}
          params={{ linodeId: 1235 }}
        />);

      const content = page.find('section').at(1);
      const noIP = content.find('.form-group').at(0);
      expect(noIP.text()).to.equal('No private IP addresses.');
    });

    it('renders private ips');

    it('renders link-local');
  });
});
