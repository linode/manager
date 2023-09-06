import userEvent from '@testing-library/user-event';
import { shallow } from 'enzyme';
import * as React from 'react';

import { mockNotification } from 'src/__data__/notifications';
import { linodeFactory } from 'src/factories';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { LinodeRow, RenderFlag } from './LinodeRow';

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

  it('should render a linode row', () => {
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
      />
    );

    const { getByLabelText, getByText } = renderWithTheme(
      wrapWithTableBody(renderedLinode)
    );

    getByText(linode.label);

    // Open action menu
    const actionMenu = getByLabelText(`Action menu for Linode ${linode.label}`);
    userEvent.click(actionMenu);

    getByText('Power Off');
    getByText('Reboot');
    getByText('Launch LISH Console');
    getByText('Clone');
    getByText('Resize');
  });
});
