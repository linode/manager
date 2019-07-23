import { shallow } from 'enzyme';
import * as React from 'react';

import InsertDriveFile from '@material-ui/icons/InsertDriveFile';
import InsertPhoto from '@material-ui/icons/InsertPhoto';

import {
  addIconsToAttachments,
  TicketAttachmentList
} from './TicketAttachmentList';

const props = {
  attachments: [
    'file1.png',
    'file2.jpg',
    'file3.tiff',
    'file4.bmp',
    'file5.jpeg',
    'file6.txt',
    'file7.pdf'
  ],
  showMoreAttachments: false,
  toggle: jest.fn(),
  classes: { root: '', attachmentPaperWrapper: '' }
};

const component = shallow(<TicketAttachmentList {...props} />);

describe('TicketAttachmentList component', () => {
  it('should render', () => {
    expect(component).toBeDefined();
  });
  it('should render its props', () => {
    expect(component.find('WithStyles(TicketAttachmentRow)')).toHaveLength(2);
  });
  it('should only pass 5 attachments to the main attachments list', () => {
    const first = component
      .find('WithStyles(TicketAttachmentRow)')
      .first() as any;
    expect(first.props().attachments).toHaveLength(5);
  });
  it('should pass the remaining attachments to the ShowMoreExpansion attachment row', () => {
    const last = component
      .find('WithStyles(TicketAttachmentRow)')
      .last() as any;
    expect(last.props().attachments).toHaveLength(2);
  });
  it('should call its toggle prop when the ShowMoreExpansion button is clicked', () => {
    const button = component.find('[data-qa-attachment-toggle]');
    button.simulate('click');
    expect(props.toggle).toHaveBeenCalled();
  });
  it('should use Show More Files when showMoreAttachments is false', () => {
    expect(
      component
        .find('WithStyles(ShowMoreExpansion)')
        .first()
        .props()
    ).toHaveProperty('name', 'Show More Files');
  });
  it('should use Show Less Files when showMoreFiles is true', () => {
    component.setProps({ showMoreAttachments: true });
    expect(
      component
        .find('WithStyles(ShowMoreExpansion)')
        .first()
        .props()
    ).toHaveProperty('name', 'Show Less Files');
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
