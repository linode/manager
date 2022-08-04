import * as React from 'react';
import InsertDriveFile from '@material-ui/icons/InsertDriveFile';
import InsertPhoto from '@material-ui/icons/InsertPhoto';
import { TicketAttachmentRow } from './TicketAttachmentRow';
import { renderWithTheme } from 'src/utilities/testHelpers';

const props = {
  attachments: ['file1', 'file2', 'file3'],
  icons: [
    <InsertDriveFile key={0} />,
    <InsertPhoto key={1} />,
    <InsertPhoto key={2} />,
  ],
};

describe('TicketAttachmentRow component', () => {
  it('should render', () => {
    const { getByText } = renderWithTheme(<TicketAttachmentRow {...props} />);
    expect(getByText('file1')).toBeInTheDocument();
  });
  it('should each attachment', () => {
    const { getByTestId } = renderWithTheme(<TicketAttachmentRow {...props} />);
    expect(getByTestId('attachment-row-0')).toHaveTextContent('file1');
    expect(getByTestId('attachment-row-1')).toHaveTextContent('file2');
    expect(getByTestId('attachment-row-2')).toHaveTextContent('file3');
  });
});
