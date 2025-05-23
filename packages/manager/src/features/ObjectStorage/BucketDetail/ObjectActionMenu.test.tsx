import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';

import { wrapWithTheme } from 'src/utilities/testHelpers';

import { ObjectActionMenu } from './ObjectActionMenu';

import type { Props } from './ObjectActionMenu';

vi.mock('src/components/ActionMenu/ActionMenu');

const mockHandleClickDelete = vi.fn();
const mockHandleClickDownload = vi.fn();

const props: Props = {
  handleClickDelete: mockHandleClickDelete,
  handleClickDownload: mockHandleClickDownload,
  objectName: 'my-object',
};

describe('ObjectActionMenu', () => {
  it('Includes a "Delete" option', () => {
    const { queryByText } = render(
      wrapWithTheme(<ObjectActionMenu {...props} />)
    );
    expect(queryByText('Delete')).toBeInTheDocument();
  });

  it('executes the onRemove function when the "Delete" option is clicked', () => {
    const { getAllByText } = render(
      wrapWithTheme(<ObjectActionMenu {...props} />)
    );

    fireEvent.click(getAllByText('Delete')[0]);
    expect(mockHandleClickDelete).toHaveBeenCalled();
  });

  it('Includes a "Download" option', () => {
    const { queryByText } = render(
      wrapWithTheme(<ObjectActionMenu {...props} />)
    );
    expect(queryByText('Download')).toBeInTheDocument();
  });

  it('executes the onOpen function when the "Download" option is clicked', () => {
    const { getAllByText } = render(
      wrapWithTheme(<ObjectActionMenu {...props} />)
    );

    fireEvent.click(getAllByText('Download')[0]);
    expect(mockHandleClickDownload).toHaveBeenCalled();
  });
});
