import { shallow } from 'enzyme';
import * as React from 'react';

import { QueryClient } from 'react-query';

import { linodeFactory } from 'src/factories';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import { mockNotification } from 'src/__data__/notifications';

import { RenderFlag, LinodeRow } from './LinodeRow';

const queryClient = new QueryClient();

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

jest.mock('src/hooks/useFlags', () => ({
  __esModule: true,
  useFlags: jest.fn().mockReturnValue({ vpc: true }),
}));

describe('LinodeRow', () => {
  describe('when Linode has notification', () => {
    it('should render a Flag', () => {
      const wrapper = shallow(
        <RenderFlag
          linodeNotifications={[mockNotification]}
          mutationAvailable={false}
        />
      );

      const Tooltip = wrapper.find('Tooltip');

      expect(Tooltip).toHaveLength(1);
      expect(Tooltip.props()).toHaveProperty('title', mockNotification.message);
    });
  });

  // TODO: VPC - when a feature flag is no longer needed for vpc, this should be changed
  it('should render a linode row with associated vpc information if the feature flag is on', () => {
    const lin = linodeFactory.build();
    const linode = { ...lin, vpcLabel: 'someVpc', vpcId: 1 };
    const renderedLinode = (
      <LinodeRow
        handlers={{
          onOpenDeleteDialog: () => {},
          onOpenMigrateDialog: () => {},
          onOpenPowerDialog: (action) => {},
          onOpenRebuildDialog: () => {},
          onOpenRescueDialog: () => {},
          onOpenResizeDialog: () => {},
        }}
        alerts={linode.alerts}
        backups={linode.backups}
        created={linode.created}
        group={linode.group}
        hypervisor={linode.hypervisor}
        id={linode.id}
        image={linode.image}
        ipv4={linode.ipv4}
        ipv6={linode.ipv6 || ''}
        key={`linode-row-${1}`}
        label={linode.label}
        region={linode.region}
        specs={linode.specs}
        status={linode.status}
        tags={linode.tags}
        type={linode.type}
        updated={linode.updated}
        watchdog_enabled={linode.watchdog_enabled}
        vpcLabel={linode.vpcLabel}
        vpcId={linode.vpcId}
      />
    );

    const { getByText } = renderWithTheme(
      wrapWithTableBody(renderedLinode, { queryClient })
    );

    getByText('someVpc');
    getByText(linode.label);
    getByText('Power Off');
    getByText('Reboot');
    getByText('Launch LISH Console');
    getByText('Clone');
    getByText('Resize');
  });
});
