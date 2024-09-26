import * as React from 'react';

import { databaseFactory } from 'src/factories/databases';
import { renderWithTheme } from 'src/utilities/testHelpers';

import DatabaseSettings from './DatabaseSettings';

describe('DatabaseSettings Component', () => {
  const database = databaseFactory.build();
  it('Should exist and be renderable', () => {
    expect(DatabaseSettings).toBeDefined();
    renderWithTheme(<DatabaseSettings database={database} />);
  });

  it('Should render a Paper component with headers for Access Controls, Reseting the Root password, and Deleting the Cluster', () => {
    const { container, getAllByRole } = renderWithTheme(
      <DatabaseSettings database={database} />
    );
    const paper = container.querySelector('.MuiPaper-root');
    expect(paper).not.toBeNull();
    const headings = getAllByRole('heading');
    expect(headings[0].textContent).toBe('Access Controls');
    expect(headings[1].textContent).toBe('Reset Root Password');
    expect(headings[2].textContent).toBe('Delete Cluster');
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
    const button3 = getByRole('button', { name: 'Manage Access Controls' });

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
});
