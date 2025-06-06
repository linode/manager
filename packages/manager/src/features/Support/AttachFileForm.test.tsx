import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { attachment1, attachment3 } from 'src/__data__/fileAttachments';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AttachFileForm } from './AttachFileForm';

describe('AttachFileForm component', () => {
  it('should render', () => {
    const { getByText } = renderWithTheme(
      <AttachFileForm files={[]} updateFiles={vi.fn()} />
    );

    expect(getByText('Attach a file')).toBeVisible();
  });

  it('can remove a file', async () => {
    const updateFiles = vi.fn();

    const { getByLabelText } = renderWithTheme(
      <AttachFileForm
        files={[attachment1, attachment3]}
        updateFiles={updateFiles}
      />
    );

    const removeButton = getByLabelText(`Remove file ${attachment1.name}`);

    await userEvent.click(removeButton);

    expect(updateFiles).toHaveBeenCalledWith([attachment3]);
  });
});
