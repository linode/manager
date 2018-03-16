import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';

import PaginationControls from './PaginationControls';

const getFirstPageButton = (wrapper: ReactWrapper) => wrapper.find('PageButton[first]');

const getLastPageButton = (wrapper: ReactWrapper) => wrapper.find('PageButton[last]');

describe('PaginationControls', () => {

  const mockPages = Array.from(Array(7), (x, idx) => idx + 1);

  it('should render a left and right arrow', () => {
    const wrapper = mount(
      <PaginationControls
        onClickHandler={jest.fn()}
        pages={mockPages}
        currentPage={3}
        range={10}
      />,
    );

    const prevPage = getFirstPageButton(wrapper);
    const nextPage = getLastPageButton(wrapper);

    expect(prevPage.exists()).toBeTruthy();
    expect(nextPage.exists()).toBeTruthy();
  });

  it('should render a disabled previous button when at first page.', () => {
    const wrapper = mount(
      <PaginationControls
        onClickHandler={jest.fn()}
        pages={mockPages}
        currentPage={1}
        range={10}
      />,
    );

    const prevPage = getFirstPageButton(wrapper);
    expect(prevPage.prop('disabled')).toBeTruthy();
  });

  it('should render a disabled next button when at last page.', () => {
    const wrapper = mount(
      <PaginationControls
        onClickHandler={jest.fn()}
        pages={mockPages}
        currentPage={7}
        range={10}
      />,
    );

    const nextPage = getLastPageButton(wrapper);
    expect(nextPage.prop('disabled')).toBeTruthy();
  });

  it('should invoke onClickHandler when clicked', () => {
    const mockClickHandler = jest.fn();

    const wrapper = mount(
      <PaginationControls
        onClickHandler={mockClickHandler}
        pages={mockPages}
        currentPage={7}
        range={10}
      />,
    );

    wrapper.find('PageButton').first().find('button').simulate('click');

    expect(mockClickHandler).toHaveBeenCalled();
  });

  it('render buttons within range', () => {
    const mockClickHandler = jest.fn();
    const pages = Array.from(Array(20), (x, i) => i + 1);

    const wrapper = mount(
      <PaginationControls
        onClickHandler={mockClickHandler}
        pages={pages}
        currentPage={1}
        range={10}
      />,
    );

    const pageButtons = wrapper
      .find('PageButton')
      .not('[first]')
      .not('[last]');

    // Should
    pageButtons.forEach((e, idx) => {
      expect(e.text()).toEqual(String(idx + 1));
    });

    // Should have ten page buttons.
    expect(pageButtons).toHaveLength(10);
  });
});
