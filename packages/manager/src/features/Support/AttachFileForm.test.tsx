import * as React from 'react';

import { attachment3 } from 'src/__data__/fileAttachments';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AttachFileForm } from './AttachFileForm';

const props = {
  classes: {
    attachFileButton: '',
  },
  files: [attachment3],
  handleFileSelected: vi.fn(),
  updateFiles: vi.fn(),
};

describe('AttachFileForm component', () => {
  it('should render', () => {
    const { getByText } = renderWithTheme(<AttachFileForm {...props} />);

    getByText('Attach a file');
  });
});
