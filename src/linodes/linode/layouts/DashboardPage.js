import range from 'lodash/range';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Button } from 'linode-components';
import { Card, CardHeader } from 'linode-components';
import { FormGroup, Input, Select } from 'linode-components';
import { onChange } from 'linode-components';

import { setSource } from '~/actions/source';
import { transferPool } from '~/api/ad-hoc//account';
import { linodeStats } from '~/api/ad-hoc/linodes';
import { getObjectByLabelLazily } from '~/api/util';
import { ChainedDocumentTitle, TransferPool } from '~/components';
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
import { UpgradeToKVM } from '../components';


export class DashboardPage extends Component {
  static async preload({ dispatch }, { linodeLabel }) {
    await dispatch(transferPool());
    const { id } = await dispatch(getObjectByLabelLazily('linodes', linodeLabel));

    try {
      await dispatch(linodeStats(id));
    } catch (e) {
      // Stats aren't available.
    }
  }

  constructor() {
    super();

    this.state = {
      year: new Date().getFullYear().toString(),
      month: '0',
    };

    this.onChange = onChange.bind(this);
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    await dispatch(setSource(__filename));
  }

  async updateStats(year, month) {
    const { dispatch, linode } = this.props;
    if (month !== '0') {
      await dispatch(linodeStats(linode.id, year, month));
    } else {
      await dispatch(linodeStats(linode.id));
    }
  }

  monthOnChange = async (event) => {
    const { target: { value } } = event;
    if (value === '0') {
      this.setState({ year: new Date().getFullYear().toString() });
    }

    const { year } = this.state;
    await this.updateStats(year, value);
    this.setState({ month: value });
  }

  yearOnChange = async (event) => {
    const { target: { value } } = event;
    let { month } = this.state;

    if (value !== new Date().getFullYear().toString() && month === '0') {
      month = 1;
    }

    await this.updateStats(value, month);
    this.setState({ month: month, year: value });
  }

  renderDetails() {
    const { username, linode, dispatch, images } = this.props;
    const lishLink = `${username}@lish-${ZONES[linode.region]}.linode.com`;

    const publicIPv4 = linode.ipv4.filter(ip => !ip.startsWith('192.168'))[0];

    return (
      <div className="row">
        <ChainedDocumentTitle title="Dashboard" />
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
                <DistroStyle linode={linode} images={images} />
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
            {linode.hypervisor === 'kvm' ? null : (
              <div className="row">
                <div className="col-sm-4 row-label">Hypervisor</div>
                <div className="col-sm-8" id="hypervisor">
                  Xen
                  <div>
                    <small className="text-muted">
                      <Link
                        className="force-link"
                        onClick={() => UpgradeToKVM.trigger(dispatch, linode)}
                      >Upgrade to KVM</Link>
                    </small>
                  </div>
                </div>
              </div>
            )}
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
            <FormGroup name="ip-list-details" className="row">
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
            <FormGroup className="row" name="list-form">
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

  renderGraphs() {
    const { year, month } = this.state;
    const { timezone, linode: { _stats: stats }, linode } = this.props;
    const created = new Date(linode.created).getFullYear();
    const years = range(created, new Date().getFullYear() + 1).map(
      (year) => ({ value: year, label: year })
    );
    const months = ['Last 24', 'Jan', 'Feb', 'Mar', 'Apr', 'May',
      'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(
      (month, i) => ({ value: i, label: month })
    );

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

    const nav = (
      <div className="GraphGroup-graph">
        <Select
          className="Select Select--native form-control"
          name="year"
          value={year}
          options={years}
          onChange={this.yearOnChange}
        />
        <Select
          className="Select Select--native form-control"
          name="month"
          value={month}
          options={months}
          onChange={this.monthOnChange}
        />
      </div>
    );

    return (
      <Card header={<CardHeader title="Graphs" nav={nav} />} className="graphs">
        {body}
      </Card>
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
  images: PropTypes.object.isRequired,
  username: PropTypes.string,
  timezone: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  transfer: PropTypes.object.isRequired,
};

function select(state, props) {
  const { linode } = selectLinode(state, props);
  const { images } = state.api.images;
  const { username, timezone } = state.api.profile;
  const transfer = state.api.account._transferpool;
  return { linode, username, timezone, transfer, images };
}

export default connect(select)(DashboardPage);
