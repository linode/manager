import { mount, shallow } from 'enzyme';
import * as React from 'react';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { types } from 'src/__data__/types';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import { LinodeResize } from './LinodeResize';

describe('LinodeResize', () => {
  const mockTypes = types.map(LinodeResize.extendType);

  const component = shallow(
    <LinodeResize
      closeSnackbar={jest.fn()}
      linodeDisks={[]}
      enqueueSnackbar={jest.fn()}
      requestNotifications={jest.fn()}
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
      <LinodeThemeWrapper>
        <LinodeResize
          linodeDisks={[]}
          closeSnackbar={jest.fn()}
          enqueueSnackbar={jest.fn()}
          requestNotifications={jest.fn()}
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
      </LinodeThemeWrapper>
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
          <LinodeThemeWrapper>
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
          </LinodeThemeWrapper>
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
          <LinodeThemeWrapper>
            <LinodeResize
              closeSnackbar={jest.fn()}
              linodeDisks={[]}
              enqueueSnackbar={jest.fn()}
              requestNotifications={jest.fn()}
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
          </LinodeThemeWrapper>
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
});
