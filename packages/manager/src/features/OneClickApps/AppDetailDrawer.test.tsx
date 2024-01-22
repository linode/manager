import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import AppDetailDrawer from './AppDetailDrawer';

describe('AppDetailDrawer component', () => {
  it("should have a title ending in 'Cluster' if the app is a cluster", () => {
    const { queryByTestId } = renderWithTheme(
      <AppDetailDrawer
        onClose={() => {}}
        open={true}
        stackScriptLabel="Galera Cluster "
      />
    );

    const innerHTML = queryByTestId('app-name')?.innerHTML;
    expect(innerHTML).toBe('Galera Cluster');
  });

  it("should not have a title ending in 'Cluster' if the app is not a cluster", () => {
    const { queryByTestId } = renderWithTheme(
      <AppDetailDrawer
        onClose={() => {}}
        open={true}
        stackScriptLabel="Docker "
      />
    );

    const innerHTML = queryByTestId('app-name')?.innerHTML;
    expect(innerHTML).toBe('Docker');
  });

  it('should not logically break if the stackScriptLabel for a cluster does not have the expected spaces', () => {
    const { queryByTestId } = renderWithTheme(
      <AppDetailDrawer
        onClose={() => {}}
        open={true}
        stackScriptLabel="Galera Cluster"
      />
    );

    const innerHTML = queryByTestId('app-name')?.innerHTML;
    expect(innerHTML).toBe('Galera Cluster');
  });
});
