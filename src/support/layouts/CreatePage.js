import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Link } from 'react-router';

import { Card } from 'linode-components/cards';
import {
  Input,
  Select,
  Form,
  FormGroup,
  FormGroupError,
  SubmitButton
} from 'linode-components/forms';
import { tickets } from '~/api';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { setError } from '~/actions/errors';
import { reduceErrors, ErrorSummary } from '~/errors';
import { linodes, domains, nodebalancers } from '~/api';
import TicketHelper from '../components/TicketHelper';

export class CreatePage extends Component {
  static async preload({ dispatch }) {
    try {
      await dispatch(linodes.all());
      await dispatch(domains.all());
      await dispatch(nodebalancers.all());
    } catch (response) {
      // eslint-disable-next-line no-console
      console.error(response);
      dispatch(setError(response));
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      summary: '',
      regarding: `linode_id:${Object.values(props.linodes)[0].id}`,
      description: '',
      errors: {},
      creating: false,
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle('Open a Ticket'));
  }

  onSubmit = async () => {
    const { dispatch } = this.props;
    const { summary, regarding, description } = this.state;

    const regardingField = regarding.substring(0, regarding.indexOf(':'));
    const regardingId = regarding.substring(regardingField.length + 1);

    this.setState({ loading: true, errors: {} });

    try {
      await dispatch(tickets.post({ summary, description, [regardingField]: +regardingId }));

      // TODO: Redirect to newly create ticket page
      dispatch(push('/support'));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors });
    }

    this.setState({ loading: false });
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  renderOptionsGroup(label, field, group) {
    return (
      <optgroup label={label} key={label}>
        {group.map(object => (
          <option key={object.id} value={`${field}:${object.id}`}>
            {object.label || object.domain}
          </option>
         ))}
      </optgroup>
    );
  }

  render() {
    const { summary, regarding, description, creating, errors } = this.state;
    const { linodes, domains, nodebalancers } = this.props;
    const regardingOptions = [
      this.renderOptionsGroup('Linodes', 'linode_id', Object.values(linodes)),
      this.renderOptionsGroup('Domains', 'domain_id', Object.values(domains)),
      this.renderOptionsGroup('NodeBalancers', 'nodebalancer_id', Object.values(nodebalancers)),
      // TODO: this is not currently supported by the API
      // this.renderOptionsGroup('Other', [{ label: 'Other', id: 'other' }]),
    ];

    return (
      <div className="container create-page">
        <header className="text-sm-left">
          <Link to="/support">Support</Link>
          <h1>Open a ticket</h1>
        </header>
        <TicketHelper displayHeader />
        <Card>
          <Form onSubmit={this.onSubmit}>
            <FormGroup className="row" errors={errors} name="summary">
              <label htmlFor="summary" className="col-sm-2 col-form-label">Summary</label>
              <div className="col-sm-10">
                <Input
                  name="summary"
                  id="summary"
                  value={summary}
                  className="input-lg"
                  onChange={this.onChange}
                />
                <FormGroupError errors={errors} name="summary" inline={false} />
              </div>
            </FormGroup>
            <FormGroup className="row" errors={errors} name="regarding">
              <label htmlFor="regarding" className="col-sm-2 col-form-label">Regarding</label>
              <div className="col-sm-10">
                <Select
                  name="regarding"
                  id="regarding"
                  value={regarding}
                  onChange={this.onChange}
                >{regardingOptions}</Select>
                <FormGroupError errors={errors} name="regarding" inline={false} />
              </div>
            </FormGroup>
            <FormGroup className="row" errors={errors} name="description">
              <label htmlFor="description" className="col-sm-2 col-form-label">
                Description
              </label>
              <div className="col-sm-10">
                <textarea
                  className="textarea-md"
                  name="description"
                  id="description"
                  value={description}
                  onChange={this.onChange}
                />
                <FormGroupError errors={errors} name="description" inline={false} />
              </div>
            </FormGroup>
            <FormGroup className="row">
              <div className="col-sm-10 offset-sm-2">
                <SubmitButton disabled={creating}>Open Ticket</SubmitButton>
              </div>
            </FormGroup>
            <ErrorSummary errors={errors} />
          </Form>
        </Card>
      </div>
    );
  }
}

CreatePage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linodes: PropTypes.object.isRequired,
  domains: PropTypes.object.isRequired,
  nodebalancers: PropTypes.object.isRequired,
};

function select(state) {
  return {
    nodebalancers: state.api.nodebalancers.nodebalancers,
    linodes: state.api.linodes.linodes,
    domains: state.api.domains.domains,
  };
}

export default connect(select)(CreatePage);
