import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import { Card, CardHeader } from 'linode-components/cards';
import { CheckboxInputCombo, Form, SubmitButton } from 'linode-components/forms';
import { linodes } from '~/api';
import { setSource } from '~/actions/source';
import { linodes } from '~/api';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';

import { selectLinode } from '../../utilities';


export class AlertsPage extends Component {
  constructor(props) {
    super(props);
    this.renderAlertRow = this.renderAlertRow.bind(this);
    this.state = {
      loading: false,
      errors: {},
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

  onSubmit = async () => {
    const { dispatch, linode } = this.props;

    await dispatch(dispatchOrStoreErrors.apply(this, [
      [() => linodes.put({ alerts: this.state.alerts }, linode.id)],
    ]));
  }

  renderAlertRow({ key, name, value, label, text }) {
    const { errors } = this.state;
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
    const crumbs = `alerts.${key}`;

    return (
      <FormGroup className="row" name="threshold" crumbs={crumbs} errors={errors} key={name}>
        <label className="col-sm-2 col-form-label">{name}</label>
        <div className="col-sm-10 clearfix">
          <div className="clearfix">
            <div className="float-sm-left">
              <CheckboxInputCombo
                checkboxLabel="Enable"
                checkboxChecked={enabled}
                checkboxOnChange={enabledChange}
                inputType="number"
                inputValue={threshold}
                inputOnChange={thresholdChange}
                inputLabel={label}
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

    const header = <CardHeader title="Alerts" helpLink="https://google.com" />;

    return (
      <Card header={header}>
        <Form onSubmit={this.onSubmit}>
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
