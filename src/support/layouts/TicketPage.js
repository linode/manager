import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Card } from 'linode-components';
import {
  Form,
  FormGroup,
  FormGroupError,
  FormSummary,
  SubmitButton,
  Textarea,
  Input,
} from 'linode-components';
import { onChange } from 'linode-components';

import api from '~/api';
import { dispatchOrStoreErrors, getObjectByLabelLazily } from '~/api/util';
import { addTicketAttachment } from '~/api/ad-hoc/tickets';
import { setAnalytics, setSource } from '~/actions';
import { ChainedDocumentTitle } from '~/components';
import { MAX_UPLOAD_SIZE_MB } from '~/constants';

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
    await dispatch(api.tickets.replies.all([ticketId]));
  }

  constructor() {
    super();

    this.state = { reply: '', attachments: [], errors: {}, loading: false };

    this.onChange = onChange.bind(this);
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setAnalytics(['tickets', 'ticket']));
  }

  onSubmit = () => {
    const { attachments, reply: description } = this.state;
    const { ticket, dispatch } = this.props;

    const requests = [
      // All other requests will get unshift()ed before this so this happens last.
      () => this.setState({ reply: '', attachments: [] }),
    ];

    if (description) {
      requests.unshift(() => api.tickets.replies.post({ description }, [ticket.id]));
    }

    for (let i = 0; i < attachments.length; i++) {
      const attachment = attachments[i];

      requests.unshift(() => {
        if ((attachment.size / (1024 * 1024)) < MAX_UPLOAD_SIZE_MB) {
          return addTicketAttachment(ticket.id, attachment);
        }

        throw new AttachmentTooBigError();
      });
    }

    return dispatch(dispatchOrStoreErrors.call(this, requests));
  }

  renderTicketClosed() {
    return (
      <Card id="ticket-closed">
        This ticket has been closed. If you are still experiencing an issue,
        please <Link to="/support/create">open a new ticket</Link>.
      </Card>
    );
  }

  renderTicketResponseForm() {
    const { errors, loading, reply } = this.state;

    return (
      <Card>
        <Form
          onSubmit={this.onSubmit}
          analytics={{ title: 'Ticket Response', action: 'add' }}
        >
          <FormGroup name="ticket-reply">
            <label htmlFor="reply" className="row-label">Write a reply:</label>
            <Textarea
              name="reply"
              id="reply"
              className="textarea-lg"
              onChange={this.onChange}
              value={reply}
            />
            <FormGroupError inline={false} errors={errors} name="description" />
          </FormGroup>
          <FormGroup name="ticket-attachements" errors={errors}>
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
            <div className="text- sm-right">
              <SubmitButton disabled={loading} disabledChildren="Submitting">Submit</SubmitButton>
              <FormSummary errors={errors} success="Response submitted." />
            </div>
          </div>
        </Form>
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
        <ChainedDocumentTitle title={ticket.summary} />
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
  replies: PropTypes.array.isRequired,
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
