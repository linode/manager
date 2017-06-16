import React, { PropTypes, Component } from 'react';

import {
  Form,
  FormSummary,
  Input,
  SubmitButton,
  Select,
  ModalFormGroup,
} from 'linode-components/forms';
import { CancelButton } from 'linode-components/buttons';

import { domains } from '~/api';
import { setTitle } from '~/actions/title';
import { dispatchOrStoreErrors } from '~/api/util';

import SelectDNSSeconds, {
  ONE_WEEK,
  TWO_WEEKS,
  FOUR_WEEKS,
} from './SelectDNSSeconds';


export default class EditSOARecord extends Component {
  constructor(props) {
    super(props);

    const {
      group, domain, ttl_sec: defaultTTL, refresh_sec: refreshRate,
      retry_sec: retryRate, expire_sec: expireTime, soa_email: email, status,
      axfr_ips: axfrIps, master_ips: masterIps,
    } = props.domains;

    this.state = {
      errors: {},
      loading: false,
      group,
      domain,
      defaultTTL,
      refreshRate,
      retryRate,
      expireTime,
      email,
      status,
      axfrIps: axfrIps.join(';'),
      masterIps: masterIps.join(';'),
    };
  }

  onSubmit = () => {
    const { dispatch, close } = this.props;
    const { group, domain, defaultTTL, refreshRate, retryRate, expireTime, email,
      status, masterIps, axfrIps,
    } = this.state;
    const data = {
      group,
      domain,
      ttl_sec: defaultTTL,
      refresh_sec: refreshRate,
      retry_sec: retryRate,
      expire_sec: expireTime,
      soa_email: email,
      master_ips: masterIps.length ? masterIps.split(';') : [],
      axfr_ips: axfrIps.length ? axfrIps.split(';') : [],
      status,
    };

    if (!data.group) {
      delete data.group;
    }

    if (!data.soa_email) {
      delete data.soa_email;
    }

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => domains.put(data, this.props.domains.id),
      () => setTitle(data.domain),
      () => close(domain)(),
    ]));
  }

  onChange = ({ target: { name, value } }) => this.setState({ [name]: value })

  render() {
    const { close } = this.props;
    const { type } = this.props.domains;
    const {
      group, domain, defaultTTL, refreshRate, retryRate, expireTime, email,
      masterIps, axfrIps, status, errors, loading,
    } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
        <ModalFormGroup errors={errors} id="domain" label="Primary Domain" apiKey="domain">
          <Input
            id="domain"
            name="domain"
            value={domain}
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
            id="masterIps"
            apiKey="master_ips"
            description="The IP addresses of the master DNS servers for this zone.
              Semicolon delimited. (maximum: 6)"
          >
            <textarea
              name="masterIps"
              value={masterIps}
              id="masterIps"
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
          id="axfrIps"
          description="The IP addresses allowed to AXFR this entire zone.
            Semicolon delimited. (maximum: 6)"
        >
          <textarea
            name="axfrIps"
            value={axfrIps}
            id="axfrIps"
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
                value={Math.max(expireTime, ONE_WEEK).toString()}
                onChange={this.onChange}
                id="expireTime"
                name="expireTime"
              >
                <option value={ONE_WEEK}>Default (1 week)</option>
                <option value={TWO_WEEKS}>{TWO_WEEKS} (2 weeks)</option>
                <option value={FOUR_WEEKS}>{FOUR_WEEKS} (4 weeks)</option>
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
  domains: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired,
};
