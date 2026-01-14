import { screen } from '@testing-library/react';
import * as React from 'react';
import { describe, it } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseConnectionPoolAddDrawer } from './DatabaseConnectionPoolAddDrawer';

const mockProps = {
  databaseId: 123,
  onClose: vi.fn(),
  open: true,
};

// const addPoolButtonTestId = 'add-connection-pool-button';

// Hoist query mocks
const queryMocks = vi.hoisted(() => {
  return {
    useCreateDatabaseConnectionPoolMutation: vi.fn(),
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useCreateDatabaseConnectionPoolMutation:
      queryMocks.useCreateDatabaseConnectionPoolMutation,
  };
});

describe('DatabaseConnectionPoolAddDrawer Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryMocks.useCreateDatabaseConnectionPoolMutation.mockReturnValue({});
    // queryMocks.useCreateDatabaseConnectionPoolMutation.mockReturnValue({
    //   mutateAsync: vi.fn().mockResolvedValue({}),
    //   isLoading: false,
    //   reset: vi.fn(),
    // });
  });

  it('Should render the drawer', () => {
    renderWithTheme(<DatabaseConnectionPoolAddDrawer {...mockProps} />);

    const addPoolDrawerTitle = screen.getByText('Add a New Connection Pool');
    expect(addPoolDrawerTitle).toBeInTheDocument();
  });
});
