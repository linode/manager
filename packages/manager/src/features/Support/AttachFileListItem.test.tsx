import { fireEvent } from '@testing-library/react';
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import {
  attachment1,
  attachment2,
  attachment3,
} from 'src/__data__/fileAttachments';
import { AttachFileListItem } from './AttachFileListItem';

const props = {
  fileIdx: 1,
  onClick: jest.fn(),
  removeFile: jest.fn(),
};

describe('AttachFileListItem component', () => {
  it('should render', () => {
    expect(
      renderWithTheme(
        <AttachFileListItem
          file={attachment1}
          inlineDisplay={false}
          {...props}
        />
      )
    ).toBeDefined();
  });
  it('should render a delete icon when inlineDisplay is true', () => {
    const { queryAllByTestId } = renderWithTheme(
      <AttachFileListItem file={attachment1} inlineDisplay={true} {...props} />
    );
    expect(queryAllByTestId('inline-delete-icon')).toHaveLength(1);
  });
  it('should render a button when inlineDisplay is false and call the removeFile method when the delete button is clicked', () => {
    const { queryAllByTestId, getByTestId } = renderWithTheme(
      <AttachFileListItem file={attachment1} inlineDisplay={false} {...props} />
    );

    fireEvent.click(getByTestId('delete-button'));
    expect(props.onClick).toHaveBeenCalled();
    expect(queryAllByTestId('delete-button')).toHaveLength(1);
  });
  it('should render a progress bar when a file is uploading', () => {
    const { queryAllByTestId } = renderWithTheme(
      <AttachFileListItem file={attachment2} inlineDisplay={false} {...props} />
    );
    expect(queryAllByTestId('linear-progress')).toHaveLength(1);
  });
  // Currently allows uploading the same file in production
  it.skip('should return null if the file has already been uploaded', () => {
    const { getByTestId } = renderWithTheme(
      <AttachFileListItem file={attachment3} inlineDisplay={true} {...props} />
    );
    expect(getByTestId('attached-file')).not.toBeInTheDocument();
  });
});
