import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { extDisk, swapDisk } from 'src/__data__/disks';
import { extendedTypes } from 'src/__data__/ExtendedType';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeResize } from './LinodeResize';
import {
  isSmallerThanCurrentPlan,
  shouldEnableAutoResizeDiskOption,
} from './LinodeResize.utils';

import type { Props } from './LinodeResize';

const props: Props = {
  linodeId: 12,
  linodeLabel: 'test-resize',
  onClose: () => vi.fn(),
  open: true,
};

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      resize_linode: false,
    },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

beforeAll(() => {
  mockMatchMedia();
});

describe('LinodeResize', () => {
  it('to render', async () => {
    const { findByText } = renderWithTheme(<LinodeResize {...props} />);
    await findByText('Resize Linode test-resize');
  });

  describe('utility functions', () => {
    it('should allow for resizing disk with one ext disk with label "Arch Linux Disk"', () => {
      const [diskLabel, shouldEnable] = shouldEnableAutoResizeDiskOption([
        extDisk,
      ]);
      expect(diskLabel).toBe('Arch Linux Disk');
      expect(shouldEnable).toBeTruthy();
    });

    it('should not allow resizing disk with only one swap disk', () => {
      const [diskLabel, shouldEnable] = shouldEnableAutoResizeDiskOption([
        swapDisk,
      ]);
      expect(diskLabel).toBe(undefined);
      expect(shouldEnable).toBeFalsy();
    });

    it('should allow for resizing with one swap and one ext disk', () => {
      const [diskLabel, shouldEnable] = shouldEnableAutoResizeDiskOption([
        extDisk,
        swapDisk,
      ]);
      expect(diskLabel).toBe('Arch Linux Disk');
      expect(shouldEnable).toBeTruthy();
    });

    it('should not allow resizing disk with more than one ext disk', () => {
      const [diskLabel, shouldEnable] = shouldEnableAutoResizeDiskOption([
        extDisk,
        extDisk,
      ]);
      expect(diskLabel).toBe('Arch Linux Disk');
      expect(shouldEnable).toBeFalsy();
    });

    describe('isSmallerThanCurrentPlan', () => {
      it('returns false when the first type provided is larger than the second', () => {
        expect(
          isSmallerThanCurrentPlan(
            'g6-standard-2',
            'g6-standard-1',
            extendedTypes
          )
        ).toBe(false);
      });

      it('returns true when the first type provided is smaller than the second', () => {
        expect(
          isSmallerThanCurrentPlan(
            'g6-standard-1',
            'g6-standard-2',
            extendedTypes
          )
        ).toBe(true);
      });

      it("defaults to false if one or both of the passed plans aren't found", () => {
        expect(
          isSmallerThanCurrentPlan('g5-standard-2', 'g5-fake-1', extendedTypes)
        ).toBe(false);
        expect(
          isSmallerThanCurrentPlan('g5-fake-2', 'g5-standard-1', extendedTypes)
        ).toBe(false);
        expect(
          isSmallerThanCurrentPlan('g5-fake-2', 'g5-fake-1', extendedTypes)
        ).toBe(false);
        expect(
          isSmallerThanCurrentPlan('g5-standard-2', 'g5-standard-1', [])
        ).toBe(false);
      });
    });
  });

  it('should not allow resizing if user does not have permission', async () => {
    const { findByText, getByRole } = renderWithTheme(
      <LinodeResize {...props} />
    );
    await findByText(
      "You don't have permissions to edit this Linode. Please contact your account administrator to request the necessary permissions."
    );

    const resizeBtn = getByRole('button', { name: 'Resize Linode' });
    expect(resizeBtn).toBeDisabled();
  });

  it('should not render LinodePermissionsError when user has resize_linode permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        resize_linode: true,
      },
    });

    const { queryByTestId } = renderWithTheme(<LinodeResize {...props} />);

    await waitFor(() => {
      expect(queryByTestId('linode-permissions-error')).not.toBeInTheDocument();
    });
  });
});
