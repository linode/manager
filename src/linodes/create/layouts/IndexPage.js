import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import Source from '../components/Source';
import Plan from '../components/Plan';
import Datacenter from '../components/Datacenter';
import Details from '../components/Details';
import { linodes } from '~/api';
import { actions as linodeActions } from '~/api/configs/linodes';
import { randomInitialProgress, linodeBackups } from '~/api/linodes';
import { setError } from '~/actions/errors';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { getBackup } from '~/linodes/linode/backups/layouts/BackupPage';
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
    dispatch(setTitle('Add a Linode'));
    const { location } = this.props;
    if (location.query && location.query.linode && location.query.backup) {
      let _linodes = this.props.linodes;
      let linode = _linodes.linodes[location.query.linode];
      if (linode) {
        await dispatch(linodeBackups(
          [location.query.linode], [location.query.backup]));
        _linodes = this.props.linodes;
        linode = _linodes.linodes[location.query.linode];
        const backup = getBackup(linode._backups, [location.query.backup]);
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

  async onSubmit({ group, label, password, backups }) {
    const { dispatch } = this.props;

    this.setState({ loading: true });

    try {
      const { id } = await this.createLinode({ group, label, password, backups });
      dispatch(linodeActions.one({ __progress: randomInitialProgress() }, id));

      dispatch(push(`/linodes/${label}`));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors });
    }

    this.setState({ loading: false });
  }

  createLinode({ group, label, password, backups }) {
    const { dispatch } = this.props;
    const { type, datacenter, distribution, backup } = this.state;

    const data = {
      root_pass: password,
      type,
      distribution,
      backup,
      datacenter,
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
        <Source
          distribution={distribution}
          backup={backup}
          selectedTab={sourceTab}
          distributions={distributions.distributions}
          onTabChange={ix => this.setState({ sourceTab: ix })}
          onSourceSelected={(type, id, linodeId) => {
            if (type === 'backup' && linodeId && id) {
              const linode = linodes.linodes[linodeId];
              const backup = getBackup(linode._backups, id);

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
        <Datacenter
          selected={datacenter}
          datacenters={datacenters.datacenters}
          disabled={backup !== null}
          onDatacenterSelected={id => this.setState({ datacenter: id })}
        />
        <Plan
          selected={type}
          types={types.types}
          onServiceSelected={id => this.setState({ type: id })}
        />
        <Details
          selectedType={selectedType}
          onSubmit={this.onSubmit}
          selectedDistribution={distribution}
          submitEnabled={(distribution || backup) && datacenter && type && !loading}
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
