import InsertDriveFile from '@mui/icons-material/InsertDriveFile';
import InsertPhoto from '@mui/icons-material/InsertPhoto';
import { shallow } from 'enzyme';
import * as React from 'react';

import { TicketAttachmentRow } from './TicketAttachmentRow';

const props = {
  attachments: ['file1', 'file2', 'file3'],
  classes: {
    attachmentIcon: '',
    attachmentPaper: '',
    attachmentRow: '',
    root: '',
  },
  icons: [
    <InsertDriveFile key={0} />,
    <InsertPhoto key={1} />,
    <InsertPhoto key={2} />,
  ],
};

const component = shallow(<TicketAttachmentRow {...props} />);

describe('TicketAttachmentRow component', () => {
  it('should render', () => {
    expect(component).toBeDefined();
  });
  it('should render its props', () => {
    expect(component.find('[data-qa-attachment-row]')).toHaveLength(3);
  });
  it('should render an icon for each attachment', () => {
    expect(
      component
        .find('[data-qa-attachment-row]')
        .first()
        .containsMatchingElement(<InsertDriveFile key={0} />)
    ).toBeTruthy();
    expect(
      component
        .find('[data-qa-attachment-row]')
        .last()
        .containsMatchingElement(<InsertPhoto key={2} />)
    ).toBeTruthy();
  });
});
