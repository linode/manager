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

  it('Should disable buttons if disabled = true', () => {
    const { getByRole, getByTitle } = renderWithTheme(
      <DatabaseSettings database={database} disabled={true} />
    );
    const disabledButtons = ['Reset Root Password', 'Save Changes'];

    for (const buttonTitle of disabledButtons) {
      const button = getByTitle(buttonTitle);
      expect(button).toBeDisabled();
    }
    expect(
      getByRole('button', { name: 'Manage Access Controls' })
    ).toBeDisabled();
  });

  it('Should enable buttons if disabled = false', () => {
    const { getByRole, getByTitle } = renderWithTheme(
      <DatabaseSettings database={database} />
    );

    expect(getByTitle('Reset Root Password')).toBeEnabled();
    expect(
      getByRole('button', { name: 'Manage Access Controls' })
    ).toBeEnabled();
  });
});
