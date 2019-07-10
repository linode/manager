import { mount, shallow } from 'enzyme';
import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { extDisk, swapDisk } from 'src/__data__/disks';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { types } from 'src/__data__/types';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import {
  isSmallerThanCurrentPlan,
  LinodeResize,
  shouldEnableAutoResizeDiskOption
} from './LinodeResize';

import { Provider } from 'react-redux';
import store from 'src/store';

describe('LinodeResize', () => {
  const mockTypes = types.map(LinodeResize.extendType);

  const component = shallow(
    <LinodeResize
      closeSnackbar={jest.fn()}
      linodeDisks={[]}
      enqueueSnackbar={jest.fn()}
      {...reactRouterProps}
      classes={{
        root: '',
        title: '',
        subTitle: '',
        currentPlanContainer: ''
      }}
      linodeId={12}
      linodeType={null}
      currentTypesData={mockTypes}
      deprecatedTypesData={mockTypes}
      linodeLabel=""
    />
  );

  it('should render the currently selected plan as a card', () => {
    const componentWithTheme = mount(
      <Provider store={store}>
        <LinodeThemeWrapper theme="dark" spacing="normal">
          <MemoryRouter>
            <LinodeResize
              linodeDisks={[]}
              closeSnackbar={jest.fn()}
              enqueueSnackbar={jest.fn()}
              {...reactRouterProps}
              classes={{
                root: '',
                title: '',
                subTitle: '',
                currentPlanContainer: ''
              }}
              linodeId={12}
              linodeType={null}
              currentTypesData={mockTypes}
              deprecatedTypesData={mockTypes}
              linodeLabel=""
            />
          </MemoryRouter>
        </LinodeThemeWrapper>
      </Provider>
    );

    const currentSelectionCard = componentWithTheme.find(
      'div [data-qa-select-card-heading="No Assigned Plan"]'
    );

    expect(currentSelectionCard.exists()).toBeTruthy();
    expect(currentSelectionCard.length).toEqual(1);
  });

  describe('when linodeType is null', () => {
    describe('current plan card', () => {
      it('should have a heading of No Assigned Plan', () => {
        const componentWithTheme = mount(
          <Provider store={store}>
            <LinodeThemeWrapper theme="dark" spacing="normal">
              <MemoryRouter>
                <LinodeResize
                  closeSnackbar={jest.fn()}
                  enqueueSnackbar={jest.fn()}
                  requestNotifications={jest.fn()}
                  linodeDisks={[]}
                  {...reactRouterProps}
                  classes={{
                    root: '',
                    title: '',
                    subTitle: '',
                    currentPlanContainer: ''
                  }}
                  linodeId={12}
                  linodeType={null}
                  currentTypesData={mockTypes}
                  deprecatedTypesData={mockTypes}
                  linodeLabel=""
                />
              </MemoryRouter>
            </LinodeThemeWrapper>
          </Provider>
        );

        const currentSelectionCard = componentWithTheme.find(
          'div [data-qa-select-card-heading="No Assigned Plan"]'
        );

        expect(currentSelectionCard.exists()).toBeTruthy();
        expect(currentSelectionCard.length).toEqual(1);
      });
    });
  });

  describe('when linodeType is unexpected', () => {
    describe('current plan card', () => {
      it('should have a heading of Unknown Plan', () => {
        const componentWithTheme = mount(
          <Provider store={store}>
            <LinodeThemeWrapper theme="dark" spacing="normal">
              <MemoryRouter>
                <LinodeResize
                  closeSnackbar={jest.fn()}
                  linodeDisks={[]}
                  enqueueSnackbar={jest.fn()}
                  {...reactRouterProps}
                  classes={{
                    root: '',
                    title: '',
                    subTitle: '',
                    currentPlanContainer: ''
                  }}
                  linodeId={12}
                  linodeType={'_something_unexpected_'}
                  currentTypesData={mockTypes}
                  deprecatedTypesData={mockTypes}
                  linodeLabel=""
                />
              </MemoryRouter>
            </LinodeThemeWrapper>
          </Provider>
        );

        const currentSelectionCard = componentWithTheme.find(
          'div [data-qa-select-card-heading="Unknown Plan"]'
        );

        expect(currentSelectionCard.exists()).toBeTruthy();
        expect(currentSelectionCard.length).toEqual(1);
      });
    });
  });

  it('submit button should be enabled if a plan is selected', () => {
    component.setState({ selectedId: 'selected' });
    const submitBtn = component.find('[data-qa-submit]');
    expect(submitBtn.prop('disabled')).toBeFalsy();
  });

  it('submit button should be disabled if no plan is selected', () => {
    component.setState({ selectedId: '' });
    const submitBtn = component.find('[data-qa-submit]');
    expect(submitBtn.prop('disabled')).toBeTruthy();
  });

  describe('utility functions', () => {
    it('should allow for resizing disk with one ext disk with label "Arch Linux Disk"', () => {
      const [diskLabel, shouldEnable] = shouldEnableAutoResizeDiskOption([
        extDisk
      ]);
      expect(diskLabel).toBe('Arch Linux Disk');
      expect(shouldEnable).toBeTruthy();
    });

    it('should not allow resizing disk with only one swap disk', () => {
      const [diskLabel, shouldEnable] = shouldEnableAutoResizeDiskOption([
        swapDisk
      ]);
      expect(diskLabel).toBe(undefined);
      expect(shouldEnable).toBeFalsy();
    });

    it('should allow for resizing with one swap and one ext disk', () => {
      const [diskLabel, shouldEnable] = shouldEnableAutoResizeDiskOption([
        extDisk,
        swapDisk
      ]);
      expect(diskLabel).toBe('Arch Linux Disk');
      expect(shouldEnable).toBeTruthy();
    });

    it('should not allow resizing disk with more than one ext disk', () => {
      const [diskLabel, shouldEnable] = shouldEnableAutoResizeDiskOption([
        extDisk,
        extDisk
      ]);
      expect(diskLabel).toBe('Arch Linux Disk');
      expect(shouldEnable).toBeFalsy();
    });

    describe('isSmallerThanCurrentPlan', () => {
      it('returns false when the first type provided is larger than the second', () => {
        expect(
          isSmallerThanCurrentPlan('g5-standard-2', 'g5-standard-1', mockTypes)
        ).toBe(false);
      });

      it('returns true when the first type provided is smaller than the second', () => {
        expect(
          isSmallerThanCurrentPlan('g5-standard-1', 'g5-standard-2', mockTypes)
        ).toBe(true);
      });

      it("defaults to false if one or both of the passed plans aren't found", () => {
        expect(
          isSmallerThanCurrentPlan('g5-standard-2', 'g5-fake-1', mockTypes)
        ).toBe(false);
        expect(
          isSmallerThanCurrentPlan('g5-fake-2', 'g5-standard-1', mockTypes)
        ).toBe(false);
        expect(
          isSmallerThanCurrentPlan('g5-fake-2', 'g5-fake-1', mockTypes)
        ).toBe(false);
        expect(
          isSmallerThanCurrentPlan('g5-standard-2', 'g5-standard-1', [])
        ).toBe(false);
      });
    });
  });
});
