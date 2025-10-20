import React from 'react';

import { databaseFactory } from 'src/factories/databases';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { convertPrivateToPublicHostname } from '../utilities';
import { ConnectionDetailsHostRows } from './ConnectionDetailsHostRows';

import type { Database } from '@linode/api-v4/lib/databases';

const DEFAULT_PRIMARY = 'db-mysql-default-primary.net';
const DEFAULT_STANDBY = 'db-mysql-default-standby.net';

const PRIVATE_PRIMARY = `private-${DEFAULT_PRIMARY}`;
const PRIVATE_STANDBY = `private-${DEFAULT_STANDBY}`;

const LEGACY_PRIMARY = 'db-mysql-legacy-primary.net';
const LEGACY_SECONDARY = 'db-mysql-legacy-secondary.net';

describe('ConnectionDetailsHostRows', () => {
  it('should display Host and Read-only Host fields for a default database with no VPC configured', () => {
    const database = databaseFactory.build({
      hosts: {
        primary: DEFAULT_PRIMARY,
        secondary: undefined,
        standby: DEFAULT_STANDBY,
      },
      platform: 'rdbms-default',
      private_network: null, // No VPC configured, so Host and Read-only Host fields render
    }) as Database;

    const { queryAllByText } = renderWithTheme(
      <ConnectionDetailsHostRows database={database} />
    );

    expect(queryAllByText('Host')).toHaveLength(1);
    expect(queryAllByText(DEFAULT_PRIMARY)).toHaveLength(1);

    expect(queryAllByText('Read-only Host')).toHaveLength(1);
    expect(queryAllByText(DEFAULT_STANDBY)).toHaveLength(1);
  });

  it('should display N/A for default DB with blank read-only Host field', () => {
    const database = databaseFactory.build({
      hosts: {
        primary: DEFAULT_PRIMARY,
        secondary: undefined,
        standby: undefined,
      },
      platform: 'rdbms-default',
    });

    const { queryAllByText } = renderWithTheme(
      <ConnectionDetailsHostRows database={database} />
    );

    expect(queryAllByText('N/A')).toHaveLength(1);
  });

  it('should display Host and Private Network Host rows for legacy db', () => {
    const database = databaseFactory.build({
      hosts: {
        primary: LEGACY_PRIMARY,
        secondary: LEGACY_SECONDARY,
        standby: undefined,
      },
      id: 22,
      platform: 'rdbms-legacy',
      port: 3306,
      ssl_connection: true,
    }) as Database;

    const { queryAllByText } = renderWithTheme(
      <ConnectionDetailsHostRows database={database} />
    );

    expect(queryAllByText('Host')).toHaveLength(1);
    expect(queryAllByText(LEGACY_PRIMARY)).toHaveLength(1);

    expect(queryAllByText('Private Network Host')).toHaveLength(1);
    expect(queryAllByText(LEGACY_SECONDARY)).toHaveLength(1);
  });

  it('should display provisioning text when hosts are not available', () => {
    const database = databaseFactory.build({
      hosts: undefined,
      platform: 'rdbms-default',
    }) as Database;

    const { getByText } = renderWithTheme(
      <ConnectionDetailsHostRows database={database} />
    );

    const hostNameProvisioningText = getByText(
      'Your hostname will appear here once it is available.'
    );

    expect(hostNameProvisioningText).toBeInTheDocument();
  });

  it('should display Private variations of Host and Read-only fields when a VPC is configured with public access set to false', () => {
    const database = databaseFactory.build({
      hosts: {
        primary: PRIVATE_PRIMARY,
        secondary: undefined,
        standby: PRIVATE_STANDBY,
      },
      platform: 'rdbms-default',
      private_network: {
        public_access: false,
        subnet_id: 1,
        vpc_id: 123,
      }, // VPC configuration with public access set to false
    }) as Database;

    const { queryAllByText } = renderWithTheme(
      <ConnectionDetailsHostRows database={database} />
    );
    expect(queryAllByText('Private Host')).toHaveLength(1);
    expect(queryAllByText(PRIVATE_PRIMARY)).toHaveLength(1);
    expect(queryAllByText('Private Read-only Host')).toHaveLength(1);
    expect(queryAllByText(PRIVATE_STANDBY)).toHaveLength(1);
  });

  it('should display Private and Public variations of Host and Read-only Host fields when a VPC is configured with public access set to true', () => {
    const database = databaseFactory.build({
      hosts: {
        primary: PRIVATE_PRIMARY,
        secondary: undefined,
        standby: PRIVATE_STANDBY,
      },
      platform: 'rdbms-default',
      private_network: {
        public_access: true,
        subnet_id: 1,
        vpc_id: 123,
      }, // VPC configuration with public access set to true
    }) as Database;

    const { queryAllByText } = renderWithTheme(
      <ConnectionDetailsHostRows database={database} />
    );
    // Verify that Private and Public Host and Readonly-host fields are rendered
    expect(queryAllByText('Private Host')).toHaveLength(1);
    expect(queryAllByText('Public Host')).toHaveLength(1);
    expect(queryAllByText('Private Read-only Host')).toHaveLength(1);
    expect(queryAllByText('Public Read-only Host')).toHaveLength(1);

    // Verify that the Private hostname is rendered correctly
    expect(queryAllByText(PRIVATE_PRIMARY)).toHaveLength(1);
    // Verify that the Public hostname is rendered correctly
    const expectedPublicHostname = convertPrivateToPublicHostname(
      database.hosts!.primary
    );
    expect(queryAllByText(expectedPublicHostname)).toHaveLength(1);

    // Verify that the Private hostname is rendered correctly
    expect(queryAllByText(PRIVATE_PRIMARY)).toHaveLength(1);
    // Verify that the Public hostname is rendered correctly
    const expectedPublicReadOnlyHostname = convertPrivateToPublicHostname(
      database.hosts!.standby!
    );
    expect(queryAllByText(expectedPublicReadOnlyHostname)).toHaveLength(1);
  });
});
