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

describe('LinodeRow', () => {
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

  it('should render a linode row', () => {
    const { getByText, queryByText } = renderWithTheme(
      wrapWithTableBody(renderedLinode, { queryClient })
    );
    const vpcLabel = queryByText('someVpc');
    expect(vpcLabel).toBeNull();
    getByText(linode.label);
    getByText('Power Off');
    getByText('Reboot');
    getByText('Launch LISH Console');
    getByText('Clone');
    getByText('Resize');
  });

  // TODO figure out how to mock the vpc feature flag ()
  it.skip('should render vpc information if vpc flag is on', () => {
    const { getByText } = renderWithTheme(
      wrapWithTableBody(renderedLinode, { queryClient })
    );
    // getByText('someVpc);
    getByText(linode.label);
    getByText('Power Off');
    getByText('Reboot');
    getByText('Launch LISH Console');
    getByText('Clone');
    getByText('Resize');
  });

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
});
