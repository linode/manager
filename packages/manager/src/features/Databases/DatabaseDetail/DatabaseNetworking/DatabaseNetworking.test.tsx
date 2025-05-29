import * as React from 'react';
import { describe, it } from 'vitest';

import { vpcFactory } from 'src/factories';
import { databaseFactory } from 'src/factories/databases';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseNetworking } from './DatabaseNetworking';

// Hoist query mocks
const queryMocks = vi.hoisted(() => ({
  useVPCQuery: vi.fn().mockReturnValue({ data: {} }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useVPCQuery: queryMocks.useVPCQuery,
  };
});

describe('DatabaseNetworking Component', () => {
  const mockProps = {
    database: databaseFactory.build({ platform: 'rdbms-default' }),
    disabled: false,
  };

  beforeEach(() => {
    vi.resetAllMocks();
    queryMocks.useVPCQuery.mockReturnValue({
      data: vpcFactory.build(),
    });
  });

  it('Should render the Manage Access and Manage Networking sections', () => {
    const { getAllByRole } = renderWithTheme(
      <DatabaseNetworking {...mockProps} />
    );
    const headings = getAllByRole('heading');
    expect(headings[0].textContent).toBe('Manage Access');
    expect(headings[1].textContent).toBe('Manage Networking');
  });
});
