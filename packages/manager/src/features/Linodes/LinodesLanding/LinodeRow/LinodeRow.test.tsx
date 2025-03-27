import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { linodeFactory } from 'src/factories';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { LinodeRow, RenderFlag } from './LinodeRow';

describe('LinodeRow', () => {
  describe('when Linode has mutation', () => {
    it('should render a Flag', () => {
      const { getByLabelText } = renderWithTheme(
        <RenderFlag mutationAvailable={true} />
      );

      expect(
        getByLabelText('There is a free upgrade available for this Linode')
      ).toBeVisible();
    });
  });

  it('should render a linode row', async () => {
    const linode = linodeFactory.build();
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
        capabilities={linode.capabilities}
        created={linode.created}
        group={linode.group}
        hypervisor={linode.hypervisor}
        id={linode.id}
        image={linode.image}
        interface_generation="legacy_config"
        ipv4={linode.ipv4}
        ipv6={linode.ipv6 || ''}
        key={`linode-row-${1}`}
        label={linode.label}
        lke_cluster_id={linode.lke_cluster_id}
        placement_group={linode.placement_group}
        region={linode.region}
        site_type={linode.site_type}
        specs={linode.specs}
        status={linode.status}
        tags={linode.tags}
        type={linode.type}
        updated={linode.updated}
        watchdog_enabled={linode.watchdog_enabled}
      />
    );

    const { getByLabelText, getByText } = renderWithTheme(
      wrapWithTableBody(renderedLinode)
    );

    getByText(linode.label);

    // Open action menu
    const actionMenu = getByLabelText(`Action menu for Linode ${linode.label}`);
    await userEvent.click(actionMenu);

    getByText('Power Off');
    getByText('Reboot');
    getByText('Launch LISH Console');
    getByText('Clone');
    getByText('Resize');
  });
});
