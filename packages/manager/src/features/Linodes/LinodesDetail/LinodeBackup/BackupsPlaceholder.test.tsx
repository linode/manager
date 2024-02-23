import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { BackupsPlaceholder } from './BackupsPlaceholder';

describe('BackupsPlaceholder', () => {
  it('should display a warning notice if linodeIsInEdgeRegion is true and disable the enable backups button', () => {
    const { getByTestId } = renderWithTheme(
      <BackupsPlaceholder
        disabled={false}
        linodeId={1}
        linodeIsInEdgeRegion={true}
      />
    );
    expect(getByTestId('notice-warning')).toBeInTheDocument();
    expect(getByTestId('placeholder-button')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });
  it('should not display a warning notice if linodeIsInEdgeRegion is false and the enable backups button should not be disabled', () => {
    const { getByTestId, queryByTestId } = renderWithTheme(
      <BackupsPlaceholder
        disabled={false}
        linodeId={1}
        linodeIsInEdgeRegion={false}
      />
    );
    expect(queryByTestId('notice-warning')).not.toBeInTheDocument();
    expect(getByTestId('placeholder-button')).toHaveAttribute(
      'aria-disabled',
      'false'
    );
  });
});
