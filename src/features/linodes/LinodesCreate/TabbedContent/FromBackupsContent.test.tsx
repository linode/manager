import * as React from 'react';
import { shallow } from 'enzyme';
import { FromBackupsContent } from './FromBackupsContent';

const mockProps = {
  updateFormState: jest.fn(),
  selectedLinodeID: 1,
  selectedBackupID: 1,
  selectedDiskSize: 100,
  selectedTypeID: '100',
  linodes: [],
  types: [],
  label: 'test',
  backups: true,
  privateIP: true,
  extendLinodes: jest.fn(),
  getBackupsMonthlyPrice: jest.fn(),
};

const mockPropsWithNotice = {
  notice: {
    text: 'example text',
    level: 'warning' as 'warning' | 'error',
  },
  updateFormState: jest.fn(),
  selectedLinodeID: 1,
  selectedBackupID: 1,
  selectedDiskSize: 100,
  selectedTypeID: '100',
  linodes: [],
  types: [],
  label: 'test',
  backups: true,
  privateIP: true,
  extendLinodes: jest.fn(),
  getBackupsMonthlyPrice: jest.fn(),
};

const mockLinodesWithBackups = {
  label: 'fromnanoooooooode',
  ipv4: [
    '45.79.8.50',
    '192.168.211.88',
  ],
  updated: '2018-06-05T16:20:08',
  ipv6: '2600:3c00::f03c:91ff:fed8:fd36/64',
  image: null,
  specs: {
    disk: 81920,
    memory: 4096,
    transfer: 4000,
    vcpus: 2,
  },
  type: 'g6-standard-2',
  hypervisor: 'kvm',
  region: 'us-central',
  backups: {
    enabled: true,
    schedule: {
      day: 'Scheduling',
      window: 'Scheduling',
    },
  },
  id: 8284376,
  alerts: {
    network_in: 10,
    transfer_quota: 80,
    io: 10000,
    network_out: 10,
    cpu: 90,
  },
  status: 'offline',
  group: '',
  created: '2018-06-05T16:15:03',
  currentBackups: {
    automatic: [
      {
        updated: '2018-06-06T00:29:07',
        id: 94825693,
        configs: [
          'Restore 121454 - My Arch Linux Disk Profile',
        ],
        finished: '2018-06-06T00:25:25',
        disks: [
          {
            size: 1753,
            label: 'Restore 121454 - Arch Linux Disk',
            filesystem: 'ext4',
          },
          {
            size: 0,
            label: 'Restore 121454 - 512 MB Swap Image'
            , filesystem: 'swap',
          },
        ],
        created: '2018-06-06T00:23:17',
        region: 'us-central',
        label: null,
        type: 'auto',
        status: 'successful',
      }],
    snapshot: {
      in_progress: null,
      current: {
        updated: '2018-06-05T16:32:12',
        id: 94805928,
        configs: [
          'Restore 121454 - My Arch Linux Disk Profile',
        ],
        finished: '2018-06-05T16:32:12',
        disks: [
          {
            size: 1753,
            label: 'Restore 121454 - Arch Linux Disk',
            filesystem: 'ext4',
          },
          {
            size: 0,
            label: 'Restore 121454 - 512 MB Swap Image',
            filesystem: 'swap',
          },
        ],
        created: '2018-06-05T16:29:15',
        region: 'us-central',
        label: 'testing',
        type: 'snapshot',
        status: 'successful',
      },
    },
  },
};

describe('FromBackupsContent', () => {
  const component = shallow(
    <FromBackupsContent
      classes={{ root: '' }}
      {...mockProps}
    />,
  );

  const componentWithNotice = shallow(
    <FromBackupsContent
      classes={{ root: '' }}
      {...mockPropsWithNotice}
    />,
  );

  component.setState({ isGettingBackups: false }); // get rid of loading state
  componentWithNotice.setState({ isGettingBackups: false }); // get rid of loading state

  it('should render Placeholder if no valid backups exist', () => {
    expect(component.find('WithStyles(Placeholder)')).toHaveLength(1);
  });

  describe('FromBackupsContent When Valid Backups Exist', () => {

    it('should render a notice when passed a Notice prop', () => {
      // give our components a Linode with a valid backup
      componentWithNotice.setState({ linodesWithBackups: [mockLinodesWithBackups] });
      component.setState({ linodesWithBackups: [mockLinodesWithBackups] });
      expect(componentWithNotice.find('WithStyles(Notice)')).toHaveLength(1);
    });

    it('should not render a notice when no notice prop passed', () => {
      expect(component.find('WithStyles(Notice)')).toHaveLength(0);
    });

    it('should render SelectLinode panel', () => {
      expect(component.find('WithStyles(SelectLinodePanel)')).toHaveLength(1);
    });

    it('should render SelectBackup panel', () => {
      expect(component.find('WithStyles(SelectBackupPanel)')).toHaveLength(1);
    });

    it('should render SelectPlan panel', () => {
      expect(component.find('WithStyles(SelectPlanPanel)')).toHaveLength(1);
    });

    it('should render SelectLabel panel', () => {
      expect(component.find('WithStyles(InfoPanel)')).toHaveLength(1);
    });

    it('should render SelectAddOns panel', () => {
      expect(component.find('WithStyles(AddonsPanel)')).toHaveLength(1);
    });
  });
});
