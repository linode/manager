import React from 'react';
import { DatabaseStatusDisplay } from '../DatabaseDetail/DatabaseStatusDisplay';
import { Event } from '@linode/api-v4';
import { Database, DatabaseInstance } from '@linode/api-v4/lib/databases/types';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

beforeAll(() => mockMatchMedia());

describe('DatabaseStatusDisplay component', () => {
  it('renders status correctly when recent event status is "started" or "scheduled"', () => {
    const mockEvent: Event[] = [
      {
        id: 1,
        action: 'database_resize',
        created: '2024-03-11T17:07:03',
        entity: {
          id: 7021,
          type: 'database',
          label: 'db2',
          url: '/v4/databases/postgresql/instances/7024',
        },
        duration: 164,
        percent_complete: 50,
        rate: null,
        read: false,
        seen: false,
        status: 'started',
        time_remaining: null,
        username: null,
        secondary_entity: null,
        message: null,
      },
    ];
    const database: Database | DatabaseInstance = {
      id: 7021,
      label: 'db2',
      type: 'g6-dedicated-2',
      engine: 'postgresql',
      version: '14.6',
      region: 'us-east',
      status: 'resizing',
      port: 5432,
      encrypted: false,
      allow_list: [],
      cluster_size: 3,
      hosts: {
        primary: '',
        secondary: '',
      },
      created: '2024-03-11T15:28:10',
      updated: '2024-03-11T15:30:01',
      total_disk_size_gb: 0,
      used_disk_size_gb: 0,
      updates: {
        frequency: 'weekly',
        duration: 3,
        hour_of_day: 0,
        day_of_week: 0,
        week_of_month: null,
      },
      instance_uri: '/v4/databases/postgresql/instances/7021',
    };
    const { getByText } = renderWithTheme(
      <DatabaseStatusDisplay events={mockEvent} database={database} />
    );

    expect(getByText('Resizing (50%)')).toBeInTheDocument();
  });

  it('renders status correctly when recent event status is not "started" or "scheduled"', () => {
    const mockEvent: Event[] = [
      {
        id: 1,
        action: 'database_resize',
        created: '2024-03-11T17:07:03',
        entity: {
          id: 1,
          type: 'database',
          label: 'db3',
          url: '/v4/databases/postgresql/instances/7024',
        },
        duration: 164,
        percent_complete: 50,
        rate: null,
        read: false,
        seen: false,
        status: 'finished',
        time_remaining: null,
        username: null,
        secondary_entity: null,
        message: null,
      },
    ];
    const database: Database | DatabaseInstance = {
      id: 7021,
      label: 'db2',
      type: 'g6-dedicated-2',
      engine: 'postgresql',
      version: '14.6',
      region: 'us-east',
      status: 'active',
      port: 5432,
      encrypted: false,
      allow_list: [],
      cluster_size: 3,
      hosts: {
        primary: '',
        secondary: '',
      },
      created: '2024-03-11T15:28:10',
      updated: '2024-03-11T15:30:01',
      total_disk_size_gb: 0,
      used_disk_size_gb: 0,
      updates: {
        frequency: 'weekly',
        duration: 3,
        hour_of_day: 0,
        day_of_week: 0,
        week_of_month: null,
      },
      instance_uri: '/v4/databases/postgresql/instances/7021',
    };

    const { getByText } = renderWithTheme(
      <DatabaseStatusDisplay events={mockEvent} database={database} />
    );

    expect(getByText('Active')).toBeInTheDocument();
  });
});
