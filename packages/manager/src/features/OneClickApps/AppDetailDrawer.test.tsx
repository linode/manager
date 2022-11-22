import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import AppDetailDrawer from './AppDetailDrawer';

describe('AppDetailDrawer component', () => {
  it("should have a title ending in 'Cluster' if the app is a cluster", () => {
    const { queryByTestId } = renderWithTheme(
      <AppDetailDrawer
        open={true}
        onClose={() => {}}
        stackScriptLabel="MongoDB Cluster "
      />
    );

    const innerHTML = queryByTestId('app-name')?.innerHTML;
    expect(innerHTML).toBe('MongoDB Cluster');
  });

  it("should not have a title ending in 'Cluster' if the app is not a cluster", () => {
    const { queryByTestId } = renderWithTheme(
      <AppDetailDrawer
        open={true}
        onClose={() => {}}
        stackScriptLabel="MongoDB "
      />
    );

    const innerHTML = queryByTestId('app-name')?.innerHTML;
    expect(innerHTML).toBe('MongoDB');
  });

  it('should not logically break if the stackScriptLabel for a cluster does not have the expected spaces', () => {
    const { queryByTestId } = renderWithTheme(
      <AppDetailDrawer
        open={true}
        onClose={() => {}}
        stackScriptLabel="MongoDB Cluster"
      />
    );

    const innerHTML = queryByTestId('app-name')?.innerHTML;
    expect(innerHTML).toBe('MongoDB Cluster');
  });
});
