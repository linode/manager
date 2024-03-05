import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { BackupsPlaceholder } from './BackupsPlaceholder';

describe('BackupsPlaceholder', () => {
  it('should disable the enable backups button if linodeIsInEdgeRegion is true', () => {
    const { getByTestId } = renderWithTheme(
      <BackupsPlaceholder
        disabled={false}
        linodeId={1}
        linodeIsInEdgeRegion={true}
      />
    );
    expect(getByTestId('placeholder-button')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });
  it('should not disable the enable backups button if linodeIsInEdgeRegion is false', () => {
    const { getByTestId } = renderWithTheme(
      <BackupsPlaceholder
        disabled={false}
        linodeId={1}
        linodeIsInEdgeRegion={false}
      />
    );
    expect(getByTestId('placeholder-button')).toHaveAttribute(
      'aria-disabled',
      'false'
    );
  });
});
