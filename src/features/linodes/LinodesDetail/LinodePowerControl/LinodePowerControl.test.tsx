import * as React from 'react';
import { shallow } from 'enzyme';

import { LinodePowerButton } from './LinodePowerControl';

describe('Linode Power Control Dialogs', () => {
  const component = shallow(
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
    />,
  );

  it('powerAlertOpen state should be true if reboot menu item is clicked', () => {
    const button = component.find('WithStyles(MenuItem)[data-qa-set-power="reboot"]');
    button.simulate('click');
    expect(component.state('powerAlertOpen')).toBeTruthy();
    component.setState({ powerAlertOpen: false }); // reset state
  });

  it('powerAlertOpen state should be true if power off menu item is clicked', () => {
    const button = component.find('WithStyles(MenuItem)[data-qa-set-power="powerOff"]');
    button.simulate('click');
    expect(component.state('powerAlertOpen')).toBeTruthy();
    component.setState({ powerAlertOpen: false }); // reset state
  });

  it('Confirmation Dialog cancel button should set powerAlertOpen state is false', () => {
    component.setState({ powerAlertOpen: true }); // reset state
    const cancelButton = component.find('WithStyles(ConfirmationDialog)')
      .dive().dive().find('[data-qa-confirm-cancel]');
    cancelButton.simulate('click');
    expect(component.state('powerAlertOpen')).toBeFalsy();
  });
});
