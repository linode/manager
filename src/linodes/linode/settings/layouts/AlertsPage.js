import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';
import {
  Input,
  Form,
  FormGroup,
  FormGroupError,
  FormSummary,
  SubmitButton,
} from 'linode-components/forms';

import { setSource } from '~/actions/source';
import { linodes } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';

import { selectLinode } from '../../utilities';


export class AlertsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      errors: {},
      alerts: props.linode.alerts || {
        cpu: 0,
        io: 0,
        transfer_in: 0,
        transfer_out: 0,
        transfer_quota: 0,
      },
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  onSubmit = () => {
    const { dispatch, linode } = this.props;

    return dispatch(dispatchOrStoreErrors.apply(this, [
      [() => linodes.put({ alerts: this.state.alerts }, linode.id)],
    ]));
  }

  renderAlertRow = ({ key, name, value, label, text }) => {
    const { errors } = this.state;
    const int = i => parseInt(i, 10);
    const thresholdChange = e =>
      this.setState({
        alerts: {
          ...this.state.alerts,
          [key]: int(e.target.value),
        },
      });

    const crumbs = `alerts.${key}`;

    return (
      <FormGroup className="row" name="threshold" crumbs={crumbs} errors={errors} key={name}>
        <label className="col-sm-2 col-form-label">{name}</label>
        <div className="col-sm-10">
          <div className="clearfix">
            <div className="float-sm-left">
              <Input
                type="number"
                value={value}
                onChange={thresholdChange}
                label={label}
              />
            </div>
            <FormGroupError
              errors={errors}
              name="threshold"
              crumbs={crumbs}
              className="float-sm-left"
            />
          </div>
          <small className="text-muted">Triggered by: {text} exceeding this value</small>
        </div>
      </FormGroup>
    );
  }

  render() {
    const { cpu, io, transfer_in, transfer_out, transfer_quota } = this.state.alerts;
    const { loading, errors } = this.state;
    const alerts = [
      {
        name: 'CPU Usage', key: 'cpu', value: cpu, label: '%',
        text: 'average CPU usage over 2 hours',
      },
      {
        name: 'Disk IO Rate', key: 'io', value: io, label: 'IOPS',
        text: 'average disk IOPS over 2 hours',
      },
      {
        name: 'Incoming Traffic', key: 'transfer_in', value: transfer_in,
        label: 'Mbit/s', text: 'average incoming traffic over a 2 hour period',
      },
      {
        name: 'Outbound Traffic', key: 'transfer_out', value: transfer_out,
        label: 'Mbit/s', text: 'average outbound traffic over a 2 hour period',
      },
      {
        name: 'Transfer Quota', key: 'transfer_quota', value: transfer_quota,
        label: '%', text: 'percentage of network transfer quota used',
      },
    ];

    const header = <CardHeader title="Alerts" />;

    return (
      <Card header={header}>
        <Form
          onSubmit={this.onSubmit}
          analytics={{ title: 'Linode Alert Settings' }}
        >
          {alerts.map(this.renderAlertRow)}
          <div className="row">
            <div className="offset-sm-2 col-sm-10">
              <SubmitButton disabled={loading} />
              <FormSummary errors={errors} success="Alerts settings saved." />
            </div>
          </div>
        </Form>
      </Card>
    );
  }
}

AlertsPage.propTypes = {
  linode: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(selectLinode)(AlertsPage);
