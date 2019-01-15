import { shallow } from 'enzyme';
import * as React from 'react';
import { light } from 'src/themes';
import { CombinedProps, LinodeRow, RenderFlag } from './LinodeRow';

describe('LinodeRow', () => {

  const mockClasses = {
    actionCell: '',
    actionInner: '',
    bodyRow: '',
    ipCell: '',
    ipCellWrapper: '',
    planCell: '',
    regionCell: '',
    iconTableCell: '',
    icon: '',
    iconGridCell: ''
  };

  const mockProps: CombinedProps = {
    classes: mockClasses,
    toggleConfirmation: jest.fn(),
    theme: light,
    recentEvent: undefined,
    openConfigDrawer: jest.fn(),
    mutationAvailable: false,
    linodeNotifications: [],
    linode: {
      alerts: {
        cpu: 1,
        io: 1,
        network_in: 1,
        network_out: 1,
        transfer_quota: 1,    
      },
      type: 'whatever',
      created: '2018-12-12T00:00:000',
      updated: '2018-12-12T00:00:000',
      hypervisor: 'kvm',
      watchdog_enabled: true,
      group: '',
      tags: [],
      status: 'running',
      region: 'us-east',
      label: 'my-linode',
      ipv6: 'some.long.ipv6.address',
      ipv4: ['123.123.123.123'],
      id: 8675309,
      backups: {
        enabled: false,
        schedule: { day: 'Friday', window: 'W0' },
      },
      image: null,
      specs: {
        memory: 0,
        vcpus: 0,
        disk: 0,
        transfer: 0
      },
      mostRecentBackup: undefined,
    },
  };

  const mockNotification: Linode.Notification = {
    entity: {
      url: 'doesnt/matter/',
      type: 'linode',
      label: 'my-linode',
      id: 8675309
    },
    label: 'Here\'s a notification!',
    message: 'Something something... whatever.',
    severity: 'major',
    when: null,
    until: null,
    type: 'migration_pending'
  };

  it('should render', () => {
    shallow(<LinodeRow {...mockProps} />);
  });

  it('should have a RenderFlag component', () => {
    const wrapper = shallow(<LinodeRow {...mockProps} linodeNotifications={[mockNotification]} />);
    expect(wrapper.find('RenderFlag')).toHaveLength(1);
  });

  describe('when Linode has notification', () => {
    it('should render a Flag', () => {
      const wrapper = shallow(
        <RenderFlag
          mutationAvailable={false}
          linodeNotifications={[mockNotification]}
          classes={{ flag: '', }}
        />
      );

      const Tooltip = wrapper.find('WithStyles(Tooltip)');

      expect(Tooltip).toHaveLength(1);
      expect(Tooltip.props()).toHaveProperty('title', mockNotification.message)
    });
  });
});
