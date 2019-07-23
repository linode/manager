import * as React from 'react';
import { cleanup, render } from 'react-testing-library';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import {
  CombinedProps as PageNumbersProps,
  PageNumbers,
  pageNumbersToRender
} from './PageNumbers';

window.matchMedia = jest.fn().mockImplementation(query => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn()
  };
});

const props: PageNumbersProps = {
  classes: { ellipses: '', ellipsesInner: '' },
  numOfPages: 4,
  currentPage: 1,
  handlePageClick: jest.fn()
};
afterEach(cleanup);

describe('PageNumbers', () => {
  it('should render all pages when numOfPages <= 6', () => {
    const { queryByTestId, rerender } = render(
      wrapWithTheme(<PageNumbers {...props} numOfPages={3} />)
    );
    ['1', '2', '3'].forEach(pageNumber => {
      expect(queryByTestId(pageNumber)).toBeInTheDocument();
    });

    rerender(wrapWithTheme(<PageNumbers {...props} numOfPages={6} />));
    ['1', '2', '3', '4', '6'].forEach(pageNumber => {
      expect(queryByTestId(pageNumber)).toBeInTheDocument();
    });
  });

  it('should always render the first and last page numbers', () => {
    const { queryByTestId } = render(
      wrapWithTheme(<PageNumbers {...props} numOfPages={11} />)
    );
    expect(queryByTestId('1')).toBeInTheDocument();
    expect(queryByTestId('11')).toBeInTheDocument();
  });

  describe('with many pages', () => {
    it('should render first 5 pages if the currentPage is < 5 ', () => {
      const { queryByTestId } = render(
        wrapWithTheme(
          <PageNumbers {...props} numOfPages={11} currentPage={4} />
        )
      );
      ['1', '2', '3', '4', '5'].forEach(pageNumber => {
        expect(queryByTestId(pageNumber)).toBeInTheDocument();
      });
      expect(queryByTestId('6')).not.toBeInTheDocument();
      expect(queryByTestId('trailing-ellipsis')).toBeInTheDocument();
    });
  });

  it('should render last 5 pages if the currentPage < (numPages-3)', () => {
    const { queryByTestId } = render(
      wrapWithTheme(<PageNumbers {...props} numOfPages={11} currentPage={8} />)
    );
    expect(queryByTestId('leading-ellipsis')).toBeInTheDocument();
    expect(queryByTestId('6')).not.toBeInTheDocument();
    ['7', '8', '9', '10', '11'].forEach(pageNumber => {
      expect(queryByTestId(pageNumber)).toBeInTheDocument();
    });
  });

  it('should show 4 surrounding pages if currentPage is in the middle', () => {
    const { queryByTestId } = render(
      wrapWithTheme(<PageNumbers {...props} numOfPages={11} currentPage={7} />)
    );
    expect(queryByTestId('leading-ellipsis')).toBeInTheDocument();
    expect(queryByTestId('4')).not.toBeInTheDocument();
    ['5', '6', '7', '8', '9'].forEach(pageNumber => {
      expect(queryByTestId(pageNumber)).toBeInTheDocument();
    });
    expect(queryByTestId('10')).not.toBeInTheDocument();
    expect(queryByTestId('trailing-ellipsis')).toBeInTheDocument();
  });
});

describe('pageNumbersToRender', () => {
  it('should return pages 1 through 5', () => {
    const page3 = pageNumbersToRender(3, 100);
    const page4 = pageNumbersToRender(4, 105);
    const page0 = pageNumbersToRender(0, 10045);

    const arrOf5 = [1, 2, 3, 4, 5];

    expect(page3).toEqual(arrOf5);
    expect(page4).toEqual(arrOf5);
    expect(page0).toEqual(arrOf5);
  });

  it('should return last 5 pages', () => {
    const page34 = pageNumbersToRender(34, 35);
    const page73 = pageNumbersToRender(73, 76);

    expect(page34).toEqual([31, 32, 33, 34, 35]);
    expect(page73).toEqual([72, 73, 74, 75, 76]);
  });

  it('should return 2 pages above and 2 pages below current page', () => {
    const page82 = pageNumbersToRender(82, 800);
    const page93 = pageNumbersToRender(93, 10000);

    expect(page82).toEqual([80, 81, 82, 83, 84]);
    expect(page93).toEqual([91, 92, 93, 94, 95]);
  });
});
