import { shallow } from 'enzyme';
import * as React from 'react';

import InsertDriveFile from '@material-ui/icons/InsertDriveFile';
import InsertPhoto from '@material-ui/icons/InsertPhoto';

import { TicketAttachmentRow } from './TicketAttachmentRow';

const props = {
  attachments: ['file1', 'file2', 'file3'],
  icons: [
    <InsertDriveFile key={0} />,
    <InsertPhoto key={1} />,
    <InsertPhoto key={2} />
  ],
  classes: {
    root: '',
    attachmentPaper: '',
    attachmentRow: '',
    attachmentIcon: ''
  }
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
