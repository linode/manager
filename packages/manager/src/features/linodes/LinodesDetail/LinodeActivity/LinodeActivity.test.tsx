import { shallow } from 'enzyme';
import * as React from 'react';
import { LinodeActivity } from './LinodeActivity';

describe('LinodeActivity', () => {
  const wrapper = shallow(
    <LinodeActivity classes={{ root: '', title: '' }} linodeID={123} />
  );

  it('should return an EventsLanding component', () => {
    expect(wrapper.find('[data-qa-events-landing-for-linode]')).toHaveLength(1);
  });

  it('should specify that the EventsLanding component is for an entity', () => {
    const props: any = wrapper
      .find('[data-qa-events-landing-for-linode]')
      .props();
    expect(props.entityId).toBe(123);
  });
});
