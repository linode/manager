import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';

import PaginationControls from './PaginationControls';

const getFirstPageButton = (wrapper: ReactWrapper) => wrapper.find('PageButton[first]');

const getLastPageButton = (wrapper: ReactWrapper) => wrapper.find('PageButton[last]');

describe('PaginationControls', () => {
  const mockPages = [1,2,3,4,5,6,7];

  it('should render a left and right arrow', () => {
    const wrapper = mount(
      <PaginationControls
        onClickHandler={jest.fn()}
        pages={mockPages}
        currentPage={3}
      />,
    );

    const prevPage = getFirstPageButton(wrapper);
    const nextPage = getLastPageButton(wrapper);

    expect(prevPage.exists()).toBeTruthy();
    expect(nextPage.exists()).toBeTruthy();
  });
  
  it('should render a left arrow when not on first page', () => {
    const wrapper = mount(
      <PaginationControls
        onClickHandler={jest.fn()}
        pages={mockPages}
        currentPage={1}
      />,
    );
    const prevPage = getFirstPageButton(wrapper);

    expect(prevPage.exists()).toBeFalsy();
  });
  
  it('should render a right arrow when not on last page', () => {
    const wrapper = mount(
      <PaginationControls
        onClickHandler={jest.fn()}
        pages={mockPages}
        currentPage={7}
      />,
    );
    const nextPage = getLastPageButton(wrapper);
    expect(nextPage.exists()).toBeFalsy();
  });
  
  it('should render a page button for each item in the array', () => {
    const wrapper = mount(
      <PaginationControls
        onClickHandler={jest.fn()}
        pages={mockPages}
        currentPage={7}
      />,
    );

    const pageBlocks = wrapper.find('PageButton').not('[first]').not('[last]');
    expect(pageBlocks).toHaveLength(7);
  });
  
  it('should invoke onClickHandler when clicked', () => {
    const mockClickHandler = jest.fn();

    const wrapper = mount(
      <PaginationControls
        onClickHandler={mockClickHandler}
        pages={mockPages}
        currentPage={7}
      />,
    );

    wrapper.find('PageButton').first().find('button').simulate('click');

    expect(mockClickHandler).toHaveBeenCalled();
  });
});
