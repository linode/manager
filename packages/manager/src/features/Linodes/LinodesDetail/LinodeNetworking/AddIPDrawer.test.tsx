import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AddIPDrawer } from './AddIPDrawer';

describe('AddIPDrawer', () => {
  it('should display a warning notice if linodeIsInEdgeRegion is true', () => {
    const { getByTestId } = renderWithTheme(
      <AddIPDrawer
        linodeId={1}
        linodeIsInEdgeRegion={true}
        onClose={() => null}
        open={true}
        readOnly={false}
      />
    );
    expect(getByTestId('notice-warning')).toBeInTheDocument();
  });
  it('should not display a warning notice if linodeIsInEdgeRegion is false', () => {
    const { queryByTestId } = renderWithTheme(
      <AddIPDrawer
        linodeId={1}
        linodeIsInEdgeRegion={false}
        onClose={() => null}
        open={true}
        readOnly={false}
      />
    );
    expect(queryByTestId('notice-warning')).not.toBeInTheDocument();
  });
});
