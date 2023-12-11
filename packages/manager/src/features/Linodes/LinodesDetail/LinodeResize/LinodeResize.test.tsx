import * as React from 'react';

import { extendedTypes } from 'src/__data__/ExtendedType';
import { extDisk, swapDisk } from 'src/__data__/disks';
import { linodeFactory } from 'src/factories';
import { rest, server } from 'src/mocks/testServer';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeResize } from './LinodeResize';
import {
  isSmallerThanCurrentPlan,
  shouldEnableAutoResizeDiskOption,
} from './LinodeResize.utils';

beforeAll(() => {
  mockMatchMedia();
});

describe('LinodeResize', () => {
  it('to render', async () => {
    server.use(
      rest.get('*/linode/instances/:id', (req, res, ctx) => {
        return res(ctx.json(linodeFactory.build({ label: 'test-resize' })));
      })
    );
    const { findByText } = renderWithTheme(
      <LinodeResize
        linodeId={12}
        linodeLabel=""
        onClose={vi.fn()}
        open={true}
      />
    );
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
});
