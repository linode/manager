import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { push } from 'react-router-redux';

import { Card, CardHeader } from 'linode-components/cards';
import { Input, Form, FormGroup, FormGroupError, SubmitButton } from 'linode-components/forms';

import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { nodebalancers } from '~/api';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';
import Region from '~/components/Region';


export class CreatePage extends Component {
  constructor() {
    super();

    this.state = {
      // TODO: don't hard-code this
      region: 'us-east-1a',
      label: '',
      errors: {},
      loading: false,
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setTitle('Add a NodeBalancer'));
  }

  onSubmit = async () => {
    const { dispatch } = this.props;
    const { region, label } = this.state;

    await dispatch(dispatchOrStoreErrors.apply(this, [
      [
        () => nodebalancers.post({ label, region }),
        () => push(`/nodebalancers/${label}`),
      ],
    ]));
  }

  render() {
    const { regions } = this.props;
    const { region, label, loading, errors } = this.state;

    return (
      <div className="PrimaryPage container">
        <header className="PrimaryPage-header">
          <Link to="/nodebalancers">NodeBalancers</Link>
          <h1>Add a NodeBalancer</h1>
        </header>
        <div className="PrimaryPage-body Nodebalancer-create">
          <Region
            selected={region}
            regions={regions.regions}
            onRegionSelected={id => this.setState({ region: id })}
          />
          <Card header={<CardHeader />}>
            <Form onSubmit={this.onSubmit}>
              <FormGroup className="row" errors={errors} name="label">
                <label htmlFor="label" className="col-sm-2 col-form-label">Label</label>
                <div className="col-sm-10">
                  <Input
                    name="label"
                    id="label"
                    value={label}
                    placeholder="nodebalancer-1"
                    onChange={e => this.setState({ label: e.target.value })}
                  />
                  <FormGroupError errors={errors} name="label" />
                </div>
              </FormGroup>
              <FormGroup className="row">
                <label htmlFor="label" className="col-sm-2 col-form-label">Plan</label>
                <div className="col-sm-10">
                  <div className="text-muted static-plan">$20.00/mo ($0.03/hr)</div>
                </div>
              </FormGroup>
              <FormGroup className="row">
                <div className="col-sm-10 offset-sm-2">
                  <SubmitButton disabled={loading} disabledChildren="Adding NodeBalancer">
                    Add NodeBalancer
                  </SubmitButton>
                  <FormSummary errors={errors} />
                </div>
              </FormGroup>
            </Form>
          </Card>
        </div>
      </div>
    );
  }
}

CreatePage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  regions: PropTypes.object,
};

function select(state) {
  return {
    regions: state.api.regions,
  };
}

export default connect(select)(CreatePage);
