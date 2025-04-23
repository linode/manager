import React from 'react';

import { databaseFactory } from 'src/factories';
import { entityFactory, eventFactory } from 'src/factories/events';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseStatusDisplay } from '../DatabaseDetail/DatabaseStatusDisplay';
beforeAll(() => mockMatchMedia());

describe('DatabaseStatusDisplay component', () => {
  it(`should render status 'resizing' with percentage when recent event status is 'started'`, () => {
    const mockEvent = eventFactory.build({
      action: 'database_resize',
      entity: entityFactory.build({ id: 1, type: 'database' }),
      percent_complete: 50,
      status: 'started',
    });
    const database = databaseFactory.build({ id: 1, status: 'resizing' });

    const { getByText } = renderWithTheme(
      <DatabaseStatusDisplay database={database} events={[mockEvent]} />
    );
    expect(getByText('Resizing (50%)')).toBeInTheDocument();
  });

  it(`should render status 'resizing' when recent event status is 'scheduled' `, () => {
    const mockEvent = eventFactory.build({
      action: 'database_resize',
      entity: entityFactory.build({ id: 1, type: 'database' }),
      percent_complete: 50,
      status: 'scheduled',
    });
    const database = databaseFactory.build({ id: 1, status: 'resizing' });

    const { getByText } = renderWithTheme(
      <DatabaseStatusDisplay database={database} events={[mockEvent]} />
    );

    expect(getByText('Resizing (50%)')).toBeInTheDocument();
  });
  it(`should render status 'active' when recent event status is 'finished' `, () => {
    const mockEvent = eventFactory.build({
      action: 'database_resize',
      entity: entityFactory.build({ id: 1, type: 'database' }),
      status: 'finished',
    });
    const database = databaseFactory.build({ id: 1, status: 'active' });

    const { getByText } = renderWithTheme(
      <DatabaseStatusDisplay database={database} events={[mockEvent]} />
    );

    expect(getByText('Active')).toBeInTheDocument();
  });
});
