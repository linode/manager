import * as React from 'react';

import { databaseFactory } from 'src/factories/databases';
import {
  mockMatchMedia,
  renderWithThemeAndRouter,
} from 'src/utilities/testHelpers';

import * as utils from '../../utilities';
import DatabaseSettings from './DatabaseSettings';

beforeAll(() => mockMatchMedia());

const v1 = () => {
  return {
    isDatabasesEnabled: true,
    isDatabasesV1Enabled: true,
    isDatabasesV2Beta: false,
    isDatabasesV2Enabled: false,
    isDatabasesV2GA: false,
    isUserExistingBeta: false,
    isUserNewBeta: false,
  };
};

const v2Beta = () => {
  return {
    isDatabasesEnabled: true,
    isDatabasesV1Enabled: true,
    isDatabasesV2Beta: true,
    isDatabasesV2Enabled: true,
    isDatabasesV2GA: false,
    isUserExistingBeta: false,
    isUserNewBeta: true,
  };
};

const v2GA = () => ({
  isDatabasesEnabled: true,
  isDatabasesV1Enabled: true,
  isDatabasesV2Beta: false,
  isDatabasesV2Enabled: true,
  isDatabasesV2GA: true,
  isUserExistingBeta: false,
  isUserNewBeta: false,
});

const spy = vi.spyOn(utils, 'useIsDatabasesEnabled');
spy.mockReturnValue(v2GA());

describe('DatabaseSettings Component', () => {
  const database = databaseFactory.build({ platform: 'rdbms-default' });
  it('Should exist and be renderable', async () => {
    expect(DatabaseSettings).toBeDefined();
    await renderWithThemeAndRouter(<DatabaseSettings database={database} />);
  });

  it('should render a Paper component with headers for Manage Access, Resetting the Root password, and Deleting the Cluster', async () => {
    spy.mockReturnValue(v2GA());
    const { container, getAllByRole } = await renderWithThemeAndRouter(
      <DatabaseSettings database={database} />
    );
    const paper = container.querySelector('.MuiPaper-root');
    expect(paper).not.toBeNull();
    const headings = getAllByRole('heading');
    expect(headings[0].textContent).toBe('Suspend Cluster');
    expect(headings[1].textContent).toBe('Manage Access');
    expect(headings[2].textContent).toBe('Reset the Root Password');
    expect(headings[3].textContent).toBe('Delete the Cluster');
  });

  it('should not render Manage Access for a default database when databaseVpc flag is enabled', async () => {
    spy.mockReturnValue(v2GA());
    const defaultDatabase = databaseFactory.build({
      platform: 'rdbms-default',
    });
    const { getAllByRole } = await renderWithThemeAndRouter(
      <DatabaseSettings database={defaultDatabase} />,
      { flags: { databaseVpc: true } }
    );
    const headings = getAllByRole('heading');
    expect(headings[1].textContent).not.toBe('Manage Access');
  });

  it('should render Manage Access for a legacy database when databaseVpc flag is enabled', async () => {
    spy.mockReturnValue(v2GA());
    const legacyDatabase = databaseFactory.build({
      platform: 'rdbms-legacy',
    });
    const { getAllByRole } = await renderWithThemeAndRouter(
      <DatabaseSettings database={legacyDatabase} />,
      { flags: { databaseVpc: true } }
    );
    const headings = getAllByRole('heading');
    expect(headings[0].textContent).toBe('Manage Access');
  });

  it.each([
    ['disable', true],
    ['enable', false],
  ])('should %s buttons when disabled is %s', async (_, isDisabled) => {
    const { getByRole, getByTitle } = await renderWithThemeAndRouter(
      <DatabaseSettings database={database} disabled={isDisabled} />
    );
    const button1 = getByTitle('Reset Root Password');
    const button2 = getByTitle('Save Changes');
    const button3 = getByRole('button', { name: 'Manage Access' });

    if (isDisabled) {
      expect(button1).toBeDisabled();
      expect(button2).toBeDisabled();
      expect(button3).toBeDisabled();
    } else {
      expect(button1).toBeEnabled();
      expect(button3).toBeEnabled();
    }
  });

  it('should not render Maintenance for V1 view legacy db', async () => {
    spy.mockReturnValue(v1());

    const database = databaseFactory.build({
      engine: 'postgresql',
      platform: 'rdbms-legacy',
      version: '14.6',
    });

    const { container } = await renderWithThemeAndRouter(
      <DatabaseSettings database={database} />
    );

    const maintenance = container.querySelector(
      '[data-qa-settings-section="Maintenance"]'
    );

    expect(maintenance).not.toBeInTheDocument();
  });

  it('should not render Maintenance for V2 beta view legacy db', async () => {
    spy.mockReturnValue(v2Beta());

    const database = databaseFactory.build({
      engine: 'postgresql',
      platform: 'rdbms-legacy',
      version: '14.6',
    });

    const { container } = await renderWithThemeAndRouter(
      <DatabaseSettings database={database} />
    );

    const maintenance = container.querySelector(
      '[data-qa-settings-section="Maintenance"]'
    );

    expect(maintenance).not.toBeInTheDocument();
  });

  it('should not render Maintenance for V2 beta view default db', async () => {
    spy.mockReturnValue(v2Beta());

    const database = databaseFactory.build({
      engine: 'postgresql',
      platform: 'rdbms-default',
      version: '14.6',
    });

    const { container } = await renderWithThemeAndRouter(
      <DatabaseSettings database={database} />
    );

    const maintenance = container.querySelector(
      '[data-qa-settings-section="Maintenance"]'
    );

    expect(maintenance).not.toBeInTheDocument();
  });

  it('should not render Maintenance for V2 GA view legacy db', async () => {
    spy.mockReturnValue(v2GA());

    const database = databaseFactory.build({
      engine: 'postgresql',
      platform: 'rdbms-legacy',
      version: '14.6',
    });

    const { container } = await renderWithThemeAndRouter(
      <DatabaseSettings database={database} />
    );

    const maintenance = container.querySelector(
      '[data-qa-settings-section="Maintenance"]'
    );

    expect(maintenance).not.toBeInTheDocument();
  });

  it('should render Maintenance for V2 GA view default db', async () => {
    spy.mockReturnValue(v2GA());

    const database = databaseFactory.build({
      engine: 'postgresql',
      platform: 'rdbms-default',
      version: '14.6',
    });

    const { container } = await renderWithThemeAndRouter(
      <DatabaseSettings database={database} />
    );

    const maintenance = container.querySelector(
      '[data-qa-settings-section="Maintenance"]'
    );

    expect(maintenance).toBeInTheDocument();
  });

  it('Should render Maintenance Window with radio buttons', async () => {
    const database = databaseFactory.build({
      platform: 'rdbms-legacy',
    });
    const { getByRole, queryByText } = await renderWithThemeAndRouter(
      <DatabaseSettings database={database} />
    );
    const radioInput = getByRole('radiogroup');
    expect(radioInput).toHaveTextContent('Monthly');
    expect(radioInput).toHaveTextContent('Weekly');
    expect(queryByText('Maintenance Window')).toBeTruthy();
  });

  it('Should render Weekly Maintenance Window', async () => {
    const database = databaseFactory.build({
      platform: 'rdbms-default',
    });
    const { queryByText } = await renderWithThemeAndRouter(
      <DatabaseSettings database={database} />
    );

    expect(queryByText('Monthly')).toBeNull();
    expect(queryByText('Weekly')).toBeNull();
    expect(queryByText('Set a Weekly Maintenance Window')).toBeTruthy();
  });

  it('should render suspend option when isDatabasesV2GA flag is true', async () => {
    const flags = {
      dbaasV2: {
        beta: false,
        enabled: true,
      },
    };
    const mockNewDatabase = databaseFactory.build({
      platform: 'rdbms-default',
    });

    const spy = vi.spyOn(utils, 'useIsDatabasesEnabled');
    spy.mockReturnValue({
      isDatabasesEnabled: true,
      isDatabasesV2Beta: false,
      isDatabasesV2Enabled: true,
      isDatabasesV2GA: true,
      isUserExistingBeta: false,
      isUserNewBeta: false,
    });

    const { container, getAllByRole } = await renderWithThemeAndRouter(
      <DatabaseSettings database={mockNewDatabase} />,
      { flags }
    );
    const paper = container.querySelector('.MuiPaper-root');
    expect(paper).not.toBeNull();
    const headings = getAllByRole('heading');

    expect(headings[0].textContent).toBe('Suspend Cluster');
    expect(headings[1].textContent).toBe('Manage Access');
    expect(headings[2].textContent).toBe('Reset the Root Password');
    expect(headings[3].textContent).toBe('Delete the Cluster');
  });

  it('should disable suspend when database status is not active', async () => {
    const flags = {
      dbaasV2: {
        beta: false,
        enabled: true,
      },
    };
    const mockNewDatabase = databaseFactory.build({
      platform: 'rdbms-default',
      status: 'resizing',
    });

    const spy = vi.spyOn(utils, 'useIsDatabasesEnabled');
    spy.mockReturnValue({
      isDatabasesEnabled: true,
      isDatabasesV2Beta: false,
      isDatabasesV2Enabled: true,
      isDatabasesV2GA: true,
      isUserExistingBeta: false,
      isUserNewBeta: false,
    });

    const { getAllByText } = await renderWithThemeAndRouter(
      <DatabaseSettings database={mockNewDatabase} />,
      { flags }
    );

    const suspendElements = getAllByText(/Suspend Cluster/i);
    const suspendButton = suspendElements[1].closest('button');
    expect(suspendButton).toHaveAttribute('aria-disabled', 'true');
  });

  it('should enable suspend when database status is active', async () => {
    const flags = {
      dbaasV2: {
        beta: false,
        enabled: true,
      },
    };
    const mockNewDatabase = databaseFactory.build({
      platform: 'rdbms-default',
      status: 'active',
    });

    const spy = vi.spyOn(utils, 'useIsDatabasesEnabled');
    spy.mockReturnValue({
      isDatabasesEnabled: true,
      isDatabasesV2Beta: false,
      isDatabasesV2Enabled: true,
      isDatabasesV2GA: true,
      isUserExistingBeta: false,
      isUserNewBeta: false,
    });

    const { getAllByText } = await renderWithThemeAndRouter(
      <DatabaseSettings database={mockNewDatabase} />,
      { flags }
    );

    const suspendElements = getAllByText(/Suspend Cluster/i);
    const suspendButton = suspendElements[1].closest('button');
    expect(suspendButton).toHaveAttribute('aria-disabled', 'false');
  });
});
