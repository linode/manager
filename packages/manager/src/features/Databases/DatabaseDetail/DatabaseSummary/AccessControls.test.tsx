import { screen } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';
import { databaseFactory } from 'src/factories';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';
import AccessControls from './AccessControls';

const queryClient = new QueryClient();

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

describe('Access Controls', () => {
  it('Should have a warning notice appear if there are no IPs allow listed', () => {
    const database = databaseFactory.build({ allow_list: [] });

    renderWithTheme(<AccessControls database={database} />);

    expect(screen.getByTestId('notice-no-access-controls')).toBeInTheDocument();
  });

  it('Should not have a warning notice appear if there are IPs allow listed', () => {
    const database = databaseFactory.build();

    renderWithTheme(<AccessControls database={database} />);

    expect(
      screen.queryByText(
        'Warning: your cluster is open to all incoming connections.'
      )
    ).not.toBeInTheDocument();
  });

  it('Should have a Remove button for each IP listed in the table', () => {
    // TODO
  });

  it('Should open a confirmation modal when the Remove button is clicked', () => {
    // TODO
  });
});
