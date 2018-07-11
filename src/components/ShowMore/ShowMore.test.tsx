import { mount } from 'enzyme';
import * as React from 'react';

import LinodeThemeWrapper from 'src/LinodeThemeWrapper';

import ShowMore from './ShowMore';

describe('ShowMore', () => {
  const mockRender = jest.fn();

  const wrapper = mount(
    <LinodeThemeWrapper>
      <ShowMore
        items={['a', 'b']}
        render={mockRender}
      />
    </LinodeThemeWrapper>,
  );

  it('should call provided render function with items.', () => {
    expect(mockRender).toHaveBeenCalledWith(['a', 'b']);
  });

  it('should render a chip with items.length', () => {
    const chipText = wrapper.find('Chip div span').text();
    expect(chipText).toBe('+2');
  });
});
