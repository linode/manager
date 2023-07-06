import * as React from 'react';

import { Typography } from 'src/components/Typography';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { TypeToConfirmDialog } from './TypeToConfirmDialog';

const props = { onClick: jest.fn(), onClose: jest.fn() };

describe('TypeToConfirmDialog Component', () => {
  const warningText =
    'Deleting your Linode will result in permanent data loss.';

  it('Should render children', () => {
    const { getByText } = renderWithTheme(
      <TypeToConfirmDialog
        title="Delete Linode test?"
        label={'Linode Label'}
        open={true}
        entity={{
          type: 'Linode',
          name: 'test',
          action: 'deletion',
          primaryBtnText: 'Delete',
        }}
        loading={false}
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
