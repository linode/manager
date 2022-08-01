import { shallow } from 'enzyme';
import * as React from 'react';
import { UseQueryResult } from 'react-query';
import { profileFactory } from 'src/factories';
import { mockMatchMedia } from 'src/utilities/testHelpers';
import { extDisk, swapDisk } from 'src/__data__/disks';
import { extendedTypes } from 'src/__data__/ExtendedType';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { Grants, Profile, UserPreferences } from '@linode/api-v4/lib';
import { APIError } from '@linode/api-v4/lib/types';
import {
  isSmallerThanCurrentPlan,
  LinodeResize,
  shouldEnableAutoResizeDiskOption,
} from './LinodeResize';
import { grantsFactory } from 'src/factories/grants';
import { preferencesFactory } from 'src/factories/preferences';

beforeAll(() => {
  mockMatchMedia();
});

describe('LinodeResize', () => {
  const component = shallow(
    <LinodeResize
      profile={
        { data: profileFactory.build() } as UseQueryResult<Profile, APIError[]>
      }
      grants={
        { data: grantsFactory.build() } as UseQueryResult<Grants, APIError[]>
      }
      closeSnackbar={jest.fn()}
      enqueueSnackbar={jest.fn()}
      {...reactRouterProps}
      classes={{
        title: '',
        subTitle: '',
        toolTip: '',
        currentPlanContainer: '',
        resizeTitle: '',
        currentHeaderEmptyCell: '',
        selectPlanPanel: '',
        actionPanel: '',
      }}
      linodeId={12}
      linodeLabel=""
      open={false}
      getUserPreferences={jest.fn()}
      updateUserPreferences={jest.fn()}
      preferences={{ data: preferencesFactory.build() } as UserPreferences}
      onClose={jest.fn()}
      getLinodeDisks={jest.fn()}
      updateLinode={jest.fn()}
      typesData={extendedTypes}
      typesLoading={false}
    />
  );

  it('submit button should be enabled if a plan is selected', () => {
    component.setState({ selectedId: 'selected' });
    const submitBtn = component.find('[data-qa-resize]');
    expect(submitBtn.prop('disabled')).toBeFalsy();
  });

  it('submit button should be disabled if no plan is selected', () => {
    component.setState({ selectedId: '' });
    const submitBtn = component.find('[data-qa-resize]');
    expect(submitBtn.prop('disabled')).toBeTruthy();
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
