import React, { PropTypes, Component } from 'react';
import { replace } from 'react-router-redux';

import { Input, ModalFormGroup, Select, Tags } from 'linode-components/forms';
import { FormModalBody } from 'linode-components/modals';

import { hideModal, showModal } from '~/actions/modal';
import { setTitle } from '~/actions/title';
import { domains } from '~/api';
import { dispatchOrStoreErrors } from '~/api/util';

import SelectDNSSeconds, {
  ONE_WEEK,
  TWO_WEEKS,
  FOUR_WEEKS,
} from './SelectDNSSeconds';


export default class EditSOARecord extends Component {
  static title = 'Edit SOA Record'

  static trigger(dispatch, domain) {
    dispatch(showModal(EditSOARecord.title, (
      <EditSOARecord
        dispatch={dispatch}
        domains={domain}
        close={(newDomain) => () => {
          dispatch(hideModal());
          if (newDomain) {
            dispatch(replace(`/domains/${newDomain || domain.domain}`));
          }
        }}
      />
    )));
  }

  constructor(props) {
    super(props);

    const {
      group, domain, ttl_sec: defaultTTL, refresh_sec: refreshRate,
      retry_sec: retryRate, expire_sec: expireTime, soa_email: email, status,
      axfr_ips: axfrIps, master_ips: masterIps,
    } = props.domains;

    this.state = {
      errors: {},
      group,
      domain,
      defaultTTL,
      refreshRate,
      retryRate,
      expireTime,
      email,
      status,
      axfrIps: axfrIps,
      masterIps: masterIps,
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
      status,
      ttl_sec: parseInt(defaultTTL),
      refresh_sec: parseInt(refreshRate),
      retry_sec: parseInt(retryRate),
      expire_sec: parseInt(expireTime),
      soa_email: email,
      master_ips: masterIps,
      axfr_ips: axfrIps,
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
    const { close, domains: { type } } = this.props;
    const {
      group, domain, defaultTTL, refreshRate, retryRate, expireTime, email,
      masterIps, axfrIps, status, errors,
    } = this.state;

    const statusOptions = [
      { value: 'active', label: 'Active (turn on serving of this domain)' },
      { value: 'disabled', label: 'Disabled (turn off serving of this domain)' },
      { value: 'edit_mode', label: 'Edit Mode (use while making edits)' },
    ];

    const expireOptions = [
      { value: ONE_WEEK, label: 'Default (1 week)' },
      { value: TWO_WEEKS, label: `${TWO_WEEKS} (2 weeks)` },
      { value: FOUR_WEEKS, label: `${FOUR_WEEKS} (4 weeks)` },
    ];

    return (
      <FormModalBody
        onSubmit={this.onSubmit}
        onCancel={close()}
        analytics={{ title: EditSOARecord.title }}
        errors={errors}
      >
        <div>
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
          {type !== 'slave' ? null : (
            <ModalFormGroup
              errors={errors}
              name="master_ips"
              label="Masters"
              id="masterIps"
              apiKey="master_ips"
              description="Up to 6 IP addresses of the master DNS servers for this zone."
            >
              <Tags
                value={masterIps}
                id="masterIps"
                name="masterIps"
                maxTags={6}
                onChange={this.onChange}
              />
            </ModalFormGroup>)}
          <ModalFormGroup
            errors={errors}
            name="axfr_ips"
            label="Domain Transfers"
            apiKey="axfr_ips"
            id="axfrIps"
            description="Up to 6 IP addresses allowed to AXFR this entire zone."
          >
            <Tags
              value={axfrIps}
              id="axfrIps"
              name="axfrIps"
              maxTags={6}
              onChange={this.onChange}
            />
          </ModalFormGroup>
          {type !== 'master' ? null : (
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
                  options={statusOptions}
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
                  value={expireTime}
                  onChange={this.onChange}
                  id="expireTime"
                  name="expireTime"
                  options={expireOptions}
                />
              </ModalFormGroup>
            </span>
          )}
        </div>
      </FormModalBody>
    );
  }
}

EditSOARecord.propTypes = {
  dispatch: PropTypes.func.isRequired,
  domains: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired,
};
