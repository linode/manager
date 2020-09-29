import { render } from '@testing-library/react';

import * as React from 'react';
import { wrapWithTableBody } from 'src/utilities/testHelpers';
import TableContentWrapper from './TableContentWrapper';

const children = [
  <tr key={1}>
    <td>A row!</td>
  </tr>,
  <tr key={2}>
    <td>Another row!</td>
  </tr>
];

describe('TableContentWrapper component', () => {
  it('should render its children if everything is kosher', () => {
    const kosherProps = {
      lastUpdated: 100,
      loading: false,
      length: 1,
      children
    };
    const { getByText } = render(
      wrapWithTableBody(<TableContentWrapper {...kosherProps} />)
    );
    getByText('A row!');
    getByText('Another row!');
  });

  it('should render a loading spinner if loading is true', () => {
    const loadingProps = {
      lastUpdated: 10,
      loading: true,
      length: 100,
      children
    };
    const { getByTestId, queryByText } = render(
      wrapWithTableBody(<TableContentWrapper {...loadingProps} />)
    );

    getByTestId('table-row-loading');
    expect(queryByText('A row!')).not.toBeInTheDocument();
  });

  it('should render an error row if an error is provided', () => {
    const mockError = [{ reason: 'API is down' }];
    const errorProps = {
      loading: false,
      lastUpdated: 0,
      length: 0,
      error: mockError,
      children
    };

    const { getByTestId, getByText, queryByText } = render(
      wrapWithTableBody(<TableContentWrapper {...errorProps} />)
    );
    getByTestId('table-row-error');
    getByText('API is down');
    expect(queryByText('A row!')).not.toBeInTheDocument();
  });

  it("should render an empty state if there's no data", () => {
    const emptyProps = {
      loading: false,
      lastUpdated: 10,
      length: 0,
      children
    };

    const { getByText, queryByText } = render(
      wrapWithTableBody(<TableContentWrapper {...emptyProps} />)
    );
    getByText(/no data to display/i);
    expect(queryByText('A row!')).not.toBeInTheDocument();
  });

  it('should use the emptyMessage if provided', () => {
    const emptyProps = {
      loading: false,
      lastUpdated: 10,
      length: 0,
      emptyMessage: 'Nothing to see here',
      children
    };

    const { getByText } = render(
      wrapWithTableBody(<TableContentWrapper {...emptyProps} />)
    );
    getByText(emptyProps.emptyMessage);
  });
});
