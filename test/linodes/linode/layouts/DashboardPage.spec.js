import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';
import { testLinode } from '@/data/linodes';
import { DashboardPage } from '~/linodes/linode/layouts/DashboardPage';
import * as IndexPage from '~/linodes/linode/layouts/IndexPage';
import moment from 'moment';

describe('linodes/linode/layouts/DashboardPage', async () => {
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
        group: '',
        backups: {
          last_backup: '2016-06-28T14:19:37',
          enabled: true,
        },
      },
      1236: {
        ...testLinode,
        id: 1236,
        distribution: null,
        group: '',
        backups: {
          last_backup: '2016-06-28T14:19:37',
          enabled: true,
        },
        services: [],
      },
    },
    _singular: 'linode',
    _plural: 'linodes',
  };
  const params = {
    linodeId: `${testLinode.id}`,
  };

  it('calls loadLinode on mount', async () => {
    const loadLinode = sinon.stub(IndexPage, 'loadLinode');
    const page = shallow(
      <DashboardPage
        linodes={linodes}
        params={params}
      />
    );
    await page.instance().componentDidMount();
    expect(loadLinode.calledOnce).to.equal(true);
    loadLinode.restore();
  });

  it('renders public ipv4', () => {
    const ipv4 = testLinode.ipv4.address;
    const page = mount(
      <DashboardPage
        linodes={linodes}
        params={params}
      />);

    expect(page.contains(<li> {ipv4} </li>)).to.equal(true);
  });

  it('renders public ipv6', () => {
    const ipv6 = testLinode.ipv6.range;
    const page = mount(
      <DashboardPage
        linodes={linodes}
        params={params}
      />);

    expect(page.contains(<li> {ipv6} </li>)).to.equal(true);
  });

  it('renders backups not enabled', () => {
    const path = `/linodes/${testLinode.id}/backups`;
    const page = shallow(
      <DashboardPage
        linodes={{ ...linodes,
          linodes: {
            ...linodes.linodes,
            [testLinode.id]: {
              ...testLinode,
              backups: { enabled: false },
            },
          } }}
        params={params}
      />);

    expect(page.find('.linode-backups').at(0)
      .find('.col-sm-8')
      .at(0)
      .find('Link')
      .props())
      .have.property('to')
      .which.equal(path);
  });

  it('renders backups enabled', () => {
    const backupTime = linodes.linodes[1235].backups.last_backup;
    const page = shallow(
      <DashboardPage
        linodes={linodes}
        params={{ linodeId: '1235' }}
      />);

    expect(page.find('.backup-status')
      .text()).to.equal(`Taken ${moment(backupTime).fromNow()}`);
  });

  it('renders plan', () => {
    const page = shallow(
      <DashboardPage
        linodes={linodes}
        params={params}
      />);

    expect(page.find('.linode-plan').at(0)
      .find('.col-sm-8')
      .at(0)
      .text()).to.equal('Linode 2G');
  });

  it('renders linode without a linode service', () => {
    const page = shallow(
      <DashboardPage
        linodes={linodes}
        params={{ linodeId: '1236' }}
      />);

    expect(page.find('.linode-plan').length).to.equal(0);
  });

  it('renders datacenter', () => {
    const page = shallow(
      <DashboardPage
        linodes={linodes}
        params={params}
      />);

    expect(page.find('.linode-datacenter').at(0)
      .find('.col-sm-8')
      .at(0)
      .text()).to.equal(testLinode.datacenter.label);
  });

  it('renders distribution', () => {
    const page = shallow(
      <DashboardPage
        linodes={linodes}
        params={params}
      />);

    expect(page.find('.linode-distro').at(0)
      .find('.col-sm-8')
      .at(0)
      .text()).to.equal(testLinode.distribution.vendor);
  });

  it('renders unknown distribution', () => {
    const page = shallow(
      <DashboardPage
        linodes={linodes}
        params={{ linodeId: '1236' }}
      />);

    expect(page.find('.linode-distro').at(0)
      .find('.col-sm-8')
      .at(0)
      .text()).to.equal('Unknown');
  });

  it('renders ssh input elements', () => {
    const page = shallow(
      <DashboardPage
        linodes={linodes}
        params={params}
      />);

    expect(page.find('.input-group').at(0).find('input')).to.exist;
    expect(page.find('.input-group').at(0).find('button')).to.exist;
  });

  it('renders shh path', () => {
    const ipv4 = testLinode.ipv4.address;
    const sshPath = `ssh root@${ipv4}`;
    const page = shallow(
      <DashboardPage
        linodes={linodes}
        params={params}
      />);

    expect(page.find('#ssh-input').props())
      .to.have.property('value')
      .to.equal(sshPath);
  });

  it('renders lish input elements', () => {
    const page = shallow(
      <DashboardPage
        linodes={linodes}
        params={params}
      />);

    expect(page.find('.input-group').at(1).find('input')).to.exist;
    expect(page.find('.input-group').at(1).find('button')
      .at(0)).to.exist;
    expect(page.find('.input-group').at(1).find('button')
      .at(1)).to.exist;
  });

  it('renders lish path', () => {
    const lishLink = `ssh -t tdude@lish-${
        testLinode.datacenter.id
      }.linode.com`;
    const page = shallow(
      <DashboardPage
        linodes={linodes}
        params={params}
        username="tdude"
      />);

    expect(page.find('#lish-input').props())
      .to.have.property('value')
      .to.equal(lishLink);
  });

  it('renders glish button element', () => {
    const page = shallow(
      <DashboardPage
        linodes={linodes}
        params={params}
      />);

    expect(page.find('#glish-button')).to.exist;
  });

  describe('performance graph', () => {
    it('renders source options', () => {
      const page = shallow(
        <DashboardPage
          linodes={linodes}
          params={params}
        />);


      const sourceInput = page.find('.select-source');
      expect(sourceInput.find('option').length).to.equal(4);
    });

    it('renders range options', () => {
      const page = shallow(
        <DashboardPage
          linodes={linodes}
          params={params}
        />);

      const rangeInput = page.find('.select-range');
      expect(rangeInput.find('option').length).to.equal(3);
    });

    it('changes source on change', () => {
      const page = shallow(
        <DashboardPage
          linodes={linodes}
          params={params}
        />);

      const sourceInput = page.find('.select-source');
      sourceInput.simulate('change', { target: { value: 'disk' } });
      expect(page.state('source')).to.equal('disk');
    });

    it('changes range on change', () => {
      const page = shallow(
        <DashboardPage
          linodes={linodes}
          params={params}
        />);

      const rangeInput = page.find('.select-range');
      rangeInput.simulate('change', { target: { value: 'last2day' } });
      expect(page.state('range')).to.equal('last2day');
    });

    it('renders the chart', () => {
      const page = shallow(
        <DashboardPage
          linodes={linodes}
          params={params}
        />);

      expect(page.find('ResponsiveLineChart')).to.exist;
    });
  });
});
