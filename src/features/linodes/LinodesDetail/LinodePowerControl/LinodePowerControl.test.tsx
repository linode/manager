import { shallow } from 'enzyme';
import * as React from 'react';

import { LinodePowerButton } from './LinodePowerControl';

describe('Linode Power Control Dialogs', () => {
  const component = (
    <LinodePowerButton
      classes={{
        root: '',
        button: '',
        buttonText: '',
        menuItem: '',
        menuItemInner: '',
        buttonInner: '',
        caret: '',
        caretDisabled: '',
        hidden: ''
      }}
      id={1}
      label="Test Linode"
      status="running"
      openConfigDrawer={jest.fn()}
      noConfigs={false}
    />
  );

  it('powerAlertOpen state should be true if reboot menu item is clicked', () => {
    const renderedComponent = shallow(component);
    const button = renderedComponent.find(
      'WithStyles(WrapperMenuItem)[data-qa-set-power="reboot"]'
    );
    button.simulate('click');
    expect(renderedComponent.state('powerAlertOpen')).toBeTruthy();
  });

  it('powerAlertOpen state should be true if power off menu item is clicked', () => {
    const renderedComponent = shallow(component);
    const button = renderedComponent.find(
      'WithStyles(WrapperMenuItem)[data-qa-set-power="powerOff"]'
    );
    button.simulate('click');
    expect(renderedComponent.state('powerAlertOpen')).toBeTruthy();
  });

  xit('Confirmation Dialog cancel button should set powerAlertOpen state is false', () => {
    const renderedComponent = shallow(component);
    console.log(renderedComponent.debug())
    const cancelButton = renderedComponent
      .find('WithStyles(ConfirmationDialog)')
      .dive()
      .dive()
      .find('[data-qa-confirm-cancel]');
    cancelButton.simulate('click');
    expect(renderedComponent.state('powerAlertOpen')).toBeFalsy();
  });

  it('should only have the option to reboot if the status is "running"', () => {
    const renderedComponent = shallow(component);

    // "Running"
    renderedComponent.setProps({ status: 'running' });
    expect(
      renderedComponent.find('[data-qa-set-power="reboot"]').exists()
    ).toBeTruthy();

    // "Offline"
    renderedComponent.setProps({ status: 'offline' });
    expect(
      renderedComponent.find('[data-qa-set-power="reboot"]').exists()
    ).toBeFalsy();
  });
});
