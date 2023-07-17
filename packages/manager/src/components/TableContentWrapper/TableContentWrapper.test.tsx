import { render } from '@testing-library/react';
import * as React from 'react';

import { wrapWithTableBody } from 'src/utilities/testHelpers';

import { TableContentWrapper } from './TableContentWrapper';

const children = [
  <tr key={1}>
    <td>A row!</td>
  </tr>,
  <tr key={2}>
    <td>Another row!</td>
  </tr>,
];

const customEmptyRow = (
  <tr>
    <td colSpan={4}>
      <div> A custom empty row </div>
    </td>
  </tr>
);

const customRow = (
  <tr>
    <td> A custom row </td>
  </tr>
);

describe('TableContentWrapper component', () => {
  it('should render its children if everything is kosher', () => {
    const kosherProps = {
      children,
      lastUpdated: 100,
      length: 1,
      loading: false,
    };
    const { getByText } = render(
      wrapWithTableBody(<TableContentWrapper {...kosherProps} />)
    );
    getByText('A row!');
    getByText('Another row!');
  });

  it('should render a loading spinner if loading is true', () => {
    const loadingProps = {
      children,
      lastUpdated: 10,
      length: 100,
      loading: true,
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
      children,
      error: mockError,
      lastUpdated: 0,
      length: 0,
      loading: false,
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
      children,
      lastUpdated: 10,
      length: 0,
      loading: false,
    };

    const { getByText, queryByText } = render(
      wrapWithTableBody(<TableContentWrapper {...emptyProps} />)
    );
    getByText(/no data to display/i);
    expect(queryByText('A row!')).not.toBeInTheDocument();
  });

  it('should use the emptyMessage if provided', () => {
    const emptyProps = {
      children,
      emptyMessage: 'Nothing to see here',
      lastUpdated: 10,
      length: 0,
      loading: false,
    };

    const { getByText } = render(
      wrapWithTableBody(<TableContentWrapper {...emptyProps} />)
    );
    getByText(emptyProps.emptyMessage);
  });

  it('should render custom empty row state if it is provided', () => {
    const emptyProps = {
      children,
      length: 0,
      loading: false,
      rowEmptyState: customEmptyRow,
    };

    const { getByText } = render(
      wrapWithTableBody(<TableContentWrapper {...emptyProps} />)
    );
    getByText('A custom empty row');
  });

  it('should render custom row if it is provided', () => {
    const rowProps = {
      children,
      customFirstRow: customRow,
      length: 2,
      loading: false,
    };

    const { getByText } = render(
      wrapWithTableBody(<TableContentWrapper {...rowProps} />)
    );
    getByText('A custom row');
  });
});
