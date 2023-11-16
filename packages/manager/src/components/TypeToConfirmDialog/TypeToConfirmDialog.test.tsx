import * as React from 'react';

import { Typography } from 'src/components/Typography';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { TypeToConfirmDialog } from './TypeToConfirmDialog';

const props = { onClick: vi.fn(), onClose: vi.fn() };

describe('TypeToConfirmDialog Component', () => {
  const warningText =
    'Deleting your Linode will result in permanent data loss.';

  it('Should render children', () => {
    const { getByText } = renderWithTheme(
      <TypeToConfirmDialog
        entity={{
          action: 'deletion',
          name: 'test',
          primaryBtnText: 'Delete',
          type: 'Linode',
        }}
        label={'Linode Label'}
        loading={false}
        open={true}
        title="Delete Linode test?"
        {...props}
      >
        <Typography style={{ fontSize: '0.875rem' }}>
          <strong>Warning:</strong> {warningText}
        </Typography>
      </TypeToConfirmDialog>
    );
    getByText(warningText);
  });
});
