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
});
