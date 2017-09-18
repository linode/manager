import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Button } from 'linode-components/buttons';
import { Card, CardHeader } from 'linode-components/cards';
import { FormGroup, Input } from 'linode-components/forms';

import { setSource } from '~/actions/source';
import { transferPool } from '~/api/account';
import { linodeStats } from '~/api/linodes';
import { getObjectByLabelLazily } from '~/api/util';
import { TransferPool } from '~/components';
import {
  GraphGroup,
  makeCPUGraphMetadata,
  makeIOGraphMetadata,
  makeNetv4GraphMetadata,
  makeNetv6GraphMetadata,
} from '~/components/graphs/GraphGroup';
import { ZONES } from '~/constants';
import Region from '~/linodes/components/Region';
import DistroStyle from '~/linodes/components/DistroStyle';
import WeblishLaunch from '~/linodes/components/WeblishLaunch';

import { selectLinode } from '../utilities';
import { planStats } from '../../components/PlanStyle';


export class DashboardPage extends Component {
  static async preload({ dispatch, getState }, { linodeLabel }) {
    await dispatch(transferPool());
    const { id } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));

    try {
      await dispatch(linodeStats(id));
    } catch (e) {
      // Stats aren't available.
    }
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    await dispatch(setSource(__filename));
  }

  renderGraphs() {
    const { timezone, linode: { _stats: stats } } = this.props;

    let body = <p>No graphs are available.</p>;
    if (stats) {
      const allGraphData = [
        makeCPUGraphMetadata(stats.cpu),
        makeIOGraphMetadata(stats.io),
        makeNetv4GraphMetadata(stats.netv4),
        makeNetv6GraphMetadata(stats.netv6),
      ];
      body = <GraphGroup timezone={timezone} allGraphData={allGraphData} />;
    }

    return (
      <Card header={<CardHeader title="Graphs" />} className="graphs">
        {body}
      </Card>
    );
  }

  renderDetails() {
    const { username, linode } = this.props;
    const lishLink = `${username}@lish-${ZONES[linode.region]}.linode.com`;

    const publicIPv4 = linode.ipv4.filter(ip => !ip.startsWith('192.168'))[0];

    return (
      <div className="row">
        <section className="col-lg-6 col-md-12 col-sm-12">
          <Card header={<CardHeader title="Summary" />} className="full-height">
            <div className="row">
              <div className="col-sm-4 row-label">
                IP Addresses
              </div>
              <div className="col-sm-8">
                <ul className="list-unstyled" id="ips">
                  <li>{publicIPv4}</li>
                  {linode.ipv6 === 'None/64' ? null : <li className="text-muted">{linode.ipv6}</li>}
                </ul>
                <div>
                  <small className="text-muted">
                    <Link to={`/linodes/${linode.label}/networking`}>Networking</Link>
                  </small>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-4 row-label">Deployed From</div>
              <div className="col-sm-8" id="distro">
                <DistroStyle linode={linode} />
                <div>
                  <small className="text-muted">
                    <Link to={`/linodes/${linode.label}/rebuild`}>Rebuild</Link>
                  </small>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-4 row-label">Type</div>
              <div className="col-sm-8" id="type">
                {planStats(linode.type)}
                <div>
                  <small className="text-muted">
                    <Link to={`/linodes/${linode.label}/resize`}>Resize</Link>
                  </small>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-4 row-label">Region</div>
              <div className="col-sm-8" id="region"><Region obj={linode} /></div>
            </div>
            <div className="row linode-backups">
              <div className="col-sm-4 row-label">Backup</div>
              <div className="col-sm-8" id="backup-status">
                <Link to={`/linodes/${linode.label}/backups`}>
                  {linode.backups.enabled ? 'View Backups' : 'Enable Backups'}
                </Link>
              </div>
            </div>
          </Card>
        </section>
        <section className="col-lg-6 col-md-12 col-sm-12">
          <Card header={<CardHeader title="Access" />} className="full-height">
            <FormGroup className="row">
              <label htmlFor="ssh-input" className="col-sm-4 col-form-label">SSH</label>
              <div className="col-sm-8">
                <div className="input-group">
                  <Input
                    id="ssh-input"
                    value={`ssh root@${publicIPv4}`}
                    readOnly
                  />
                  <span className="input-group-btn">
                    <Button href={`ssh://root@${publicIPv4}`}>SSH</Button>
                  </span>
                </div>
              </div>
            </FormGroup>
            <FormGroup className="row">
              <label className="col-sm-4 col-form-label" htmlFor="lish-input">
                Console
              </label>
              <div className="col-sm-8">
                <div className="input-group">
                  <Input
                    id="lish-input"
                    value={`ssh -t ${lishLink}`}
                    readOnly
                  />
                  <span className="input-group-btn">
                    <Button href={`ssh://${lishLink}`}>SSH</Button>
                  </span>
                  <span className="input-group-btn">
                    <WeblishLaunch linode={linode} />
                  </span>
                </div>
                <small className="text-muted">
                  Lish listens on ports 22, 443, and 2200.
                </small>
              </div>
            </FormGroup>
          </Card>
        </section>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderDetails()}
        <div className="row">
          <div className="col-sm-12">
            {this.renderGraphs()}
          </div>
        </div>
        <TransferPool transfer={this.props.transfer} />
      </div>
    );
  }
}

DashboardPage.propTypes = {
  linode: PropTypes.object,
  username: PropTypes.string,
  timezone: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  transfer: PropTypes.object.isRequired,
};

function select(state, props) {
  const { linode } = selectLinode(state, props);
  const { username, timezone } = state.api.profile;
  const transfer = state.api.account._transferpool;
  return { linode, username, timezone, transfer };
}

export default connect(select)(DashboardPage);
