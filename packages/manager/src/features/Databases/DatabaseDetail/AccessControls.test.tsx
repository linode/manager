import { fireEvent, screen } from '@testing-library/react';
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
    const allowList = ['1.1.1.1/32', '2.2.2.2', '3.3.3.3/128'];
    const database = databaseFactory.build({ allow_list: allowList });

    renderWithTheme(<AccessControls database={database} />);

    expect(screen.getAllByText('Remove')).toHaveLength(allowList.length);
  });

  it('Should open a confirmation modal when a Remove button is clicked', () => {
    const database = databaseFactory.build();
    const { getAllByText } = renderWithTheme(
      <AccessControls database={database} />
    );
    const button = getAllByText('Remove')[0];

    fireEvent.click(button);
    expect(
      screen.getByTestId('ip-removal-confirmation-warning')
    ).toBeInTheDocument();
  });
});
