import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card, CardHeader } from 'linode-components/cards';
import { CheckboxInputCombo, Form, SubmitButton } from 'linode-components/forms';
import { selectLinode } from '../../utilities';
import { linodes } from '~/api';
import { setSource } from '~/actions/source';

export class AlertsPage extends Component {
  constructor(props) {
    super(props);
    this.renderAlertRow = this.renderAlertRow.bind(this);
    this.state = {
      loading: false,
      alerts: props.linode.alerts || {
        cpu: { threshold: 0, enabled: false },
        io: { threshold: 0, enabled: false },
        transfer_in: { threshold: 0, enabled: false },
        transfer_out: { threshold: 0, enabled: false },
        transfer_quota: { threshold: 0, enabled: false },
      },
    };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
  }

  async saveChanges() {
    const { dispatch, linode } = this.props;
    this.setState({ loading: true });
    await dispatch(linodes.put({ alerts: this.state.alerts }, linode.id));
    this.setState({ loading: false });
  }

  renderAlertRow({ key, name, value, label, text }) {
    const { loading } = this.state;
    const { threshold, enabled } = value;
    const int = i => parseInt(i, 10);
    const thresholdChange = e =>
      this.setState({ alerts: {
        ...this.state.alerts,
        [key]: { ...value, threshold: int(e.target.value) } },
      });
    const enabledChange = e =>
      this.setState({ alerts: {
        ...this.state.alerts,
        [key]: { ...value, enabled: e.target.checked } },
      });

    return (
      <div className="form-group row" key={name}>
        <label className="col-sm-2 col-form-label">{name}:</label>
        <div className="col-sm-10 ">
          <CheckboxInputCombo
            checkboxLabel="Enable"
            checkboxChecked={enabled}
            checkboxOnChange={enabledChange}
            checkboxDisabled={loading}
            inputType="number"
            inputValue={threshold}
            inputOnChange={thresholdChange}
            inputLabel={label}
            inputDisabled={loading}
          />
          <small className="text-muted">Triggered by: {text} exceeding this value</small>
        </div>
      </div>
    );
  }

  render() {
    const { cpu, io, transfer_in, transfer_out, transfer_quota } = this.state.alerts;
    const { loading } = this.state;
    const alerts = [
      {
        name: 'CPU usage', key: 'cpu', value: cpu, label: '%',
        text: 'average CPU usage over 2 hours',
      },
      {
        name: 'Disk IO rate', key: 'io', value: io, label: 'IOPS',
        text: 'average disk IOPS over 2 hours',
      },
      {
        name: 'Incoming traffic', key: 'transfer_in', value: transfer_in,
        label: 'Mbit/s', text: 'average incoming traffic over a 2 hour period',
      },
      {
        name: 'Outbound traffic', key: 'transfer_out', value: transfer_out,
        label: 'Mbit/s', text: 'average outbound traffic over a 2 hour period',
      },
      {
        name: 'Transfer quota', key: 'transfer_quota', value: transfer_quota,
        label: '%', text: 'percentage of network transfer quota used',
      },
    ];

    return (
      <Card
        className="linode-alerts"
        header={
          <CardHeader title="Alerts" helpLink="https://google.com" />
        }
      >
        <Form onSubmit={() => this.saveChanges()}>
          {alerts.map(this.renderAlertRow)}
          <div className="row">
            <div className="offset-sm-2 col-sm-10">
              <SubmitButton disabled={loading} />
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
