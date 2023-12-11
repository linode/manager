import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import {
  attachment1,
  attachment2,
  attachment3,
} from 'src/__data__/fileAttachments';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AttachFileListItem } from './AttachFileListItem';

const props = {
  fileIdx: 1,
  onClick: vi.fn(),
  removeFile: vi.fn(),
};

describe('AttachFileListItem component', () => {
  it('should render', () => {
    expect(
      renderWithTheme(<AttachFileListItem file={attachment1} {...props} />)
    ).toBeDefined();
  });
  it('should render a delete icon', () => {
    const { queryAllByTestId } = renderWithTheme(
      <AttachFileListItem file={attachment1} {...props} />
    );
    expect(queryAllByTestId('delete-button')).toHaveLength(1);
  });
  it('should call the removeFile method when the delete button is clicked', () => {
    const { getByTestId, queryAllByTestId } = renderWithTheme(
      <AttachFileListItem file={attachment1} {...props} />
    );

    fireEvent.click(getByTestId('delete-button'));
    expect(props.removeFile).toHaveBeenCalled();
    expect(queryAllByTestId('delete-button')).toHaveLength(1);
  });
  it('should render a progress bar when a file is uploading', () => {
    const { queryAllByTestId } = renderWithTheme(
      <AttachFileListItem file={attachment2} {...props} />
    );
    expect(queryAllByTestId('linear-progress')).toHaveLength(1);
  });
  // Currently allows uploading the same file in production
  it.skip('should return null if the file has already been uploaded', () => {
    const { getByTestId } = renderWithTheme(
      <AttachFileListItem file={attachment3} {...props} />
    );
    expect(getByTestId('attached-file')).not.toBeInTheDocument();
  });
});
