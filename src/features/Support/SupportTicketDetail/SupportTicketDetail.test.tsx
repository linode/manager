import { shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';
import { SupportTicketDetail } from './SupportTicketDetail';

import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { supportTicket } from 'src/__data__/supportTicket';

const classes = {
  root: '',
  title: '',
  titleWrapper: '',
  backButton: '',
  listParent: '',
  label: '',
  labelIcon: '',
  status: '',
  open: '',
  ticketLabel: '',
  closed: '',
  attachmentPaperWrapper: '',
  attachmentPaper: '',
  attachmentRow: '',
  attachmentIcon: ''
};

describe('Support Ticket Detail', () => {
  let wrapper: ShallowWrapper;
  beforeEach(() => {
    wrapper = shallow(
      <SupportTicketDetail {...reactRouterProps} classes={classes} />
    );
  });
  describe('render', () => {
    it('renders a CircleProgress component when loading', () => {
      wrapper.setState({ loading: true });
      expect(wrapper.find('WithStyles(circleProgressComponent)')).toHaveLength(
        1
      );
    });

    it('renders an ErrorState when there are errors', () => {
      wrapper.setState({ loading: false, errors: 'ERROR' });
      expect(wrapper.find('WithStyles(ErrorState)')).toHaveLength(1);
    });

    it('contains a Breadcrumb component when rendered normally', () => {
      wrapper.setState({ loading: false, ticket: supportTicket });
      expect(wrapper.find('[data-qa-breadcrumb]')).toHaveLength(1);
    });
  });

  describe('breadcrumb', () => {
    let breadcrumbProps: any;
    beforeAll(() => {
      wrapper.setState({ loading: false, ticket: supportTicket });
      breadcrumbProps = wrapper.find('[data-qa-breadcrumb]').props();
    });

    it('contains linkTo prop when open', () => {
      expect(breadcrumbProps.linkTo).toEqual({
        pathname: '/support/tickets',
        search: 'type=open'
      });
    });

    it('contains linkTo prop when closed', () => {
      wrapper.setState({
        ticket: { ...supportTicket, status: 'closed' },
        loading: false
      });
      breadcrumbProps = wrapper.find('[data-qa-breadcrumb]').props();
      expect(breadcrumbProps.linkTo).toEqual({
        pathname: '/support/tickets',
        search: 'type=closed'
      });
    });

    it('contains linkText', () => {
      expect(breadcrumbProps.linkText).toBe('Support Tickets');
    });

    it('contains label', () => {
      expect(breadcrumbProps.labelTitle).toBe('#0: TEST Support Ticket');
    });
  });
});
