import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { searchbarResult1, searchbarResult2 } from 'src/__data__/searchResults';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ResultGroup } from './ResultGroup';

const props = {
  entity: 'linodes',
  groupSize: 5,
  results: [
    searchbarResult1,
    searchbarResult2,
    searchbarResult1,
    searchbarResult2,
    searchbarResult1,
    searchbarResult2,
  ],
};

const emptyProps = {
  entity: 'linodes',
  groupSize: 5,
  results: [],
};

describe('ResultGroup component', () => {
  it('should render', () => {
    const { container } = renderWithTheme(<ResultGroup {...props} />);
    expect(container.firstChild).toBeInTheDocument();
  });
  it('should return null if there are no results', () => {
    const { container } = renderWithTheme(<ResultGroup {...emptyProps} />);
    expect(container).toBeEmptyDOMElement();
  });
  it('should render the capitalized entity label', () => {
    const { getByText } = renderWithTheme(<ResultGroup {...props} />);
    expect(getByText('Linodes')).toBeInTheDocument();
  });
  it('should render its children', () => {
    const { container } = renderWithTheme(<ResultGroup {...props} />);
    const rows = container.querySelectorAll('[data-qa-result-row]');
    expect(rows).toHaveLength(5);
  });
  describe('Hidden results', () => {
    it('should have a Show All button', () => {
      const { getByText } = renderWithTheme(<ResultGroup {...props} />);
      expect(getByText('Show All')).toBeInTheDocument();
    });
    it('should show hidden results when showMore is true', () => {
      const { container, getByText } = renderWithTheme(
        <ResultGroup {...props} />
      );
      fireEvent.click(getByText('Show All'));
      const rows = container.querySelectorAll('[data-qa-result-row]');
      expect(rows).toHaveLength(6);
    });
    it('should have a Show Less button', () => {
      const { getByText } = renderWithTheme(<ResultGroup {...props} />);
      fireEvent.click(getByText('Show All'));
      expect(getByText('Show Less')).toBeInTheDocument();
    });
  });
});
