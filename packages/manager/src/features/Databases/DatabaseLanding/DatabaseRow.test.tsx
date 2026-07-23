import { formatDate } from '@akamai/compute-ui-core/datetime';
import { capitalize } from '@mui/material';
import { DateTime } from 'luxon';
import React from 'react';

import { databaseInstanceFactory } from 'src/factories';
import {
  mockMatchMedia,
  renderWithTheme,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import DatabaseRow from './DatabaseRow';

beforeAll(() => mockMatchMedia());

describe('Database Table Row', () => {
  const handlers = {
    handleDelete: () => null,
    handleManageAccessControls: () => null,
    handleResetPassword: () => null,
    handleSuspend: () => null,
  };

  it('should render a database row', async () => {
    const database = databaseInstanceFactory.build();
    const { getByText } = renderWithTheme(
      wrapWithTableBody(<DatabaseRow database={database} handlers={handlers} />)
    );
    // Check to see if the row rendered some data
    getByText(database.label);
    getByText(formatDate(database.created));
    getByText(capitalize(database.status));
  });

  it('should render a relative time in the created column if the database was created in the last 3 days', async () => {
    const database = databaseInstanceFactory.build({
      created: DateTime.local().minus({ days: 1 }).toISO(),
    });
    const { getByText } = renderWithTheme(
      wrapWithTableBody(<DatabaseRow database={database} handlers={handlers} />)
    );
    // Check to see if the row rendered the relative date
    getByText('1 day ago');
  });
});
