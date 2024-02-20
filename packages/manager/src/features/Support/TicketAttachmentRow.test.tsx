import InsertDriveFile from '@mui/icons-material/InsertDriveFile';
import InsertPhoto from '@mui/icons-material/InsertPhoto';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { TicketAttachmentRow } from './TicketAttachmentRow';

const props = {
  attachments: ['file1', 'file2', 'file3'],
  icons: [
    <InsertDriveFile key={0} />,
    <InsertPhoto key={1} />,
    <InsertPhoto key={2} />,
  ],
};

describe('TicketAttachmentRow component', () => {
  it('should render each attachment', () => {
    const { getByText } = renderWithTheme(<TicketAttachmentRow {...props} />);

    for (const attachment of props.attachments) {
      expect(getByText(attachment)).toBeVisible();
    }
  });
});
