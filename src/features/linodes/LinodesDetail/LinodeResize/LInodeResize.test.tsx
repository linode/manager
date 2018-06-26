import * as React from 'react';

import { mount, shallow } from 'enzyme';

import { types } from 'src/__data__/types';

import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import { LinodeResize } from './LinodeResize';

import { createPromiseLoaderResponse } from 'src/utilities/testHelpers';

describe('LinodeResize', () => {
  const mockTypes = createPromiseLoaderResponse(
    types.map(LinodeResize.extendType),
  );

  const component = shallow(
    <LinodeResize
      classes={{
        root: '',
        title: '',
        subTitle: '',
        currentPlanContainer: '',
      }}
      linodeId={12}
      linodeType={null}
      types={mockTypes}
    />,
  );

  it('should render the currently selected plan as a card', () => {
    const component = mount(
      <LinodeThemeWrapper>
        <LinodeResize
          classes={{
            root: '',
            title: '',
            subTitle: '',
            currentPlanContainer: '',
          }}
          linodeId={12}
          linodeType={null}
          types={mockTypes}
        />
      </LinodeThemeWrapper>,
    );

    const currentSelectionCard =
      component.find('div [data-qa-select-card-heading="No Assigned Plan"]');

    expect(currentSelectionCard.exists()).toBeTruthy();
    expect(currentSelectionCard.length).toEqual(1);
  });

  describe('when linodeType is null', () => {
    describe('current plan card', () => {
      it('should have a heading of No Assigned Plan', () => {
        const component = mount(
          <LinodeThemeWrapper>
            <LinodeResize
              classes={{
                root: '',
                title: '',
                subTitle: '',
                currentPlanContainer: '',
              }}
              linodeId={12}
              linodeType={null}
              types={mockTypes}
            />
          </LinodeThemeWrapper>,
        );

        const currentSelectionCard =
          component.find('div [data-qa-select-card-heading="No Assigned Plan"]');

        expect(currentSelectionCard.exists()).toBeTruthy();
        expect(currentSelectionCard.length).toEqual(1);
      });
    });
  });

  describe('when linodeType is unexpected', () => {
    describe('current plan card', () => {
      it('should have a heading of Unknown Plan', () => {
        const component = mount(
          <LinodeThemeWrapper>
            <LinodeResize
              classes={{
                root: '',
                title: '',
                subTitle: '',
                currentPlanContainer: '',
              }}
              linodeId={12}
              linodeType={'_something_unexpected_'}
              types={mockTypes}
            />
          </LinodeThemeWrapper>,
        );

        const currentSelectionCard =
          component.find('div [data-qa-select-card-heading="Unknown Plan"]');

        expect(currentSelectionCard.exists()).toBeTruthy();
        expect(currentSelectionCard.length).toEqual(1);
      });
    });
  });

  it('submit button should be enabled if a plan is selected', () => {
    component.setState({ selectedId: 'selected' });
    const submitBtn = component.find('WithStyles(Button)');
    expect(submitBtn.prop('disabled')).toBeFalsy();
  })

  it('submit button should be disabled if no plan is selected', () => {
    component.setState({ selectedId: '' });
    const submitBtn = component.find('WithStyles(Button)');
    expect(submitBtn.prop('disabled')).toBeTruthy();
  })

});
