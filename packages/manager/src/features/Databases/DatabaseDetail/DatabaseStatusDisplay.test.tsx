import React from 'react';
import { DatabaseStatusDisplay } from '../DatabaseDetail/DatabaseStatusDisplay';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';
import { databaseFactory } from 'src/factories';
import { entityFactory, eventFactory } from 'src/factories/events';
beforeAll(() => mockMatchMedia());

describe('DatabaseStatusDisplay component', () => {
  it(`renders status 'resizing' with percentage when recent event status is 'started' or 'scheduled'`, () => {
    const mockEvent = eventFactory.build({
      action: 'database_resize',
      percent_complete: 50,
      entity: entityFactory.build({ id: 1, type: 'database' }),
    });
    const database = databaseFactory.build({ id: 1, status: 'resizing' });

    const { getByText } = renderWithTheme(
      <DatabaseStatusDisplay events={[mockEvent]} database={database} />
    );
    expect(getByText('Resizing (50%)')).toBeInTheDocument();
  });

  it(`renders status 'active' when recent event status is 'finished' `, () => {
    const mockEvent = eventFactory.build({
      action: 'database_resize',
      status: 'finished',
      entity: entityFactory.build({ id: 1, type: 'database' }),
    });
    const database = databaseFactory.build({ id: 1, status: 'active' });

    const { getByText } = renderWithTheme(
      <DatabaseStatusDisplay events={[mockEvent]} database={database} />
    );

    expect(getByText('Active')).toBeInTheDocument();
  });
});
