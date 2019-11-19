import { cleanup } from '@testing-library/react';
import { shallow } from 'enzyme';
import Flag from 'src/assets/icons/flag.svg';
import Divider from 'src/components/core/Divider';
import Tooltip from 'src/components/core/Tooltip';
import { renderWithTheme } from 'src/utilities/testHelpers';

import * as React from 'react';

afterEach(cleanup);

describe('Flag', () => {
  it('should render the flag', () => {
    renderWithTheme(<Flag className={''} />);
  });
});
describe('Divider', () => {
  it('should render the divider', () => {
    renderWithTheme(<Divider />);
  });
});
describe('Tooltip', () => {
  it('should render the Tooltip', () => {
    renderWithTheme(
      <Tooltip title="test">
        <div>fafa</div>
      </Tooltip>
    );
  });
});

import { mockNotification } from 'src/__data__/notifications';
import { light } from 'src/themes';
import {
  CombinedProps,
  LinodeCard,
  RenderFlag,
  RenderTitle
} from './LinodeCard';

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
    cardMaintenance: '',
    wrapHeader: '',
    status: '',
    statusHelpIcon: '',
    maintenanceNotice: ''
  };

  const mockProps: CombinedProps = {
    classes: mockClasses,
    theme: light({ spacingOverride: 4 }),
    maintenanceStartTime: '',
    recentEvent: undefined,
    openDeleteDialog: jest.fn(),
    openPowerActionDialog: jest.fn(),
    mutationAvailable: false,

    type: 'whatever',
    tags: [],
    status: 'running',
    region: 'us-east',
    label: 'my-linode',
    ipv6: 'some.long.ipv6.address',
    ipv4: ['123.123.123.123'],
    id: 8675309,
    backups: {
      enabled: false,
      schedule: { day: 'Friday', window: 'W0' }
    },
    image: null,
    memory: 0,
    vcpus: 0,
    disk: 0,
    mostRecentBackup: null,

    linodeNotifications: [],
    displayType: 'Some Fancy Name',
    imageLabel: 'string'
  };

  it('should render', () => {
    renderWithTheme(<LinodeCard {...mockProps} />);
  });

  it('should have a no Render flag component, because mutationAvailable=false and linodeNotifications=[]', () => {
    const { queryAllByRole } = renderWithTheme(
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
          wrapHeader: ''
        }}
      />
    );
    expect(queryAllByRole('listitem')).toEqual([]);
  });
  it('should have a a Render flag component, because mutationAvailable=true and linodeNotifications=[]', () => {
    const { getAllByRole } = renderWithTheme(
      <RenderTitle
        linodeNotifications={[]}
        mutationAvailable={true}
        linodeStatus={'running'}
        linodeLabel={'my-linode'}
        linodeId={8675309}
        classes={{
          StatusIndicatorWrapper: '',
          cardHeader: '',
          flag: '',
          flagContainer: '',
          linkWrapper: '',
          wrapHeader: ''
        }}
      />
    );
    expect(getAllByRole('listitem')).toHaveLength(1);
  });

  describe('when linodeNotifications is not empty', () => {
    it('#TODO #REFACTOR should render a Flag', () => {
      const wrapper = shallow(
        <RenderFlag
          mutationAvailable={false}
          linodeNotifications={[mockNotification]}
          classes={{ flag: '' }}
        />
      );
      // using testing library fails here because of tooltip..
      const tooltip = wrapper.find('WithStyles(ForwardRef(Tooltip))');

      expect(tooltip).toHaveLength(1);
      expect(tooltip.props()).toHaveProperty('title', mockNotification.message);
    });
  });
});
