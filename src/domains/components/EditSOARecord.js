import React, { PropTypes, Component } from 'react';

import { domains } from '~/api';
import { ModalFormGroup, Select } from 'linode-components/forms';
import SelectDNSSeconds from './SelectDNSSeconds';
import { Form, Input, SubmitButton } from 'linode-components/forms';
import { CancelButton } from 'linode-components/buttons';
import { reduceErrors, ErrorSummary } from '~/errors';

export default class EditSOARecord extends Component {
  constructor(props) {
    super();

    const {
      display_group: group, domain: zone, ttl_sec: defaultTTL, refresh_sec: refreshRate,
      retry_sec: retryRate, expire_sec: expireTime, soa_email: email,
    } = props.zone;

    this.state = {
      errors: {},
      saving: false,
      group,
      zone,
      defaultTTL,
      refreshRate,
      retryRate,
      expireTime,
      email,
    };
  }

  onSubmit = async () => {
    const { dispatch, close } = this.props;
    const {
      group, zone, defaultTTL, refreshRate, retryRate, expireTime, email,
    } = this.state;

    this.setState({ errors: {}, saving: true });

    try {
      await dispatch(domains.put({
        display_group: group,
        domain: zone,
        ttl_sec: defaultTTL,
        refresh_sec: refreshRate,
        retry_sec: retryRate,
        expire_sec: expireTime,
        soa_email: email,
      }, this.props.zone.id));

      this.setState({ saving: false });
      close(zone)();
    } catch (response) {
      if (!response.json) {
        // eslint-disable-next-line no-console
        console.error(response);
      }

      const errors = await reduceErrors(response);
      this.setState({ errors, saving: false });
    }
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  render() {
    const { close } = this.props;
    const {
      group, zone, defaultTTL, refreshRate, retryRate, expireTime, email, errors, saving,
    } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
        <ModalFormGroup errors={errors} id="zone" label="Primary Domain" apiKey="domain">
          <Input
            id="zone"
            name="zone"
            value={zone}
            placeholder="domain.com"
            onChange={this.onChange}
          />
        </ModalFormGroup>
        <ModalFormGroup
          label="Group"
          description="Domains are grouped together on the Domain list page"
          id="group"
          apiKey="group"
          errors={errors}
        >
          <Input
            id="group"
            name="group"
            value={group}
            placeholder=""
            onChange={this.onChange}
          />
        </ModalFormGroup>
        <ModalFormGroup
          label="Email"
          description="Email address of the Domain administrator"
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
          description="The default Time To Live for all entries in the Domain"
          id="defaultTTL"
          apiKey="ttl_sec"
          errors={errors}
        >
          <SelectDNSSeconds
            id="defaultTTL"
            name="defaultTTL"
            value={defaultTTL}
            onChange={this.onChange}
          />
        </ModalFormGroup>
        <ModalFormGroup
          label="Refresh Rate"
          description="How often secondary (slave) nameservers check with the master for updates"
          id="refreshRate"
          apiKey="refresh_sec"
          errors={errors}
        >
          <SelectDNSSeconds
            id="refreshRate"
            name="refreshRate"
            value={refreshRate}
            onChange={this.onChange}
          />
        </ModalFormGroup>
        <ModalFormGroup
          label="Retry Rate"
          description={('How long secondary (slave) nameservers wait to contact the master ' +
                        'nameserver again if the last attempt failed')}
          id="retryRate"
          apiKey="retry_sec"
          errors={errors}
        >
          <SelectDNSSeconds
            id="retryRate"
            name="retryRate"
            value={retryRate}
            onChange={this.onChange}
          />
        </ModalFormGroup>
        <ModalFormGroup
          label="Expire Time"
          description={('How long secondary (slave) nameservers wait before considering DNS data ' +
                        'stale if it cannot reach the master nameserver')}
          id="expireTime"
          apiKey="expire_sec"
          errors={errors}
        >
          <Select
            value={Math.max(expireTime, 604800).toString()}
            onChange={this.onChange}
            id="expireTime"
            name="expireTime"
          >
            <option value="604800">Default (1 week)</option>
            <option value="1209600">1209600 (2 weeks)</option>
            <option value="2419200">2419200 (4 weeks)</option>
          </Select>
        </ModalFormGroup>
        <div className="Modal-footer">
          <CancelButton onClick={close()} />
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
  close: PropTypes.func.isRequired,
};
