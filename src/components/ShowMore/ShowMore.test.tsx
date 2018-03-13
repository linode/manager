import * as React from 'react';
import { mount } from 'enzyme';
import ShowMore from './ShowMore';

describe('ShowMore', () => {
  const mockRender = jest.fn();

  const wrapper = mount(
    <ShowMore
      items={['a', 'b']}
      render={mockRender}
    />,
  );

  it('should call provided render function with items.', () => {
    expect(mockRender).toHaveBeenCalledWith(['a', 'b']);
  });

  it('should render a chip with items.length', () => {
    const chipText = wrapper.find('Chip div span').text();
    expect(chipText).toBe('+2');
  });
});
