import React, { PropTypes, Component } from 'react';

import { hideModal } from '~/actions/modal';
import { ModalFormGroup } from '~/components/form';
import SelectTTL from './SelectTTL';
import { Form, Input, SubmitButton, CancelButton } from '~/components/form';
import { reduceErrors, ErrorSummary } from '~/errors';

export default class EditSOARecord extends Component {
  constructor(props) {
    super();

    const {
      display_group: displayGroup, dnszone: zone, ttl_sec: defaultTTL, refresh_sec: refreshRate,
      retry_sec: retryRate, expire_sec: expireTime, soa_email: email,
    } = props.zone;

    this.state = {
      errors: {},
      saving: false,
      displayGroup,
      zone,
      defaultTTL,
      refreshRate,
      retryRate,
      expireTime,
      email,
    };
  }

  onSubmit = async () => {
    const { dispatch } = this.props;
    const {
      displayGroup, zone, defaultTTL, refreshRate, retryRate, expireTime, email,
    } = this.state;

    this.setState({ saving: true });

    try {
      // TODO: do call
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors });
    }

    this.setState({ saving: false });
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  render() {
    const { dispatch } = this.props;
    const {
      displayGroup, zone, defaultTTL, refreshRate, retryRate, expireTime, email, errors, saving,
    } = this.state;

    console.log(this.state);

    return (
      <Form onSubmit={this.onSubmit}>
        <ModalFormGroup errors={errors} id="zone" label="Primary DNS" apiKey="dnszone">
          <Input
            id="zone"
            name="zone"
            value={zone}
            placeholder="ns1.domain.com"
            onChange={this.onChange}
          />
        </ModalFormGroup>
        <ModalFormGroup
          label="Email"
          description="Email address of the zone administrator"
          id="email"
          apiKey="soa_email"
          errors={errors}
        >
          <Input
            id="email"
            type="email"
            placeholder="admin@domain.com"
            name="email"
            value={email}
            onChange={this.onChange}
          />
        </ModalFormGroup>
        <h3 className="sub-header">Advanced</h3>
        <ModalFormGroup
          label="Default TTL"
          description="The default Time To Live for all entries in the zone"
          id="defaultTTL"
          apiKey="ttl_sec"
          errors={errors}
        >
          <SelectTTL
            id="defaultTTL"
            name="defaultTTL"
            value={defaultTTL}
            onChange={this.onChange}
          />
        </ModalFormGroup>
        <ModalFormGroup
          label="Refresh Rate"
          description="How often secondary / slave nameservers check with the master for updates"
          id="refreshRate"
          apiKey="refresh_sec"
          errors={errors}
        >
          <SelectTTL
            id="refreshRate"
            name="refreshRate"
            value={refreshRate}
            onChange={this.onChange}
          />
        </ModalFormGroup>
        <ModalFormGroup
          label="Retry Rate"
          description={("How long secondary / slave nameservers wait to contact the master " +
                        "nameserver again if the last attempt failed")}
          id="retryRate"
          apiKey="retry_sec"
          errors={errors}
        >
          <SelectTTL
            id="retryRate"
            name="retryRate"
            value={retryRate}
            onChange={this.onChange}
          />
        </ModalFormGroup>
        <ModalFormGroup
          label="Expire Time"
          description={("How long secondary / slave nameservers wait before considering DNS data " +
                        "stale if it cannot reach the master nameserver")}
          id="expireTime"
          apiKey="expire_sec"
          errors={errors}
        >
          <SelectTTL
            id="expireTime"
            name="expireTime"
            value={expireTime}
            onChange={this.onChange}
          />
        </ModalFormGroup>
        <div className="Modal-footer">
          <CancelButton onClick={() => dispatch(hideModal())} />
          <SubmitButton disabled={saving} />
        </div>
        <ErrorSummary errors={errors} />
      </Form>
    );
  }
}

EditSOARecord.propTypes = {
  dispatch: PropTypes.func.isRequired,
  zone: PropTypes.object.isRequired,
};
