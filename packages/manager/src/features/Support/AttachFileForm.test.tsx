import * as React from 'react';

import { attachment3 } from 'src/__data__/fileAttachments';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AttachFileForm } from './AttachFileForm';

const props = {
  files: [attachment3],
  updateFiles: jest.fn(),
};

describe('AttachFileForm component', () => {
  it('should render', () => {
    const { getByText } = renderWithTheme(<AttachFileForm {...props} />);

    getByText('Attach a file');
  });
});
