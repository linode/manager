import { shallow } from 'enzyme';
import * as React from 'react';

import { TicketAttachmentList } from './TicketAttachmentList';

const props = {
  attachments: ['file1', 'file2', 'file3', 'file4', 'file5', 'file6', 'file7'],
  showMoreAttachments: false,
  toggle: jest.fn(),
  classes: { root: '', attachmentPaperWrapper: '' }
}

const component = shallow(
  <TicketAttachmentList {...props} />
)

describe("TicketAttachmentList component", () => {
  it("should render", () => {
    expect(component).toBeDefined();
  });
  it("should render its props", () => {
    expect(component.find('WithStyles(TicketAttachmentRow)')).toHaveLength(2);
  });
  it("should only pass 5 attachments to the main attachments list", () => {
    const first = component.find('WithStyles(TicketAttachmentRow)').first() as any;
    expect(first.props().attachments).toHaveLength(5);
  });
  it("should pass the remaining attachments to the ShowMoreExpansion attachment row", () => {
    const last = component.find('WithStyles(TicketAttachmentRow)').last() as any;
    expect(last.props().attachments).toHaveLength(2);
  });
  it("should call its toggle prop when the ShowMoreExpansion button is clicked", () => {
    const button = component.find('[data-qa-attachment-toggle]');
    button.simulate('click');
    expect(props.toggle).toHaveBeenCalled();
  })
});