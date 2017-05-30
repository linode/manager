import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { push } from 'react-router-redux';

import { Card, CardHeader } from 'linode-components/cards';

import { setError } from '~/actions/errors';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import * as api from '~/api';
import { dispatchOrStoreErrors } from '~/components/forms';
import Region from '~/components/Region';

import Details from '../components/Details';
import Source from '../components/Source';
import Plan from '../../components/Plan';


export class IndexPage extends Component {
  static async preload({ dispatch, getState }) {
    try {
      const requests = [api.linodes.all()];

      ['types', 'regions', 'distributions']
        .filter(type => !Object.values(getState().api[type][type]).length)
        .forEach(type => requests.push(api[type].all()));

      // Fetch all objects we haven't already grabbed this page session.
      await Promise.all(requests.map(request => dispatch(request)));
    } catch (response) {
      dispatch(setError(response));
    }
  }

  constructor() {
    super();

    this.state = {
      type: null,
      region: null,
      distribution: null,
      label: '',
      password: '',
      errors: {},
      loading: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setTitle('Add a Linode'));
  }

  onSubmit = () => {
    const { dispatch } = this.props;
    const { type, region, distribution, label, password, backups } = this.state;

    const data = {
      type,
      distribution,
      region,
      label,
      root_pass: password,
      with_backups: backups || false,
    };

    if (distribution === 'none') {
      delete data.root_pass;
      delete data.distribution;
    }

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => api.linodes.post(data),
      // label is created by the api if not sent, so accept it from the previous call
      ({ label }) => push(`/linodes/${label}`),
    ], ['distribution', 'type', 'region']));
  }

  onChange = ({ target: { name, value, checked } }) =>
    this.setState({ [name]: name === 'backups' ? checked : value })

  render() {
    const {
      distributions,
      regions,
      types,
    } = this.props;
    const {
      distribution,
      region,
      type,
      label,
      password,
      backups,
      loading,
    } = this.state;

    const selectedType = type === null ? null : types.types[type];

    return (
      <div className="container create-page">
        <Link to="/linodes">Linodes</Link>
        <h1>Add a Linode</h1>
        <Source
          distribution={distribution}
          distributions={distributions.distributions}
          onDistroSelected={id => this.setState({ distribution: id })}
        />
        <Region
          selected={region}
          regions={regions.regions}
          onRegionSelected={id => this.setState({ region: id })}
        />
        <Card header={<CardHeader title="Plan" />}>
          <Plan
            selected={type}
            types={types.types}
            onServiceSelected={id => this.setState({ type: id })}
          />
        </Card>
        <Details
          selectedType={selectedType}
          onSubmit={this.onSubmit}
          onChange={this.onChange}
          selectedDistribution={distribution}
          loading={loading}
          label={label}
          password={password}
          backups={backups}
          errors={this.state.errors}
        />
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  distributions: PropTypes.object,
  types: PropTypes.object,
  regions: PropTypes.object,
  location: PropTypes.object,
};

function select(state) {
  return {
    distributions: state.api.distributions,
    regions: state.api.regions,
    types: state.api.types,
  };
}

export default connect(select)(IndexPage);
