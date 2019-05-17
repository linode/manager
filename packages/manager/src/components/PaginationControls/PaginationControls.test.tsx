import { mount, ReactWrapper } from 'enzyme';
import * as React from 'react';

import LinodeThemeWrapper from 'src/LinodeThemeWrapper';

import PaginationControls from './PaginationControls';

const getPreviousPageButton = (wrapper: ReactWrapper) =>
  wrapper.find(`WithStyles(PageButton)[data-qa-page-previous]`);
const getNextPageButton = (wrapper: ReactWrapper) =>
  wrapper.find(`WithStyles(PageButton)[data-qa-page-next]`);
const getNumberPageButton = (page: string, wrapper: ReactWrapper) =>
  wrapper.find(`WithStyles(PageButton)[data-qa-page-to=${page}]`);

describe('PaginationControls', () => {
  it('should have a previous page button.', () => {
    const wrapper = mount(
      <LinodeThemeWrapper>
        <PaginationControls
          onClickHandler={jest.fn()}
          count={100}
          page={1}
          pageSize={25}
        />
      </LinodeThemeWrapper>
    );
    const previous = getPreviousPageButton(wrapper);
    expect(previous).toHaveLength(1);
  });

  it('should have a next page button.', () => {
    const wrapper = mount(
      <LinodeThemeWrapper>
        <PaginationControls
          onClickHandler={jest.fn()}
          count={100}
          page={1}
          pageSize={25}
        />
      </LinodeThemeWrapper>
    );
    const next = getNextPageButton(wrapper);
    expect(next).toHaveLength(1);
  });

  it('previous page button should be disabled when on first page', () => {
    const wrapper = mount(
      <LinodeThemeWrapper>
        <PaginationControls
          onClickHandler={jest.fn()}
          count={100}
          page={1}
          pageSize={25}
        />
      </LinodeThemeWrapper>
    );
    const previous = getPreviousPageButton(wrapper);
    expect(previous.prop('disabled')).toBeTruthy();
  });

  it('next page button should be disabled when on last page', () => {
    const wrapper = mount(
      <LinodeThemeWrapper>
        <PaginationControls
          onClickHandler={jest.fn()}
          count={100}
          page={4}
          pageSize={25}
        />
      </LinodeThemeWrapper>
    );

    const next = getNextPageButton(wrapper);
    expect(next.prop('disabled')).toBeTruthy();
  });

  it('should render a button for each page', () => {
    const wrapper = mount(
      <LinodeThemeWrapper>
        <PaginationControls
          onClickHandler={jest.fn()}
          count={100}
          page={1}
          pageSize={25}
        />
      </LinodeThemeWrapper>
    );

    expect(getNumberPageButton('1', wrapper)).toHaveLength(1);
    expect(getNumberPageButton('2', wrapper)).toHaveLength(1);
    expect(getNumberPageButton('3', wrapper)).toHaveLength(1);
    expect(getNumberPageButton('4', wrapper)).toHaveLength(1);
  });

  it('should render a button for each page', () => {
    const wrapper = mount(
      <LinodeThemeWrapper>
        <PaginationControls
          onClickHandler={jest.fn()}
          count={100}
          page={2}
          pageSize={25}
        />
      </LinodeThemeWrapper>
    );

    expect(getNumberPageButton('2', wrapper).prop('disabled')).toBeTruthy();
  });
});
