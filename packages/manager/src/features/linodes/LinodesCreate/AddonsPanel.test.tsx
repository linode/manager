import React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { AddonsPanel, AddonsPanelProps } from './AddonsPanel';

const props: AddonsPanelProps = {
  accountBackups: true,
  backups: false,
  changeBackups: jest.fn(),
  togglePrivateIP: jest.fn(),
  disabled: false,
  vlanLabel: 'abc',
  labelError: 'testError',
  ipamAddress: 'ipadAddress',
  ipamError: 'test ipad error',
  handleVLANChange: jest.fn(),
  isPrivateIPChecked: false,
  selectedLinodeID: 45329311,
  selectedRegionID: '1234',
  selectedImageID: '1234',
  selectedTypeID: '12345',
  createType: 'fromLinode',
  linodesData: [
    {
      id: 44071363,
      label: 'test_instance',
      group: '',
      status: 'running',
      created: '2023-03-18T04:41:27',
      updated: '2023-03-18T04:45:17',
      type: 'g6-standard-1',
      ipv4: ['45.56.75.98'],
      ipv6: '2600:3c00::f03c:93ff:fe85:576d/128',
      image: 'linode/ubuntu18.04',
      region: 'us-central',
      specs: {
        disk: 51200,
        memory: 2048,
        vcpus: 1,
        gpus: 0,
        transfer: 2000,
      },
      alerts: {
        cpu: 90,
        network_in: 10,
        network_out: 10,
        transfer_quota: 80,
        io: 10000,
      },
      backups: {
        enabled: true,
        schedule: {
          day: 'Scheduling',
          window: 'Scheduling',
        },
        last_successful: '2023-04-20T08:28:33',
      },
      hypervisor: 'kvm',
      watchdog_enabled: true,
      tags: [],
    },
    {
      id: 45329311,
      label: 'debian-ca-central',
      group: '',
      status: 'running',
      created: '2023-04-20T16:10:32',
      updated: '2023-04-20T16:11:06',
      type: 'g6-nanode-1',
      ipv4: ['192.168.139.183', '139.144.17.202'],
      ipv6: '2600:3c04::f03c:93ff:fe75:0612/128',
      image: 'linode/debian11',
      region: 'ca-central',
      specs: {
        disk: 25600,
        memory: 1024,
        vcpus: 1,
        gpus: 0,
        transfer: 1000,
      },
      alerts: {
        cpu: 90,
        network_in: 10,
        network_out: 10,
        transfer_quota: 80,
        io: 10000,
      },
      backups: {
        enabled: true,

        schedule: {
          day: 'Scheduling',
          window: 'Scheduling',
        },
        last_successful: null,
      },
      hypervisor: 'kvm',
      watchdog_enabled: true,
      tags: [],
    },
    {
      id: 45332614,
      label: 'almalinux-us-west',
      group: '',
      status: 'running',
      created: '2023-04-20T17:35:32',
      updated: '2023-04-20T17:40:33',
      type: 'g6-nanode-1',
      ipv4: ['45.79.74.95'],
      ipv6: '2600:3c01::f03c:93ff:fe75:e4f9/128',
      image: 'linode/almalinux8',
      region: 'us-west',
      specs: {
        disk: 25600,
        memory: 1024,
        vcpus: 1,
        gpus: 0,
        transfer: 1000,
      },
      alerts: {
        cpu: 90,
        network_in: 10,
        network_out: 10,
        transfer_quota: 80,
        io: 10000,
      },
      backups: {
        enabled: true,
        schedule: {
          day: 'Scheduling',
          window: 'Scheduling',
        },
        last_successful: null,
      },
      hypervisor: 'kvm',
      watchdog_enabled: true,
      tags: [],
    },
  ],
};

describe('AddonsPanel', () => {
  it('should render AddonsPanel', () => {
    renderWithTheme(<AddonsPanel {...props} />);
  });

  it('Should trigger changePrivateIP if source linode has been allocated a private IP', () => {
    renderWithTheme(<AddonsPanel {...props} />);

    expect(props.togglePrivateIP).toBeCalled();
  });
  it('Should select Private IP checkbox if source linode has been allocated a private IP', () => {
    const addOnProps = { ...props, isPrivateIPChecked: true };
    const { getByTestId } = renderWithTheme(<AddonsPanel {...addOnProps} />);
    const PrivateIpAddress = getByTestId('private_ip');
    expect(
      (PrivateIpAddress?.firstElementChild as HTMLInputElement)?.checked
    ).toBe(true);
  });
});
