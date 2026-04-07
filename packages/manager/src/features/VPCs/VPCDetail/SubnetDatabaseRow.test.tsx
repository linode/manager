import * as React from 'react';

import {
  databaseInstanceFactory,
  subnetAssignedDatabaseDataFactory,
} from 'src/factories';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { SubnetDatabaseRow } from './SubnetDatabaseRow';

import type { DatabaseInstance } from '@linode/api-v4';

const mockIpv6Range = '0000:db1::/32';
const databaseLabel = 'test-database-1';
const mockDatabase = databaseInstanceFactory.build({
  id: 1,
  label: databaseLabel,
});

const mockAssignedDatabase = subnetAssignedDatabaseDataFactory.build({
  id: 1,
  ipv4_range: '1.1.1.1/32',
  ipv6_ranges: [{ range: mockIpv6Range }],
});

describe('SubnetDatabaseRow', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should render SubnetDatabaseRow', () => {
    const dbWithPrimary = {
      ...mockDatabase,
      members: { '2.2.2.2': 'primary' },
    } as DatabaseInstance;

    const { getByText } = renderWithTheme(
      wrapWithTableBody(
        <SubnetDatabaseRow
          assignedDatabase={mockAssignedDatabase}
          database={dbWithPrimary}
        />
      )
    );
    getByText(databaseLabel);
    getByText(mockAssignedDatabase.ipv4_range);
    getByText(mockIpv6Range);
    getByText('2.2.2.2');
  });

  it('should render SubnetDatabaseRow with multiple failover IPs', () => {
    const dbWithFailovers = {
      ...mockDatabase,
      members: {
        '2.2.2.2': 'primary',
        '2.2.2.3': 'failover',
        '2.2.2.4': 'failover',
      },
    } as DatabaseInstance;

    const { getByText } = renderWithTheme(
      wrapWithTableBody(
        <SubnetDatabaseRow
          assignedDatabase={mockAssignedDatabase}
          database={dbWithFailovers}
        />
      )
    );
    getByText(databaseLabel);
    getByText(mockAssignedDatabase.ipv4_range);
    getByText(mockIpv6Range);
    getByText('2.2.2.2, 2.2.2.3, 2.2.2.4');
  });

  it('should render SubnetDatabaseRow with no members', () => {
    const dbWithNoMembers = {
      ...mockDatabase,
      members: {},
    } as DatabaseInstance;

    const { getByText } = renderWithTheme(
      wrapWithTableBody(
        <SubnetDatabaseRow
          assignedDatabase={mockAssignedDatabase}
          database={dbWithNoMembers}
        />
      )
    );
    getByText(databaseLabel);
    getByText(mockAssignedDatabase.ipv4_range);
    getByText(mockIpv6Range);
    getByText('—');
  });

  it('should render SubnetDatabaseRow with no ipv6 ranges', () => {
    const assignedDatabaseWithNoIpv6 = {
      ...mockAssignedDatabase,
      ipv6_ranges: null,
    };

    const { getByText } = renderWithTheme(
      wrapWithTableBody(
        <SubnetDatabaseRow
          assignedDatabase={assignedDatabaseWithNoIpv6}
          database={mockDatabase}
        />
      )
    );
    getByText(databaseLabel);
    getByText(mockAssignedDatabase.ipv4_range);
    getByText('—');
  });

  it('should render SubnetDatabaseRow with HA cluster', () => {
    const haDatabase = databaseInstanceFactory.build({
      id: 1,
      label: databaseLabel,
      cluster_size: 3,
    });

    const { getByText } = renderWithTheme(
      wrapWithTableBody(
        <SubnetDatabaseRow
          assignedDatabase={mockAssignedDatabase}
          database={haDatabase}
        />
      )
    );
    getByText(databaseLabel);
    getByText('HA');
  });
});
