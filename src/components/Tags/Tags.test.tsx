import { mount } from 'enzyme';
import * as React from 'react';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';

import Tags from './Tags';

describe('Tags list', () => {
  it('displays "Show More" button if the tags list is more than 3', () => {
    const component = mount(
      <LinodeThemeWrapper>
        <Tags
          tags={['tag1', 'tag2', 'tag3', 'tag4', 'tag5']}
        />
      </LinodeThemeWrapper>
    );

    expect(component.find('[data-qa-show-more-chip]').length).not.toEqual(0);
  });

  it('displays "Show More" button if the tags list is more than 3', () => {
    const component = mount(
      <LinodeThemeWrapper>
        <Tags
          tags={['tag1', 'tag2', 'tag3']}
        />
      </LinodeThemeWrapper>
    );

    expect(component.find('[data-qa-show-more-chip]').length).toEqual(0);
  });

});
