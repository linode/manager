import * as React from 'react';

import { databaseFactory } from 'src/factories/databases';
import {
  getShadowRootElement,
  mockMatchMedia,
  renderWithTheme,
} from 'src/utilities/testHelpers';

import * as utils from '../../utilities';
import { DatabaseDetailContext } from '../DatabaseDetailContext';
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

const engine = 'mysql';

const spy = vi.spyOn(utils, 'useIsDatabasesEnabled');
spy.mockReturnValue(v2GA());

describe('DatabaseSettings Component', () => {
  const database = databaseFactory.build({ platform: 'rdbms-default' });
  it('Should exist and be renderable', async () => {
    expect(DatabaseSettings).toBeDefined();
    renderWithTheme(
      <DatabaseDetailContext.Provider value={{ database, engine }}>
        <DatabaseSettings />
      </DatabaseDetailContext.Provider>
    );
  });

  it('should render a Paper component with headers for Manage Access, Resetting the Root password, and Deleting the Cluster', async () => {
    spy.mockReturnValue(v2GA());
    const { container, getAllByRole } = renderWithTheme(
      <DatabaseDetailContext.Provider value={{ database, engine }}>
        <DatabaseSettings />
      </DatabaseDetailContext.Provider>
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
    const { getAllByRole } = renderWithTheme(
      <DatabaseDetailContext.Provider
        value={{ database: defaultDatabase, engine }}
      >
        <DatabaseSettings />,
      </DatabaseDetailContext.Provider>,
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
    const { getAllByRole } = renderWithTheme(
      <DatabaseDetailContext.Provider
        value={{ database: legacyDatabase, engine }}
      >
        <DatabaseSettings />,
      </DatabaseDetailContext.Provider>,
      { flags: { databaseVpc: true } }
    );
    const headings = getAllByRole('heading');
    expect(headings[0].textContent).toBe('Manage Access');
  });

  it.each([
    ['disable', true],
    ['enable', false],
  ])('should %s buttons when disabled is %s', async (_, isDisabled) => {
    const { getByTestId } = renderWithTheme(
      <DatabaseDetailContext.Provider
        value={{ database, engine, disabled: isDisabled }}
      >
        <DatabaseSettings />
      </DatabaseDetailContext.Provider>
    );

    const resetPasswordButtonHost = getByTestId(
      'settings-button-Reset Root Password'
    );
    const resetPasswordButton = await getShadowRootElement(
      resetPasswordButtonHost,
      'button'
    );

    const manageAccessButtonHost = getByTestId('button-access-control');
    const manageAccessButton = await getShadowRootElement(
      manageAccessButtonHost,
      'button'
    );

    if (isDisabled) {
      expect(resetPasswordButton).toBeDisabled();
      expect(manageAccessButton).toBeDisabled();
    } else {
      expect(resetPasswordButton).toBeEnabled();
      expect(manageAccessButton).toBeEnabled();
    }
  });

  it('should not render Maintenance for V1 view legacy db', async () => {
    spy.mockReturnValue(v1());

    const database = databaseFactory.build({
      engine: 'postgresql',
      platform: 'rdbms-legacy',
      version: '14.6',
    });

    const { container } = renderWithTheme(
      <DatabaseDetailContext.Provider value={{ database, engine }}>
        <DatabaseSettings />
      </DatabaseDetailContext.Provider>
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

    const { container } = renderWithTheme(
      <DatabaseDetailContext.Provider value={{ database, engine }}>
        <DatabaseSettings />
      </DatabaseDetailContext.Provider>
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

    const { container } = renderWithTheme(
      <DatabaseDetailContext.Provider value={{ database, engine }}>
        <DatabaseSettings />
      </DatabaseDetailContext.Provider>
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

    const { container } = renderWithTheme(
      <DatabaseDetailContext.Provider value={{ database, engine }}>
        <DatabaseSettings />
      </DatabaseDetailContext.Provider>
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

    const { container } = renderWithTheme(
      <DatabaseDetailContext.Provider value={{ database, engine }}>
        <DatabaseSettings />
      </DatabaseDetailContext.Provider>
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
    const { getByRole, queryByText } = renderWithTheme(
      <DatabaseDetailContext.Provider value={{ database, engine }}>
        <DatabaseSettings />
      </DatabaseDetailContext.Provider>
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
    const { queryByText } = renderWithTheme(
      <DatabaseDetailContext.Provider value={{ database, engine }}>
        <DatabaseSettings />
      </DatabaseDetailContext.Provider>
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

    const { container, getAllByRole } = renderWithTheme(
      <DatabaseDetailContext.Provider
        value={{ database: mockNewDatabase, engine }}
      >
        <DatabaseSettings />
      </DatabaseDetailContext.Provider>,
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

    const { getByTestId } = renderWithTheme(
      <DatabaseDetailContext.Provider
        value={{ database: mockNewDatabase, engine }}
      >
        <DatabaseSettings />
      </DatabaseDetailContext.Provider>,
      { flags }
    );

    const suspendClusterButtonHost = getByTestId(
      'settings-button-Suspend Cluster'
    );
    const suspendClusterButton = await getShadowRootElement(
      suspendClusterButtonHost,
      'button'
    );

    expect(suspendClusterButton).toBeDisabled();
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

    const { getByTestId } = renderWithTheme(
      <DatabaseDetailContext.Provider
        value={{ database: mockNewDatabase, engine }}
      >
        <DatabaseSettings />
      </DatabaseDetailContext.Provider>,
      { flags }
    );

    const suspendClusterButtonHost = getByTestId(
      'settings-button-Suspend Cluster'
    );
    const suspendClusterButton = await getShadowRootElement(
      suspendClusterButtonHost,
      'button'
    );

    expect(suspendClusterButton).toBeEnabled();
  });
});
