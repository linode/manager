import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { reduceErrors, ErrorSummary } from '~/errors';
import HelpButton from '~/components/HelpButton';
import CheckboxInputCombo from '~/components/CheckboxInputCombo';
import { getLinode } from '~/linodes/linode/layouts/IndexPage';
import { Form, SubmitButton, FormGroup, FormGroupError } from '~/components/form';
import { linodes } from '~/api';
import { setSource } from '~/actions/source';

export class AlertsPage extends Component {
  constructor(props) {
    super(props);
    this.getLinode = getLinode.bind(this);
    this.renderAlertRow = this.renderAlertRow.bind(this);
    this.state = {
      loading: false,
      errors: {},
      alerts: this.getLinode().alerts || {
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
    const { dispatch } = this.props;
    const { id } = this.getLinode();

    this.setState({ loading: true, errors: {} });

    try {
      await dispatch(linodes.put({ alerts: this.state.alerts }, id));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors });
    }

    this.setState({ loading: false });
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

    return (
      <FormGroup
        className="row"
        key={name}
        errors={errors}
        name="threshold"
        crumbs={`alerts.${key}`}
      >
        <div className="col-sm-2 label-col">
          <span>{name}:</span>
        </div>
        <div className="col-sm-10 content-col">
          <CheckboxInputCombo
            checkboxOnChange={enabledChange}
            checkboxChecked={enabled}
            checkboxLabel="Enable"
            inputValue={threshold}
            inputOnChange={thresholdChange}
            inputType={"number"}
            inputMin={0}
            inputLabel={label}
          />
          <FormGroupError errors={errors} name={'threshold'} crumbs={`alerts.${key}`} />
          <div>
            <small className="text-muted">Triggered by: {text} exceeding this value</small>
          </div>
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

    return (
      <section className="card linode-alerts">
        <header>
          <h2>
            Alerts
            <HelpButton to="https://google.com" />
          </h2>
        </header>
        <Form onSubmit={() => this.saveChanges()}>
          {alerts.map(this.renderAlertRow)}
          <div className="form-group row">
            <div className="offset-sm-2 col-sm-10">
              <SubmitButton disabled={loading} />
            </div>
          </div>
          <ErrorSummary errors={errors} />
        </Form>
      </section>
    );
  }
}

AlertsPage.propTypes = {
  linodes: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

function select(state) {
  return { linodes: state.api.linodes };
}

export default connect(select)(AlertsPage);
