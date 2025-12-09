import InsertDriveFile from '@mui/icons-material/InsertDriveFile';
import InsertPhoto from '@mui/icons-material/InsertPhoto';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  addIconsToAttachments,
  TicketAttachmentList,
} from './TicketAttachmentList';

const props = {
  attachments: [
    'file1.png',
    'file2.jpg',
    'file3.tiff',
    'file4.bmp',
    'file5.jpeg',
    'file6.txt',
    'file7.pdf',
  ],
};

describe('TicketAttachmentList component', () => {
  it('should render 5 attachments by default', () => {
    const { getByText, queryByText } = renderWithTheme(
      <TicketAttachmentList {...props} />
    );

    for (let i = 0; i < props.attachments.length; i++) {
      if (i < 5) {
        expect(getByText(props.attachments[i])).toBeVisible();
      } else {
        expect(queryByText(props.attachments[i])).not.toBeInTheDocument();
      }
    }
  });
  it('should render all attachment when show more is clicked', async () => {
    const { getByText } = renderWithTheme(<TicketAttachmentList {...props} />);
    const showMoreButton = getByText('Show More Files').closest('button');
    await userEvent.click(showMoreButton!);
    for (const attachment of props.attachments) {
      expect(getByText(attachment)).toBeVisible();
    }
  });
  describe('addIconsToAttachments helper method', () => {
    const icons = addIconsToAttachments(props.attachments);
    it('should assign a photo icon to a filename with an image extension', () => {
      for (let i = 0; i < 5; i++) {
        expect(icons[i]).toEqual(<InsertPhoto key={i} />);
      }
    });
    it('should use a file icon for all other attachments types', () => {
      expect(icons[5]).toEqual(<InsertDriveFile key={5} />);
    });
    it('should return an empty list when not given attachments', () => {
      expect(addIconsToAttachments()).toEqual([]);
      expect(addIconsToAttachments([])).toEqual([]);
    });
  });
});
