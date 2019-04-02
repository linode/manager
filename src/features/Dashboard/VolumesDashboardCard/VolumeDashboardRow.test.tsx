import { shallow } from 'enzyme';
import * as React from 'react';

import { volumes } from 'src/__data__/volumes';
import { VolumeDashboardRow } from './VolumeDashboardRow';

const classes = {
  root: '',
  icon: '',
  labelGridWrapper: '',
  description: '',
  labelCol: '',
  moreCol: '',
  actionsCol: '',
  wrapHeader: ''
};
const props = {
  classes,
  volume: volumes[2]
};

const component = shallow(<VolumeDashboardRow {...props} />);

describe('Volumes dashboard card', () => {
  it.skip("should show the attached Linode's label for each Volume", () => {
    expect(
      component.find('[data-qa-attached-linode]').contains('Linode label') // @todo mock this
    ).toBeTruthy();
  });

  it('should show Unattached for each unattached Volume', () => {
    const unattachedProps = { ...props, volume: volumes[0] };
    const unattached = shallow(<VolumeDashboardRow {...unattachedProps} />);
    expect(
      unattached.find('[data-qa-attached-linode]').contains('Unattached')
    ).toBeTruthy();
  });
});
