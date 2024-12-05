import { Typography } from '@linode/ui';
import { fireEvent } from '@testing-library/react';
import * as React from 'react';

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

  it('should have its button disabled by default', () => {
    const { getByTestId } = renderWithTheme(
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

    const submitButton = getByTestId('confirm');
    expect(submitButton).toBeDisabled();

    const input = getByTestId('textfield-input');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(submitButton).toBeEnabled();
  });

  it('should disabled the Type To Confirm input field given the `disableTypeToConfirmInput` prop', () => {
    const { getByTestId } = renderWithTheme(
      <TypeToConfirmDialog
        entity={{
          action: 'deletion',
          name: 'test',
          primaryBtnText: 'Delete',
          type: 'Linode',
        }}
        disableTypeToConfirmInput
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

    const input = getByTestId('textfield-input');
    expect(input).toBeDisabled();
  });

  it('should disabled the Type To Confirm input field given the prop', () => {
    const { getByTestId } = renderWithTheme(
      <TypeToConfirmDialog
        entity={{
          action: 'deletion',
          name: 'test',
          primaryBtnText: 'Delete',
          type: 'Linode',
        }}
        disableTypeToConfirmSubmit
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

    const input = getByTestId('textfield-input');
    fireEvent.change(input, { target: { value: 'test' } });

    const submitButton = getByTestId('confirm');
    // Should still be disabled cause we overrode the disabled state with the prop

    expect(submitButton).toBeDisabled();
  });
});
