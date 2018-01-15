import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { push } from 'react-router-redux';
import { compose } from 'redux';
import Card from 'linode-components/dist/cards/Card';
import Form from 'linode-components/dist/forms/Form';
import FormGroup from 'linode-components/dist/forms/FormGroup';
import FormGroupError from 'linode-components/dist/forms/FormGroupError';
import FormSummary from 'linode-components/dist/forms/FormSummary';
import Input from 'linode-components/dist/forms/Input';
import Textarea from 'linode-components/dist/forms/Textarea';
import Select from 'linode-components/dist/forms/Select';
import SubmitButton from 'linode-components/dist/forms/SubmitButton';
import { onChange } from 'linode-components/dist/forms/utilities';

import { setAnalytics, setSource } from '~/actions';
import api from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';
import ChainedDocumentTitle from '~/components/ChainedDocumentTitle';
import { ComponentPreload as Preload } from '~/decorators/Preload';

import TicketHelper from '../components/TicketHelper';


export class TicketCreate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      summary: '',
      regarding: null,
      description: '',
      errors: {},
      loading: false,
    };

    this.onChange = onChange.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setAnalytics(['tickets', 'create']));
  }

  onSubmit = () => {
    const { dispatch } = this.props;
    const { summary, regarding, description } = this.state;

    const regardingField = regarding.substring(0, regarding.indexOf(':'));
    const regardingId = regarding.substring(regardingField.length + 1);

    const data = { summary, description };

    if (regardingField !== 'other') {
      data[regardingField] = +regardingId;
    }

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => api.tickets.post(data),
      ({ id }) => push(`/support/${id}`),
    ]));
  }

  renderOptionsGroup(label, field, group) {
    return {
      label,
      options: group.map(object => ({
        value: `${field}:${object.id}`,
        label: object.label || object.domain,
      })),
    };
  }

  render() {
    const { summary, regarding, description, loading, errors } = this.state;
    const { linodes, domains, nodebalancers, volumes } = this.props;
    const regardingOptions = [
      this.renderOptionsGroup('Linodes', 'linode_id', Object.values(linodes)),
      this.renderOptionsGroup('Domains', 'domain_id', Object.values(domains)),
      this.renderOptionsGroup('NodeBalancers', 'nodebalancer_id', Object.values(nodebalancers)),
      this.renderOptionsGroup('Volumes', 'volume_id', Object.values(volumes)),
      this.renderOptionsGroup('Other', '', [{ label: 'Other', id: 'other' }]),
    ];

    return (
      <div className="container create-page">
        <ChainedDocumentTitle title="Open a Ticket" />
        <header className="text-sm-left">
          <Link to="/support">Support</Link>
          <h1>Open a ticket</h1>
        </header>
        <section>
          <TicketHelper displayHeader />
        </section>
        <Card>
          <Form
            onSubmit={this.onSubmit}
            analytics={{ title: 'Open a Ticket', action: 'add' }}
          >
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
                  options={regardingOptions}
                />
                <FormGroupError errors={errors} name="regarding" inline={false} />
              </div>
            </FormGroup>
            <FormGroup className="row" errors={errors} name="description">
              <label htmlFor="description" className="col-sm-2 col-form-label">
                Description
              </label>
              <div className="col-sm-10">
                <Textarea
                  className="textarea-md"
                  name="description"
                  id="description"
                  value={description}
                  onChange={this.onChange}
                />
                <FormGroupError errors={errors} name="description" inline={false} />
              </div>
            </FormGroup>
            <FormGroup className="row" name="submit">
              <div className="col-sm-10 offset-sm-2">
                <SubmitButton disabled={loading} disabledChildren="Opening Ticket">
                  Open Ticket
                </SubmitButton>
                <FormSummary errors={errors} />
              </div>
            </FormGroup>
          </Form>
        </Card>
      </div>
    );
  }
}

TicketCreate.propTypes = {
  dispatch: PropTypes.func.isRequired,
  linodes: PropTypes.object.isRequired,
  domains: PropTypes.object.isRequired,
  volumes: PropTypes.array.isRequired,
  nodebalancers: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    nodebalancers: state.api.nodebalancers.nodebalancers,
    linodes: state.api.linodes.linodes,
    domains: state.api.domains.domains,
    volumes: state.api.volumes.volumes,
  };
};

const preloadRequest = async (dispatch) => {
  await Promise.all([
    api.linodes, api.domains, api.nodebalancers, api.volumes,
  ].map(o => dispatch(o.all())));
};

export default compose(
  connect(mapStateToProps),
  Preload(preloadRequest)
)(TicketCreate);
