import * as React from 'react';

import { databaseFactory } from 'src/factories/databases';
import {
  getShadowRootElement,
  mockMatchMedia,
  renderWithTheme,
} from 'src/utilities/testHelpers';

import { DatabaseDetailContext } from '../DatabaseDetailContext';
import DatabaseSettings from './DatabaseSettings';

beforeAll(() => mockMatchMedia());

describe('DatabaseSettings Component', () => {
  const database = databaseFactory.build({ platform: 'rdbms-default' });

  it('Should exist and be renderable', async () => {
    expect(DatabaseSettings).toBeDefined();
    renderWithTheme(
      <DatabaseDetailContext.Provider value={{ database }}>
        <DatabaseSettings />
      </DatabaseDetailContext.Provider>
    );
  });

  it('should render a Paper component with headers for Suspending Cluster, Resetting the Root password, and Deleting the Cluster', async () => {
    const { getAllByRole, getByTestId } = renderWithTheme(
      <DatabaseDetailContext.Provider value={{ database }}>
        <DatabaseSettings />
      </DatabaseDetailContext.Provider>
    );
    const paper = getByTestId('data-qa-paper');
    expect(paper).not.toBeNull();
    const headings = getAllByRole('heading');
    expect(headings[0].textContent).toBe('Suspend Cluster');
    expect(headings[1].textContent).toBe('Reset the Root Password');
    expect(headings[2].textContent).toBe('Delete the Cluster');
  });

  it.each([
    ['disable', true],
    ['enable', false],
  ])('should %s buttons when disabled is %s', async (_, isDisabled) => {
    const { getByTestId } = renderWithTheme(
      <DatabaseDetailContext.Provider
        value={{ database, disabled: isDisabled }}
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

    if (isDisabled) {
      expect(resetPasswordButton).toBeDisabled();
    } else {
      expect(resetPasswordButton).toBeEnabled();
    }
  });

  it('should render Maintenance for V2 GA view default db', async () => {
    const database = databaseFactory.build({
      engine: 'postgresql',
      version: '14.6',
    });

    const { container } = renderWithTheme(
      <DatabaseDetailContext.Provider value={{ database }}>
        <DatabaseSettings />
      </DatabaseDetailContext.Provider>
    );

    const maintenance = container.querySelector(
      '[data-qa-settings-section="Maintenance"]'
    );

    expect(maintenance).toBeInTheDocument();
  });

  it('Should render Weekly Maintenance Window', async () => {
    const database = databaseFactory.build({});
    const { queryByText } = renderWithTheme(
      <DatabaseDetailContext.Provider value={{ database }}>
        <DatabaseSettings />
      </DatabaseDetailContext.Provider>
    );

    expect(queryByText('Monthly')).toBeNull();
    expect(queryByText('Weekly')).toBeNull();
    expect(queryByText('Set a Weekly Maintenance Window')).toBeTruthy();
  });

  it('should disable suspend when database status is not active', async () => {
    const mockNewDatabase = databaseFactory.build({
      status: 'resizing',
    });

    const { getByTestId } = renderWithTheme(
      <DatabaseDetailContext.Provider value={{ database: mockNewDatabase }}>
        <DatabaseSettings />
      </DatabaseDetailContext.Provider>
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
    const mockNewDatabase = databaseFactory.build({
      status: 'active',
    });

    const { getByTestId } = renderWithTheme(
      <DatabaseDetailContext.Provider value={{ database: mockNewDatabase }}>
        <DatabaseSettings />
      </DatabaseDetailContext.Provider>
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
