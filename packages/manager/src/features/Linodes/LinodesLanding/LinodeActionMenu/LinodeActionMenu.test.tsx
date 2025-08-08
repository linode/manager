import { linodeBackupsFactory, regionFactory } from '@linode/utilities';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { extendedTypes } from 'src/__data__/ExtendedType';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeActionMenu } from './LinodeActionMenu';
import { buildQueryStringForLinodeClone } from './LinodeActionMenuUtils';

import type { LinodeActionMenuProps } from './LinodeActionMenu';

const props: LinodeActionMenuProps = {
  linodeBackups: linodeBackupsFactory.build(),
  linodeId: 1,
  linodeLabel: 'test-linode',
  linodeRegion: 'us-east',
  linodeStatus: 'running',
  linodeType: extendedTypes[0],
  onOpenDeleteDialog: vi.fn(),
  onOpenMigrateDialog: vi.fn(),
  onOpenPowerDialog: vi.fn(),
  onOpenRebuildDialog: vi.fn(),
  onOpenRescueDialog: vi.fn(),
  onOpenResizeDialog: vi.fn(),
};

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      shutdown_linode: false,
      reboot_linode: false,
      clone_linode: false,
      resize_linode: false,
      rebuild_linode: false,
      rescue_linode: false,
      migrate_linode: false,
      delete_linode: false,
      generate_linode_lish_token: false,
    },
  })),
  useNavigate: vi.fn(),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
  };
});

describe('LinodeActionMenu', () => {
  beforeEach(() => {
    queryMocks.useNavigate.mockReturnValue(vi.fn());
  });

  describe('Action menu', () => {
    it('should contain all basic actions when the Linode is running', async () => {
      const { getByLabelText, getByText } = renderWithTheme(
        <LinodeActionMenu {...props} />
      );

      const actionMenuButton = getByLabelText(
        `Action menu for Linode ${props.linodeLabel}`
      );

      await userEvent.click(actionMenuButton);

      const actions = [
        'Power Off',
        'Reboot',
        'Launch LISH Console',
        'Clone',
        'Resize',
        'Rebuild',
        'Rescue',
        'Migrate',
        'Delete',
      ];

      for (const action of actions) {
        expect(getByText(action)).toBeVisible();
      }
    });

    it('should contain Power On when the Linode is offline', async () => {
      const { getByLabelText, queryByText } = renderWithTheme(
        <LinodeActionMenu {...props} linodeStatus="offline" />
      );

      const actionMenuButton = getByLabelText(
        `Action menu for Linode ${props.linodeLabel}`
      );

      await userEvent.click(actionMenuButton);

      expect(queryByText('Power On')).toBeVisible();
      expect(queryByText('Power Off')).toBeNull();
    });

    it('should disable Power On when the Linode is rebooting', async () => {
      const { getByLabelText, queryByTestId } = renderWithTheme(
        <LinodeActionMenu {...props} linodeStatus="rebooting" />
      );

      const actionMenuButton = getByLabelText(
        `Action menu for Linode ${props.linodeLabel}`
      );

      await userEvent.click(actionMenuButton);

      const powerOnItem = queryByTestId('Power On');
      expect(powerOnItem).toHaveAttribute('aria-disabled', 'true');

      const tooltipButton = within(powerOnItem!).getByRole('button');

      expect(tooltipButton).toHaveAttribute(
        'aria-label',
        'This action is unavailable while your Linode is offline.'
      );
    });

    it('should allow a reboot if the Linode is running', async () => {
      renderWithTheme(<LinodeActionMenu {...props} />);
      await userEvent.click(screen.getByLabelText(/^Action menu for/));
      expect(screen.queryByText('Reboot')).not.toHaveAttribute('aria-disabled');
    });

    it('should disable the reboot action if the Linode is not running', async () => {
      // TODO: Should check for "read_only" permissions too
      renderWithTheme(<LinodeActionMenu {...props} linodeStatus="offline" />);
      await userEvent.click(screen.getByLabelText(/^Action menu for/));
      expect(screen.queryByTestId('Reboot')).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });

    it('should disable the clone action if the Linode is in a distributed region', async () => {
      const propsWithDistributedRegion = {
        ...props,
        linodeRegion: 'us-den-10',
      };

      const { getByLabelText, getByTestId } = renderWithTheme(
        <LinodeActionMenu {...propsWithDistributedRegion} />
      );

      await userEvent.click(getByLabelText(/^Action menu for/));
      expect(getByTestId('Clone')).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('buildQueryStringForLinodeClone', () => {
    it('returns `type` and `linodeID` params', () => {
      const result = buildQueryStringForLinodeClone(
        1,
        'us-east',
        'g6-standard-1',
        [],
        []
      );
      expect(result).toMatchObject({
        linodeID: 1,
      });
    });

    it('includes `regionID` param if valid region', () => {
      const regionsData = regionFactory.buildList(1, { id: 'us-east' });
      expect(
        buildQueryStringForLinodeClone(1, 'us-east', '', [], regionsData)
      ).toMatchObject({
        regionID: 'us-east',
      });
      expect(
        buildQueryStringForLinodeClone(1, 'invalid-region', '', [], regionsData)
      ).not.toMatchObject({
        regionID: 'us-east',
      });
    });

    it('includes `typeID` param if valid type', () =>
      expect(
        buildQueryStringForLinodeClone(
          1,
          '',
          'g6-standard-2',
          extendedTypes,
          []
        )
      ).toMatchObject({
        typeID: 'g6-standard-2',
      }));

    expect(
      buildQueryStringForLinodeClone(1, '', 'invalid-type', extendedTypes, [])
    ).not.toMatchObject({
      typeID: 'g6-standard-2',
    });
  });

  it('should disable Action menu items if the user does not have required permissions', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        shutdown_linode: false,
        reboot_linode: false,
        clone_linode: false,
        resize_linode: false,
        rebuild_linode: false,
        rescue_linode: false,
        migrate_linode: false,
        delete_linode: false,
        generate_linode_lish_token: false,
      },
    });

    const { getByLabelText, getByText } = renderWithTheme(
      <LinodeActionMenu {...props} />
    );

    const actionMenuButton = getByLabelText(
      `Action menu for Linode ${props.linodeLabel}`
    );

    await userEvent.click(actionMenuButton);

    const actions = [
      'Power Off',
      'Reboot',
      'Launch LISH Console',
      'Clone',
      'Resize',
      'Rebuild',
      'Rescue',
      'Migrate',
      'Delete',
    ];

    for (const action of actions) {
      expect(getByText(action)).toBeVisible();
      expect(screen.queryByTestId(action)).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    }
  });

  it('should enable "Reboot" button if the user has reboot_linode permissions', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        ...queryMocks.userPermissions().data,
        reboot_linode: true,
      },
    });

    const { getByLabelText, getByTestId } = renderWithTheme(
      <LinodeActionMenu {...props} />
    );

    const actionMenuButton = getByLabelText(
      `Action menu for Linode ${props.linodeLabel}`
    );

    await userEvent.click(actionMenuButton);
    expect(getByTestId('Reboot')).not.toHaveAttribute('aria-disabled');
  });
});
