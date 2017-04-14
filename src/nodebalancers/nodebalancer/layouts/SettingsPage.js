import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { nodebalancers } from '~/api';
import { objectFromMapByLabel, dispatchOrStoreErrors } from '~/api/util';
import { Form, FormGroup, FormGroupError, SubmitButton, Input } from '~/components/form';
import { setSource } from '~/actions/source';
import { Card, CardHeader } from '~/components/cards';
import { ErrorSummary } from '~/errors';

export class SettingsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      label: props.nodebalancer.label,
      group: props.nodebalancer.group || '',
      errors: {},
      saving: false,
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  onSubmit = async () => {
    const { dispatch, nodebalancer: { id, label: oldLabel } } = this.props;
    const { group, label } = this.state;

    await dispatch(dispatchOrStoreErrors.apply(this,
      [() => nodebalancers.put({ group, label }, id)],
    ));

    if (oldLabel !== label) {
      await dispatch(push(`/nodebalancers/${label}/settings`));
    }
  }

  render() {
    const { errors, group, label } = this.state;

    return (
      <Card header={<CardHeader title="Display" />}>
        <Form onSubmit={this.onSubmit}>
          <FormGroup errors={errors} className="row" name="group">
            <label htmlFor="group" className="col-sm-1 col-form-label">Group:</label>
            <div className="col-sm-11">
              <Input
                id="group"
                value={group}
                className="LinodesLinodeSettingsDisplay-group"
                onChange={e => this.setState({ group: e.target.value })}
              />
              <FormGroupError errors={errors} name="group" />
            </div>
          </FormGroup>
          <FormGroup errors={errors} className="row" name="label">
            <label htmlFor="label" className="col-sm-1 col-form-label">Label:</label>
            <div className="col-sm-11">
              <Input
                id="label"
                className="LinodesLinodeSettingsDisplay-label"
                value={label}
                onChange={e => this.setState({ label: e.target.value })}
              />
              <FormGroupError errors={errors} name="label" />
            </div>
          </FormGroup>
          <FormGroup className="row">
            <div className="offset-sm-1 col-sm-11">
              <SubmitButton />
            </div>
          </FormGroup>
          <ErrorSummary errors={errors} />
        </Form>
      </Card>
    );
  }
}

SettingsPage.propTypes = {
  dispatch: PropTypes.func,
  nodebalancer: PropTypes.object,
};

function select(state, ownProps) {
  const params = ownProps.params;
  const nbLabel = params.nbLabel;

  const nodebalancer = objectFromMapByLabel(state.api.nodebalancers.nodebalancers, nbLabel);

  return { nodebalancer };
}

export default connect(select)(SettingsPage);
