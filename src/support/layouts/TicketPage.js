import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { MAX_UPLOAD_SIZE_MB } from '~/constants';
import { tickets } from '~/api';
import { addTicketAttachment } from '~/api/tickets';
import { setError } from '~/actions/errors';
import { Form, FormGroup, FormGroupError, SubmitButton, Input } from '~/components/form';
import { reduceErrors, ErrorSummary } from '~/errors';
import Card from '~/components/cards/Card';
import { renderTicketCreationInfo } from './IndexPage';
import TicketReply from '../components/TicketReply';
import TicketHelper from '../components/TicketHelper';

export class TicketPage extends Component {
  static async preload({ dispatch }, { ticketId }) {
    try {
      await dispatch(tickets.one([ticketId]));
      await dispatch(tickets.replies.all([ticketId]));
    } catch (response) {
      // eslint-disable-next-line no-console
      console.error(response);
      await dispatch(setError(response));
    }
  }

  constructor() {
    super();

    this.state = { reply: '', attachments: [], errors: {}, saving: false };
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  onSubmit = async () => {
    const { attachments, reply: description } = this.state;
    const { ticket, dispatch } = this.props;

    this.setState({ errors: {}, saving: true });

    try {
      if (description) {
        await dispatch(tickets.replies.post({ description }, [ticket.id]));
        this.setState({ reply: '' });
      }

      for (let i = 0; i < attachments.length; i++) {
        const attachment = attachments[i];

        if ((attachment.size / (1024 * 1024)) < MAX_UPLOAD_SIZE_MB) {
          await dispatch(addTicketAttachment(ticket.id, attachment));
        } else {
          const error = `File size must be under ${MAX_UPLOAD_SIZE_MB} MB`;
          this.setState({ errors: { attachments: [{ reason: error }] } });

          return;
        }
      }

      this.setState({ saving: false });
    } catch (response) {
      if (!response.json) {
        // eslint-disable-next-line no-console
        return console.error(response);
      }

      const errors = await reduceErrors(response);
      this.setState({ errors, saving: false });
    }
  }

  renderTicketResponseForm() {
    const { errors, saving, reply } = this.state;

    return (
      <Card>
        <Form onSubmit={this.onSubmit}>
          <FormGroup>
            <label htmlFor="reply" className="row-label">Write a reply:</label>
            <textarea
              name="reply"
              id="reply"
              className="textarea-lg"
              onChange={this.onChange}
              value={reply}
            />
            <FormGroupError inline={false} errors={errors} name="description" />
          </FormGroup>
          <FormGroup errors={errors}>
            <div>
              <label htmlFor="attachments" className="row-label">Add attachments:</label>
            </div>
            <Input
              multiple
              name="attachments"
              id="attachments"
              type="file"
              onChange={(e) => this.setState({ attachments: e.target.files })}
            />
            <FormGroupError inline={false} errors={errors} name="attachments" />
          </FormGroup>
          <div className="clearfix">
            <div className="float-sm-right">
              <SubmitButton disabled={saving}>Submit</SubmitButton>
            </div>
          </div>
          <ErrorSummary errors={errors} />
        </Form>
      </Card>
    );
  }

  renderTicketClosed() {
    return (
      <Card id="ticket-closed">
        This ticket has been closed. If you are still experiencing an issue,
        please <Link to="/support/create">open a new ticket</Link>.
      </Card>
    );
  }

  render() {
    const { ticket, replies } = this.props;
    if (!ticket) {
      return null;
    }

    return (
      <div>
        <header className="main-header main-header--border">
          <div className="container">
            <Link to="/support">Support</Link>
            <h1 title={ticket.id}>{ticket.summary}</h1>
            {renderTicketCreationInfo(ticket)}
          </div>
        </header>
        <div className="container">
          <div className="row">
            <div className="col-lg-7 col-md-12">
              <TicketReply reply={ticket} createdField="opened" />
              {Object.values(replies).map(reply => (
                <TicketReply reply={reply} createdField="created" key={reply.id} />
              ))}
              {ticket.status === 'closed' ?
                this.renderTicketClosed() :
                this.renderTicketResponseForm()}
            </div>
            <div className="col-lg-5 col-md-12">
              <TicketHelper />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

TicketPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  ticket: PropTypes.object.isRequired,
  replies: PropTypes.object.isRequired,
};

function select(state, props) {
  const { ticketId } = props.params;
  const ticket = state.api.tickets.tickets[ticketId];
  return {
    ticket,
    replies: ticket && ticket._replies.replies,
  };
}

export default connect(select)(TicketPage);
