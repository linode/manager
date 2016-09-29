import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import Source from '../components/Source';
import Plan from '../components/Plan';
import Datacenter from '../components/Datacenter';
import Details from '../components/Details';
import { parallel } from '~/api/util';
import { linodes, distros, datacenters, services } from '~/api';
import { setError } from '~/actions/errors';

export class IndexPage extends Component {
  constructor() {
    super();
    this.onSubmit = this.onSubmit.bind(this);
    this.createLinode = this.createLinode.bind(this);
    this.renderProgress = this.renderProgress.bind(this);
    this.state = {
      service: null,
      datacenter: null,
      distribution: null,
      backup: null,
      sourceTab: 0,
      errors: {},
      loading: false,
      progress: -1,
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    try {
      await dispatch(parallel(
        distros.all(),
        datacenters.all(),
        services.all(),
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
      if (labels.length === 1) {
        this.setState({ loading: true });
        const [label] = labels;
        const linode = await this.createLinode({ group, label, password, backups });
        this.setState({ loading: false });
        dispatch(push(`/linodes/${linode.id}`));
      } else {
        this.setState({ loading: true, progress: 0 });
        for (let i = 0; i < labels.length; ++i) {
          const label = labels[i] || `${labels[0]}-${i}`;
          await this.createLinode({ group, label, password, backups });
          this.setState({ progress: (i + 1) / labels.length });
        }
        this.setState({ loading: false });
        dispatch(push('/linodes'));
      }
    } catch (response) {
      const { errors } = await response.json();
      const errorsByField = {};
      errors.forEach(({ field, reason }) => {
        if (!(field in errorsByField)) errorsByField[field] = [];
        errorsByField[field].push(reason);
      });
      this.setState({ progress: -1, loading: false, errors: errorsByField });
    }
  }

  createLinode({ group, label, password, backups }) {
    const { dispatch } = this.props;
    const { service, datacenter, distribution, backup } = this.state;
    return dispatch(linodes.post({
      root_pass: password,
      service,
      distribution,
      backup,
      datacenter,
      label,
      group,
      backups,
    }));
  }

  renderProgress() {
    const { progress } = this.state;
    return (
      <div className="create-page">
        <h1>Add a Linode</h1>
        <div className="card page-card">
          <header>
            <h2>Provisioning Linodes</h2>
          </header>
          <div className="card-body">
            <p>Your Linodes are being provisioned.</p>
            <progress
              className="progress"
              value={progress}
              max="1"
            ></progress>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {
      distros,
      linodes,
      datacenters,
      services,
    } = this.props;
    const {
      backup,
      distribution,
      datacenter,
      service,
      sourceTab,
      loading,
      progress,
    } = this.state;

    if (progress !== -1) {
      return this.renderProgress();
    }

    return (
      <div className="container create-page">
        <h1>Add a Linode</h1>
        <section className="card">
          <Source
            distribution={distribution}
            backup={backup}
            selectedTab={sourceTab}
            distros={distros.distributions}
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
            selected={service}
            services={services.services}
            onServiceSelected={id => this.setState({ service: id })}
          />
        </section>
        <section className="card">
          <Details
            onSubmit={this.onSubmit}
            submitEnabled={!!(distribution || backup) && !!datacenter && !!service && !loading}
            errors={this.state.errors}
          />
        </section>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  distros: PropTypes.object,
  linodes: PropTypes.object,
  services: PropTypes.object,
  datacenters: PropTypes.object,
  location: PropTypes.object,
};

function select(state) {
  return {
    distros: state.api.distributions,
    linodes: state.api.linodes,
    datacenters: state.api.datacenters,
    services: state.api.services,
  };
}

export default connect(select)(IndexPage);
