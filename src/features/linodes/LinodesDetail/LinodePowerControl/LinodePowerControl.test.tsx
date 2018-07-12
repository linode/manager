import { shallow } from 'enzyme';
import * as React from 'react';

import { LinodePowerButton } from './LinodePowerControl';

describe('Linode Power Control Dialogs', () => {
  const component =
    <LinodePowerButton
      classes={{
        root: '',
        button: '',
        menuItem: '',
        caret: '',
        icon: '',
        powerOn: '',
        powerOff: '',
        rotate: '',
        fadeIn: '',
        hidden: '',
      }}
      id={1}
      label="Test Linode"
      status="running"
      openConfigDrawer={jest.fn()}
    />;

  it('powerAlertOpen state should be true if reboot menu item is clicked', () => {
    const renderedComponent = shallow(component);
    const button = renderedComponent
      .find('WithStyles(WrapperMenuItem)[data-qa-set-power="reboot"]');
    button.simulate('click');
    expect(renderedComponent.state('powerAlertOpen')).toBeTruthy();
  });

  it('powerAlertOpen state should be true if power off menu item is clicked', () => {
    const renderedComponent = shallow(component);
    const button = renderedComponent
      .find('WithStyles(WrapperMenuItem)[data-qa-set-power="powerOff"]');
    button.simulate('click');
    expect(renderedComponent.state('powerAlertOpen')).toBeTruthy();
  });

  it('Confirmation Dialog cancel button should set powerAlertOpen state is false', () => {
    const renderedComponent = shallow(component);
    const cancelButton = renderedComponent.find('WithStyles(ConfirmationDialog)')
      .dive().dive().find('[data-qa-confirm-cancel]');
    cancelButton.simulate('click');
    expect(renderedComponent.state('powerAlertOpen')).toBeFalsy();
  });
});
