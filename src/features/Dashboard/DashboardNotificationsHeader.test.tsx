import { shallow } from 'enzyme';
import * as React from 'react';
import { DashboardNotificationsHeader } from './DashboardNotificationsHeader';

const mockNotifications: Linode.Notification[] = [
  {
    "entity": {
      "url": "/linode/instances/fake_linode",
      "label": "test-linode",
      "type": "linode",
      "id": 1
    },
    "type": "maintenance",
    "until": null,
    "label": "",
    "severity": "major",
    "body": "",
    "when": null,
    "message": "Maintenance is required for one or more of your Linodes. Your maintenance time is 2018-11-30 14:00:00. Please see status.linode.com for additional information. THIS TEXT IS HARDCODED AND WILL CHANGE."
  }
];

describe('DashboardNotificationsHeader', () => {
  const wrapper = shallow(
    <DashboardNotificationsHeader
      notifications={mockNotifications}
      classes={{ root: '', link: '' }}
    />
  );
  it('renders ProductNotifications', () => {
    expect(wrapper.find('WithStyles(ProductNotifications)')).toHaveLength(1);
  });

  it('passes correct props to ProductNotifications', () => {
    expect(wrapper.find('WithStyles(ProductNotifications)').props()).toHaveProperty('severity');
    expect(wrapper.find('WithStyles(ProductNotifications)').props()).toHaveProperty('text');
  });

  it('doesn\'t render anything when no notifications provided', () => {
    wrapper.setProps({ notifications: [] });
    expect(wrapper.find('WithStyles(ProductNotifications)')).toHaveLength(0);
  });
});
