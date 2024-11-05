import * as React from 'react';

import { databaseFactory } from 'src/factories/databases';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import DatabaseSettings from './DatabaseSettings';
import * as utils from '../../utilities';

beforeAll(() => mockMatchMedia());

describe('DatabaseSettings Component', () => {
  const database = databaseFactory.build();
  it('Should exist and be renderable', () => {
    expect(DatabaseSettings).toBeDefined();
    renderWithTheme(<DatabaseSettings database={database} />);
  });

  it('Should render a Paper component with headers for Manage Access, Reseting the Root password, and Deleting the Cluster', () => {
    const { container, getAllByRole } = renderWithTheme(
      <DatabaseSettings database={database} />
    );
    const paper = container.querySelector('.MuiPaper-root');
    expect(paper).not.toBeNull();
    const headings = getAllByRole('heading');
    expect(headings[0].textContent).toBe('Manage Access');
    expect(headings[1].textContent).toBe('Reset the Root Password');
    expect(headings[2].textContent).toBe('Delete the Cluster');
  });

  it.each([
    ['disable', true],
    ['enable', false],
  ])('should %s buttons when disabled is %s', (_, isDisabled) => {
    const { getByRole, getByTitle } = renderWithTheme(
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

  it('Should render Maintenance Window with radio buttons', () => {
    const database = databaseFactory.build({
      platform: 'rdbms-legacy',
    });
    const { getByRole, queryByText } = renderWithTheme(
      <DatabaseSettings database={database} />
    );
    const radioInput = getByRole('radiogroup');
    expect(radioInput).toHaveTextContent('Monthly');
    expect(radioInput).toHaveTextContent('Weekly');
    expect(queryByText('Maintenance Window')).toBeTruthy();
  });

  it('Should render Weekly Maintenance Window', () => {
    const database = databaseFactory.build({
      platform: 'rdbms-default',
    });
    const { queryByText } = renderWithTheme(
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

    const { container, getAllByRole } = renderWithTheme(
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

    const { getAllByText } = renderWithTheme(
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

    const { getAllByText } = renderWithTheme(
      <DatabaseSettings database={mockNewDatabase} />,
      { flags }
    );

    const suspendElements = getAllByText(/Suspend Cluster/i);
    const suspendButton = suspendElements[1].closest('button');
    expect(suspendButton).toHaveAttribute('aria-disabled', 'false');
  });
});
