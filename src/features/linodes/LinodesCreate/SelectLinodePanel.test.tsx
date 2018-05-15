import * as React from 'react';
import { mount } from 'enzyme';

import SelectLinodePanel, { ExtendedLinode } from './SelectLinodePanel';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';

describe('SelectLinodePanel', () => {
  const testLinodes: ExtendedLinode[] = [
    {
      ipv4: [
        '192.168.213.172',
        '45.79.179.173',
      ],
      backups: {
        schedule: {
          window: 'blah',
          day: 'blah',
        },
        enabled: false,
      },
      ipv6: '2600:3c03::f03c:91ff:fe05:7758/64',
      specs: {
        transfer: 3000,
        memory: 4096,
        disk: 49152,
        vcpus: 2,
      },
      group: '',
      image: 'linode/centos7',
      region: 'us-east',
      id: 7843027,
      updated: '2018-05-04T15:04:41',
      hypervisor: 'kvm',
      type: 'g5-standard-2',
      label: 'marty_test',
      heading: 'marty_test',
      subHeadings: ['blah'],
      created: '2018-05-02T12:33:19',
      status: 'offline',
      alerts: {
        transfer_quota: 80,
        io: 10000,
        network_in: 10,
        network_out: 10,
        cpu: 90,
      },
    },
    {
      ipv4: [
        '45.79.156.70',
      ],
      backups: {
        schedule: {
          window: 'blah',
          day: 'blah',
        },
        enabled: false,
      },
      ipv6: '2600:3c03::f03c:91ff:fe05:54a7/64',
      specs: {
        transfer: 2000,
        memory: 2048,
        disk: 30720,
        vcpus: 1,
      },
      group: '',
      image: 'linode/centos7',
      region: 'us-east',
      id: 7843080,
      updated: '2018-05-04T14:58:15',
      hypervisor: 'kvm',
      type: 'g5-standard-1',
      label: 'linode7843080',
      heading: 'linode7843080',
      subHeadings: ['blah'],
      created: '2018-05-02T12:42:11',
      status: 'running',
      alerts: {
        transfer_quota: 80,
        io: 10000,
        network_in: 10,
        network_out: 10,
        cpu: 90,
      },
    },
  ];

  const dummyPropsNotCloneTarget = {
    linodes: testLinodes,
    isCloneTarget: false,
    handleSelection: jest.fn(),
  };

  const dummyPropsIsCloneTarget = {
    linodes: testLinodes,
    isCloneTarget: true,
    handleSelection: jest.fn(),
  };

  it('select Linode Panel must show all Linodes if isTarget prop is false', () => {
    const component = mount(
      <LinodeThemeWrapper>
        <SelectLinodePanel {...dummyPropsNotCloneTarget} />
      </LinodeThemeWrapper>,
    );

    const amountOfSelectionsRendered = component.find('SelectionCard').length;
    expect(amountOfSelectionsRendered).toBe(2);
  });

  it('select Linode Panel must show all Linodes and new option if isTarget prop is true', () => {
    const component = mount(
      <LinodeThemeWrapper>
        <SelectLinodePanel {...dummyPropsIsCloneTarget} />
      </LinodeThemeWrapper>,
    );

    const amountOfSelectionsRendered = component.find('SelectionCard').length;
    expect(amountOfSelectionsRendered).toBe(3);
  });
});
