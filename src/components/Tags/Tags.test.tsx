import { shallow } from 'enzyme';
import * as React from 'react';

import { Tags } from './Tags';

describe('Tags list', () => {
  it('should display "Show More" button if the tags list is more than 3', () => {
    const component = shallow(
      <Tags
        tags={['tag1', 'tag2', 'tag3', 'tag4', 'tag5']}
        classes={{
          root: '',
          tag: ''
        }}
      />
    );

    expect(component.find('WithStyles(ShowMore)')).toHaveLength(1);
  });

  it('shouldn\'t display the "Show More" button if the tags list contains 3 or fewer tags', () => {
    const component = shallow(
      <Tags
        tags={['tag1', 'tag2', 'tag3']}
        classes={{
          root: '',
          tag: ''
        }}
      />
    );

    expect(component.find('WithStyles(ShowMore)')).toHaveLength(0);
  });
});
