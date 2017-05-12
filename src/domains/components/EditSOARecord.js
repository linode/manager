import React, { PropTypes, Component } from 'react';

import { Form, Input, SubmitButton, Select, ModalFormGroup } from 'linode-components/forms';
import { CancelButton } from 'linode-components/buttons';

import { domains } from '~/api';
import { dispatchOrStoreErrors, FormSummary } from '~/components/forms';

import SelectDNSSeconds from './SelectDNSSeconds';


export default class EditSOARecord extends Component {
  constructor(props) {
    super();

    const {
      group, domain: zone, ttl_sec: defaultTTL, refresh_sec: refreshRate,
      retry_sec: retryRate, expire_sec: expireTime, soa_email: email, status,
      axfr_ips: axfrIps, master_ips: masterIps,
    } = props.zone;

    this.state = {
      errors: {},
      loading: false,
      group,
      zone,
      defaultTTL,
      refreshRate,
      retryRate,
      expireTime,
      email,
      status,
      axfrIps,
      masterIps,
    };
  }

  onSubmit = () => {
    const { dispatch, close } = this.props;
    const { group, zone, defaultTTL, refreshRate, retryRate, expireTime, email,
      status, masterIps, axfrIps,
    } = this.state;
    const data = {
      group: group,
      domain: zone,
      ttl_sec: defaultTTL,
      refresh_sec: refreshRate,
      retry_sec: retryRate,
      expire_sec: expireTime,
      soa_email: email,
      master_ips: masterIps.split(';'),
      axfr_ips: axfrIps.split(';'),
      status,
    };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => domains.put(data, this.props.zone.id),
      () => close(zone)(),
    ]));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  render() {
    const { close } = this.props;
    const { type } = this.props.zone;
    const {
      group, zone, defaultTTL, refreshRate, retryRate, expireTime, email,
      masterIps, axfrIps, status, errors, loading,
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
        {type === 'slave' ?
          <ModalFormGroup
            errors={errors}
            name="master_ips"
            label="Masters"
            apiKey="master_ips"
            description="The IP addresses of the master DNS servers for this zone.
              Semicolon or new line delimited. (maximum: 6)"
          >
            <textarea
              name="master_ips"
              value={masterIps}
              placeholder="172.92.1.4;209.124.103.15"
              onChange={this.onChange}
            />
          </ModalFormGroup>
        : null}
        <ModalFormGroup
          errors={errors}
          name="axfr_ips"
          label="Domain Transfers"
          apiKey="axfr_ips"
          description="The IP addresses allowed to AXFR this entire zone.
            Semicolon or new line delimited. (maximum: 6)"
        >
          <textarea
            name="axfr_ips"
            value={axfrIps}
            placeholder="172.92.1.4;209.124.103.15"
            onChange={this.onChange}
          />
        </ModalFormGroup>
        {type === 'master' ?
          <span>
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
            <ModalFormGroup
              label="Status"
              id="status"
              apiKey="status"
              errors={errors}
            >
              <Select
                value={status}
                onChange={this.onChange}
                id="status"
                name="status"
              >
                <option value="active">Active - Turn ON serving of this domain</option>
                <option value="disabled">Disabled - Turn OFF serving of this domain</option>
                <option value="edit_mode">Edit Mode - Use this mode while making edits</option>
              </Select>
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
              description="How often secondary (slave) nameservers check with
                the master for updates"
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
              description="How long secondary (slave) nameservers wait
                before considering DNS data stale if it cannot reach the
                master nameserver"
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
          </span>
        : null}
        <div className="Modal-footer">
          <CancelButton onClick={close()} />
          <SubmitButton disabled={loading} />
          <FormSummary errors={errors} />
        </div>
      </Form>
    );
  }
}

EditSOARecord.propTypes = {
  dispatch: PropTypes.func.isRequired,
  zone: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired,
};
