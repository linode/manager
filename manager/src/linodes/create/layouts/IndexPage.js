import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Link } from 'react-router';

import Source from '../components/Source';
import Plan from '~/linodes/components/Plan';
import Region from '~/components/Region';
import Details from '../components/Details';
import { Card, CardHeader } from 'linode-components/cards';
import { linodes } from '~/api';
import { setError } from '~/actions/errors';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { reduceErrors } from '~/errors';

export class IndexPage extends Component {
  static async preload(store) {
    const { dispatch } = store;
    try {
      await dispatch(linodes.all());
    } catch (response) {
      dispatch(setError(response));
    }
  }

  constructor() {
    super();
    this.onSubmit = this.onSubmit.bind(this);
    this.createLinode = this.createLinode.bind(this);
    this.state = {
      type: null,
      region: null,
      distribution: null,
      backup: null,
      sourceTab: 0,
      errors: {},
      loading: false,
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setTitle('Add a Linode'));
    const { location } = this.props;
    if (location.query && location.query.linode && location.query.backup) {
      let _linodes = this.props.linodes;
      let linode = _linodes.linodes[location.query.linode];
      if (linode) {
        _linodes = this.props.linodes;
        linode = _linodes.linodes[location.query.linode];
        const backup = null;
        if (backup) {
          this.setState({
            backup: backup.id,
            region: backup.region.id,
            sourceTab: 1,
          });
        }
      }
    }
  }

  async onSubmit({ group, label, password, backups }) {
    const { dispatch } = this.props;

    this.setState({ loading: true });

    try {
      await this.createLinode({ group, label, password, backups });
      dispatch(push(`/linodes/${label}`));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors });
    }

    this.setState({ loading: false });
  }

  createLinode({ group, label, password, backups }) {
    const { dispatch } = this.props;
    const { type, region, distribution, backup } = this.state;

    const data = {
      root_pass: password,
      type,
      distribution,
      backup,
      region,
      label,
      group,
      with_backups: backups,
    };

    if (distribution === 'none') {
      delete data.root_pass;
      delete data.distribution;
    }

    return dispatch(linodes.post(data));
  }

  render() {
    const {
      distributions,
      linodes,
      regions,
      types,
    } = this.props;
    const {
      backup,
      distribution,
      region,
      type,
      sourceTab,
      loading,
    } = this.state;

    const selectedType = type === null ? null : types.types[type];

    return (
      <div className="container create-page">
        <Link to="/linodes">Linodes</Link>
        <h1>Add a Linode</h1>
        <Source
          distribution={distribution}
          backup={backup}
          selectedIndex={sourceTab}
          distributions={distributions.distributions}
          onTabChange={(_, index) => this.setState({ sourceTab: index })}
          onSourceSelected={(type, id, linodeId) => {
            if (type === 'backup' && linodeId && id) {
              const backup = null;

              this.setState({
                backup: id,
                region: backup.region.id,
                distribution: null,
              });
            } else {
              this.setState({ [type]: id, backup: null });
            }
          }}
          linodes={linodes}
        />
        <Region
          selected={region}
          regions={regions.regions}
          disabled={backup !== null}
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
          selectedDistribution={distribution}
          submitEnabled={(distribution || backup) && region && type && !loading}
          errors={this.state.errors}
        />
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  distributions: PropTypes.object,
  linodes: PropTypes.object,
  types: PropTypes.object,
  regions: PropTypes.object,
  location: PropTypes.object,
};

function select(state) {
  return {
    distributions: state.api.distributions,
    linodes: state.api.linodes,
    regions: state.api.regions,
    types: state.api.types,
  };
}

export default connect(select)(IndexPage);
