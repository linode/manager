import { downloadFile } from '@linode/utilities';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CopyableTextField } from './CopyableTextField';

import type { CopyableTextFieldProps } from './CopyableTextField';

vi.mock('@linode/utilities', async () => ({
  ...(await vi.importActual('@linode/utilities')),
  downloadFile: vi.fn(),
}));

const mockLabel = 'label';
const mockValue = 'Text to Copy';
const defaultProps: CopyableTextFieldProps = {
  label: mockLabel,
  value: mockValue,
};

describe('CopyableTextField', () => {
  it('should render label and CopyableText', () => {
    const { getByRole } = renderWithTheme(
      <CopyableTextField {...defaultProps} />
    );

    const textbox = getByRole('textbox', { name: mockLabel });

    expect(textbox).toBeVisible();
    expect(textbox).toHaveAttribute(
      'value',
      expect.stringContaining(mockValue)
    );
  });

  it('should render the copy icon button and tooltip and allow user to copy the Text', async () => {
    const { findByRole, getByRole } = renderWithTheme(
      <CopyableTextField {...defaultProps} />
    );

    const copyIcon = getByRole('button', {
      name: `Copy ${mockValue} to clipboard`,
    });

    await userEvent.hover(copyIcon);
    const copyTooltip = await findByRole('tooltip');
    expect(copyTooltip).toBeInTheDocument();
    expect(copyTooltip).toHaveTextContent('Copy');

    await userEvent.click(copyIcon);
    expect(copyIcon.getAttribute('data-qa-tooltip')).toBe('Copied!');
  });

  it('should render the download icon button and tooltip and allow user to download the Text File', async () => {
    const { findByRole, getByRole } = renderWithTheme(
      <CopyableTextField showDownloadIcon {...defaultProps} />
    );

    const downloadIcon = getByRole('button', { name: `Download ${mockValue}` });

    await userEvent.hover(downloadIcon);
    const copyTooltip = await findByRole('tooltip');
    expect(copyTooltip).toBeInTheDocument();
    expect(copyTooltip).toHaveTextContent('Download');

    await userEvent.click(downloadIcon);
    expect(downloadFile).toHaveBeenCalledTimes(1);
    expect(downloadFile).toHaveBeenCalledWith(`${mockLabel}.txt`, mockValue);
  });

  it('should not render any icon when hideIcons is true', () => {
    const { queryByRole } = renderWithTheme(
      <CopyableTextField hideIcons {...defaultProps} />
    );

    const copyIcon = queryByRole('button', {
      name: `Copy ${mockValue} to clipboard`,
    });
    const downloadIcon = queryByRole('button', {
      name: `Download ${mockValue}`,
    });

    expect(copyIcon).not.toBeInTheDocument();
    expect(downloadIcon).not.toBeInTheDocument();
  });
});
