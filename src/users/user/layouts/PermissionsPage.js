import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Card } from 'linode-components/cards';
import {
  Checkbox,
  Checkboxes,
  Form,
  FormGroup,
  FormSummary,
  Radio,
  SubmitButton,
} from 'linode-components/forms';

import api from '~/api';
import { dispatchOrStoreErrors, getObjectByLabelLazily } from '~/api/util';

import { selectUser } from './IndexPage';

export class PermissionsPage extends Component {
  static async preload({ dispatch }, { username }) {
    const user = await dispatch(getObjectByLabelLazily('users', username, 'username'));

    if (user.restricted) {
      await dispatch(api.users.permissions.one([username]));
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      ...props.user._permissions,
      loading: false,
      errors: {},
    };
  }

  onSubmit = () => {
    const { dispatch, user: { username } } = this.props;
    const { global, linode, nodebalancer, domain,
      stackscript, longview, image, volume } = this.state;
    const data = { global, linode, nodebalancer,
      domain, stackscript, longview, image, volume };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => api.users.permissions.put(data, username),
    ]));
  }

  updateGlobal = (name) => {
    this.setState({
      global: {
        ...this.state.global,
        [name]: !this.state.global[name],
      },
    });
  }

  updateGrant = (parentKey, object, index) => (e) => {
    const targetVal = e.target.value;
    this.setState((prevState) => {
      const stateChange = {
        [parentKey]: [
          ...prevState[parentKey],
        ],
      };
      stateChange[parentKey][index] = {
        ...prevState[parentKey][index],
        permissions: targetVal === 'none' ? null : targetVal,
      };
      return stateChange;
    });
  }

  render() {
    const { global, linode, domain, nodebalancer, longview,
      stackscript, image, volume, loading, errors } = this.state;

    const analytics = { title: 'User permissions' };

    const thingPermissions = (name) => ([
      { name, dataKey: 'permissions', label: 'None', value: 'none' },
      { name, dataKey: 'permissions', label: 'Read-Only', value: 'read_only' },
      { name, dataKey: 'permissions', label: 'Read-Write', value: 'read_write' },
    ]);

    const headerColumns = thingPermissions(''); // The same for all Grant sections

    return (
      <Form onSubmit={this.onSubmit} analytics={analytics}>
        <Card className="Permissions">
          <div className="Permissions-section">
            <h3>Global Permissions</h3>
            <Checkboxes>
              <Checkbox
                id="permission-global-linodes"
                checked={global.add_linodes}
                onChange={() => this.updateGlobal('add_linodes')}
                label="Can add Linodes to this Account ($)"
              />
              <Checkbox
                id="permission-global-nodebalancers"
                checked={global.add_nodebalancers}
                onChange={() => this.updateGlobal('add_nodebalancers')}
                label="Can add NodeBalancers to this Account ($)"
              />
              <Checkbox
                id="permission-global-longview"
                checked={global.add_longview}
                onChange={() => this.updateGlobal('add_longview')}
                label="Can add Longview clients to this Account"
              />
              <Checkbox
                id="permission-global-longview-subscription"
                checked={global.longview_subscription}
                onChange={() => this.updateGlobal('longview_subscription')}
                label="Can modify this account's Longview subscription ($)"
              />
              <Checkbox
                id="permission-global-domains"
                checked={global.add_domains}
                onChange={() => this.updateGlobal('add_domains')}
                label="Can add Domains to this Account"
              />
              <Checkbox
                id="permission-global-stackscripts"
                checked={global.add_stackscripts}
                onChange={() => this.updateGlobal('add_stackscripts')}
                label="Can create StackScripts under this account"
              />
              <Checkbox
                id="permission-global-images"
                checked={global.add_images}
                onChange={() => this.updateGlobal('add_images')}
                label="Can create frozen Images under this account"
              />
              <Checkbox
                id="permission-global-volumes"
                checked={global.add_volumes}
                onChange={() => this.updateGlobal('add_volumes')}
                label="Can add block storage volumes to this account"
              />
              <Checkbox
                id="permission-customer-cancel"
                checked={global.cancel_account}
                onChange={() => this.setState({
                  global: {
                    ...this.state.global,
                    cancel_account: !global.cancel_account,
                  },
                })}
                label="Can cancel the entire account"
              />
            </Checkboxes>

            <h3>Customer Access</h3>
            <Radio
              id="permission-customer-access-none"
              name="customer-access"
              checked={global.account_access === null}
              onChange={() => this.setState({
                global: {
                  ...this.state.global,
                  account_access: null,
                },
              })}
              label="None"
            />
            <Radio
              id="permission-customer-access-read-only"
              name="customer-access"
              checked={global.account_access === 'read_only'}
              onChange={() => this.setState({
                global: {
                  ...this.state.global,
                  account_access: 'read_only',
                },
              })}
              label="Read-Only (Can view invoices, view billing info, and will receive copies of all invoices and payment emails)" // eslint-disable-line max-len
            />
            <Radio
              id="permission-customer-access-readwrite"
              name="customer-access"
              checked={global.account_access === 'read_write'}
              onChange={() => this.setState({
                global: {
                  ...this.state.global,
                  account_access: 'read_write',
                },
              })}
              title="Can view invoices, make payments, update contact and
              billing info, and will receive copies of all invoices and
              payment emails"
              label="Read-Write (Can make payments, update contact and
                billing info, and will receive copies of all invoices and
                payment emails)"
            />

          </div>
          {[{
            parentKey: 'linode',
            title: 'Linode',
            objects: linode,
            dataColumns: (id) => thingPermissions(`linode-grants-${id}`),
          }, {
            parentKey: 'domain',
            title: 'Domain',
            objects: domain,
            dataColumns: (id) => thingPermissions(`domain-grants-${id}`),
          }, {
            parentKey: 'nodebalancer',
            title: 'NodeBalancer',
            objects: nodebalancer,
            dataColumns: (id) => thingPermissions(`nodebalancer-grants-${id}`),
          }, {
            parentKey: 'longview',
            title: 'Longview Client',
            objects: longview,
            dataColumns: (id) => thingPermissions(`longview-grants-${id}`),
          }, {
            parentKey: 'stackscript',
            title: 'Stackscript',
            objects: stackscript,
            dataColumns: (id) => thingPermissions(`stackscript-grants-${id}`),
          }, {
            parentKey: 'image',
            title: 'Image',
            objects: image,
            dataColumns: (id) => thingPermissions(`image-grants-${id}`),
          }, {
            parentKey: 'volume',
            title: 'Volume',
            objects: volume,
            dataColumns: (id) => thingPermissions(`volume-grants-${id}`),
          },
          ].map(section => (
            <div className="form-group Permissions-section">
              <h3>{section.title}</h3>
              {!section.objects.length ?
                <div className="text-muted">No {section.title}s found.</div> :
                <table className="Table  Table--secondary">
                  <thead>
                    <tr>
                      <th className="LabelColumn">{section.title}</th>
                      {headerColumns.map(column => (
                        <th className="PermissionsCheckboxColumn">{column.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.objects.map((object, idx) => (
                      <tr className="TableRow  ">
                        <td className="TableCell LabelCell">
                          <div className="TableCell-content">
                            <span>{object.label}</span>
                          </div>
                        </td>
                        {section.dataColumns(object.id).map(
                          (column) => {
                            return (
                              <td className="TableCell  ">
                                <div className="TableCell-content Radio">
                                  <label>
                                    <input
                                      className="Radio-input"
                                      type="radio"
                                      name={`grants-${section.parentKey}-${object.id}`}
                                      id={
                                        `grants-${section.parentKey}-${object.id}-${column.value}`}
                                      onChange={this.updateGrant(section.parentKey, object, idx)}
                                      value={column.value}
                                      checked={object.permissions ===
                                        (column.value === 'none' ? null : column.value)}
                                      title={object.label}
                                    />
                                  </label>
                                </div>
                              </td>
                            );
                          })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              }
            </div>
          ))}

          <FormGroup>
            <SubmitButton disabled={loading}>Save</SubmitButton>
            <FormSummary errors={errors} success="Permissions saved." />
          </FormGroup>
        </Card>
      </Form>
    );
  }
}

PermissionsPage.propTypes = {
  user: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(selectUser)(PermissionsPage);
