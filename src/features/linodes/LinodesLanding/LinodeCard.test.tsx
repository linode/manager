import { shallow } from 'enzyme';
import * as React from 'react';
import { light } from 'src/themes';
import { CombinedProps, LinodeCard, RenderFlag, RenderTitle } from './LinodeCard';

describe('LinodeRow', () => {
  const mockClasses = {
    customeMQ: '',
    cardSection: '',
    flexContainer: '',
    cardHeader: '',
    cardContent: '',
    cardLoadingContainer: '',
    distroIcon: '',
    rightMargin: '',
    actionMenu: '',
    cardActions: '',
    button: '',
    consoleButton: '',
    rebootButton: '',
    loadingStatusText: '',
    flag: '',
    flagContainer: '',
    linkWrapper: '',
    StatusIndicatorWrapper: '',
    link: '',
    statusProgress: '',
    statusText: '',
    wrapHeader: '',
  };

  const mockProps: CombinedProps = {
    classes: mockClasses,
    toggleConfirmation: jest.fn(),
    theme: light,
    recentEvent: undefined,
    openConfigDrawer: jest.fn(),
    mutationAvailable: false,
    // mostRecentBackup: undefined,
    linodeType: 'whatever',
    linodeTags: [],
    linodeStatus: 'running',
    linodeRegion: 'us-east',
    linodeNotifications: [],
    linodeLabel: 'my-linode',
    linodeIpv6: 'some.long.ipv6.address',
    linodeIpv4: ['123.123.123.123'],
    linodeId: 8675309,
    linodeBackups: {
      enabled: false,
      schedule: { day: 'Friday', window: 'W0' },
    },
    displayType: 'Some Fancy Name',
    linodeSpecDisk: 225,
    linodeSpecMemory: 40,
    linodeSpecVcpus: 4,
    linodeSpecTransfer: 500,
    imageLabel: 'string',

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
    shallow(<LinodeCard {...mockProps} />);
  });

  it('should have a RenderFlag component', () => {
    const wrapper = shallow(
      <RenderTitle
        linodeNotifications={[]}
        mutationAvailable={false}
        linodeStatus={'running'}
        linodeLabel={'my-linode'}
        linodeId={8675309}
        classes={{
          StatusIndicatorWrapper: '',
          cardHeader: '',
          flag: '',
          flagContainer: '',
          linkWrapper: '',
          wrapHeader: '',
        }}
      />
    );

    expect(wrapper.find('RenderFlag')).toHaveLength(1);
  });


  describe('when linodeNotifications is not empty', () => {
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
