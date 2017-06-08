import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Card } from 'linode-components/cards';
import { Form, FormGroup, FormGroupError, SubmitButton, Input } from 'linode-components/forms';

import { tickets } from '~/api';
import { getObjectByLabelLazily } from '~/api/util';
import { addTicketAttachment } from '~/api/tickets';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { MAX_UPLOAD_SIZE_MB } from '~/constants';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';

import { renderTicketCreationInfo } from './IndexPage';
import TicketReply from '../components/TicketReply';
import TicketHelper from '../components/TicketHelper';


export function AttachmentTooBigError() {
  const error = `File size must be under ${MAX_UPLOAD_SIZE_MB} MB`;
  this.json = () => ({
    errors: [{ field: 'attachments', reason: error }],
  });
}

AttachmentTooBigError.prototype = new Error();

export class TicketPage extends Component {
  static async preload({ dispatch }, { ticketId }) {
    await dispatch(getObjectByLabelLazily('tickets', ticketId, 'id'));
    await dispatch(tickets.replies.all([ticketId]));
  }

  constructor() {
    super();

    this.state = { reply: '', attachments: [], errors: {}, loading: false };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle(this.props.ticket.summary));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  onSubmit = () => {
    const { attachments, reply: description } = this.state;
    const { ticket, dispatch } = this.props;

    const requests = [];

    if (description) {
      requests.push(() => tickets.replies.post({ description }, [ticket.id]));
    }

    for (let i = 0; i < attachments.length; i++) {
      const attachment = attachments[i];

      requests.push(() => {
        if ((attachment.size / (1024 * 1024)) < MAX_UPLOAD_SIZE_MB) {
          return addTicketAttachment(ticket.id, attachment);
        }

        throw new AttachmentTooBigError();
      });
    }

    return dispatch(dispatchOrStoreErrors.call(this, requests));
  }

  renderTicketResponseForm() {
    const { errors, loading, reply } = this.state;

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
            <div className="text-sm-right">
              <SubmitButton disabled={loading} disabledChildren="Submitting">Submit</SubmitButton>
              <FormSummary errors={errors} success="Response submitted." />
            </div>
          </div>
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
          <div className="container clearfix">
            <div className="float-sm-left">
              <Link to="/support">Support</Link>
              <h1 title={ticket.id}>{ticket.summary}</h1>
              {renderTicketCreationInfo(ticket)}
            </div>
          </div>
        </header>
        <div className="container">
          <div className="row">
            <div className="col-lg-7 col-md-12">
              {/* TODO: make sure this logic makes sense. */}
              {!ticket.description ? null : (
                <section>
                  <TicketReply reply={ticket} createdField="opened" />
                </section>
              )}
              {Object.values(replies).map(reply => (
                <section key={reply.id}>
                  <TicketReply reply={reply} createdField="created" />
                </section>
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
