import { shallow } from 'enzyme';
import * as React from 'react';
import { mockNotification } from 'src/__data__/notifications';
import { RenderFlag } from './LinodeRow';

describe('LinodeRow', () => {
  describe.skip('when Linode has notification', () => {
    it('should render a Flag', () => {
      const wrapper = shallow(
        <RenderFlag
          mutationAvailable={false}
          linodeNotifications={[mockNotification]}
          classes={{ flag: '' }}
        />
      );

      const Tooltip = wrapper.find('WithStyles(Tooltip)');

      expect(Tooltip).toHaveLength(1);
      expect(Tooltip.props()).toHaveProperty('title', mockNotification.message);
    });
  });
});
