import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import Source from '../components/Source';
import Plan from '../components/Plan';
import Datacenter from '../components/Datacenter';
import Details from '../components/Details';
import { parallel } from '~/api/util';
import { linodes, distributions, datacenters, types } from '~/api';
import { setError } from '~/actions/errors';
import { setSource } from '~/actions/source';

export class IndexPage extends Component {
  constructor() {
    super();
    this.onSubmit = this.onSubmit.bind(this);
    this.createLinode = this.createLinode.bind(this);
    this.state = {
      type: null,
      datacenter: null,
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
    try {
      await dispatch(parallel(
        distributions.all(),
        datacenters.all(),
        types.all(),
        linodes.all(),
      ));
    } catch (response) {
      dispatch(setError(response));
    }
    const { location } = this.props;
    if (location.query && location.query.linode && location.query.backup) {
      let _linodes = this.props.linodes;
      let linode = _linodes.linodes[location.query.linode];
      if (linode) {
        await dispatch(linodes.backups.all(
          location.query.linode, location.query.backup));
        _linodes = this.props.linodes;
        linode = _linodes.linodes[location.query.linode];
        const backup = linode._backups.backups[location.query.backup];
        if (backup) {
          this.setState({
            backup: backup.id,
            datacenter: backup.datacenter.id,
            sourceTab: 1,
          });
        }
      }
    }
  }

  async onSubmit({ group, labels, password, backups }) {
    const { dispatch } = this.props;
    try {
      this.setState({ loading: true });
      const [label] = labels;
      const linode = await this.createLinode({ group, label, password, backups });
      dispatch(linodes.until(l => l.status !== 'provisioning', linode.id));
      this.setState({ loading: false });
      dispatch(push(`/linodes/${linode.id}`));
      // TODO: handle creating multiple linodes at once ? refer to
      // TODO: previous commit history for example
    } catch (response) {
      const { errors } = await response.json();
      const errorsByField = {};
      errors.forEach(({ field, reason }) => {
        if (!(field in errorsByField)) errorsByField[field] = [];
        errorsByField[field].push(reason);
      });
      this.setState({ loading: false, errors: errorsByField });
    }
  }

  createLinode({ group, label, password, backups }) {
    const { dispatch } = this.props;
    const { type, datacenter, distribution, backup } = this.state;
    return dispatch(linodes.post({
      root_pass: password,
      type,
      distribution,
      backup,
      datacenter,
      label,
      group,
      with_backups: backups,
    }));
  }

  render() {
    const {
      distributions,
      linodes,
      datacenters,
      types,
    } = this.props;
    const {
      backup,
      distribution,
      datacenter,
      type,
      sourceTab,
      loading,
    } = this.state;


    const selectedType = type === null ? null : types.types[type];

    return (
      <div className="container create-page">
        <h1>Add a Linode</h1>
        <section className="card">
          <Source
            distribution={distribution}
            backup={backup}
            selectedTab={sourceTab}
            distributions={distributions.distributions}
            onTabChange={ix => this.setState({ sourceTab: ix })}
            onSourceSelected={(type, id, linodeId) => {
              if (type === 'backup' && linodeId && id) {
                const linode = linodes.linodes[linodeId];
                const backup = linode._backups.backups[id];
                this.setState({
                  backup: id,
                  datacenter: backup.datacenter.id,
                  distribution: null,
                });
              } else {
                this.setState({ [type]: id, backup: null });
              }
            }}
            linodes={linodes}
          />
        </section>
        <section className="card">
          <Datacenter
            selected={datacenter}
            datacenters={datacenters.datacenters}
            disabled={backup !== null}
            onDatacenterSelected={id => this.setState({ datacenter: id })}
          />
        </section>
        <section className="card">
          <Plan
            selected={type}
            types={types.types}
            onServiceSelected={id => this.setState({ type: id })}
          />
        </section>
        <section className="card">
          <Details
            selectedType={selectedType}
            onSubmit={this.onSubmit}
            submitEnabled={!!(distribution || backup) && !!datacenter && !!type && !loading}
            errors={this.state.errors}
          />
        </section>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  distributions: PropTypes.object,
  linodes: PropTypes.object,
  types: PropTypes.object,
  datacenters: PropTypes.object,
  location: PropTypes.object,
};

function select(state) {
  return {
    distributions: state.api.distributions,
    linodes: state.api.linodes,
    datacenters: state.api.datacenters,
    types: state.api.types,
  };
}

export default connect(select)(IndexPage);
