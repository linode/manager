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
import { PermissionsTable } from '../components';


export class PermissionsPage extends Component {
  static async preload({ dispatch, getState }, { username }) {
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

  onCellChange = (record, checked, keys) => {
    const { parentKey, dataKey } = keys;
    const parentState = this.state[parentKey].map(function (child) {
      if (child === record) {
        return {
          ...child,
          [dataKey]: checked,
        };
      }
      return child;
    });

    this.setState({
      [parentKey]: parentState,
    });
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

  render() {
    const { global, linode, domain, nodebalancer, longview,
      stackscript, image, volume, loading, errors } = this.state;

    const analytics = { title: 'User permissions' };

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
              label="Read-Only (Can view invoices, view billing info, and
                will receive copies of all invoices and payment emails)"
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
          <PermissionsTable
            title="Linode"
            parentKey="linode"
            onCellChange={this.onCellChange}
            objects={linode}
            columns={[
              { dataKey: 'all', label: 'All' },
              { dataKey: 'access', label: 'Access' },
              { dataKey: 'delete', label: 'Delete' },
              { dataKey: 'resize', label: 'Resize ($)' },
            ]}
          />
          <PermissionsTable
            title="NodeBalancer"
            parentKey="nodebalancer"
            onCellChange={this.onCellChange}
            objects={nodebalancer}
            columns={[
              { dataKey: 'all', label: 'All' },
              { dataKey: 'access', label: 'Access' },
              { dataKey: 'delete', label: 'Delete' },
              null,
            ]}
          />
          <PermissionsTable
            title="Longview"
            parentKey="longview"
            onCellChange={this.onCellChange}
            objects={longview}
            columns={[
              { dataKey: 'all', label: 'All' },
              { dataKey: 'access', label: 'Access' },
              { dataKey: 'delete', label: 'Delete' },
              null,
            ]}
          />
          <PermissionsTable
            title="Domains"
            parentKey="domain"
            onCellChange={this.onCellChange}
            objects={domain}
            columns={[
              { dataKey: 'all', label: 'All' },
              { dataKey: 'access', label: 'Access' },
              { dataKey: 'delete', label: 'Delete' },
              null,
            ]}
          />
          <PermissionsTable
            title="StackScripts"
            parentKey="stackscripts"
            onCellChange={this.onCellChange}
            objects={stackscript}
            columns={[
              { dataKey: 'all', label: 'All' },
              { dataKey: 'use', label: 'Use' },
              { dataKey: 'edit', label: 'Edit' },
              { dataKey: 'delete', label: 'Delete' },
            ]}
          />
          <PermissionsTable
            title="Images"
            parentKey="image"
            onCellChange={this.onCellChange}
            objects={image}
            columns={[
              { dataKey: 'all', label: 'All' },
              { dataKey: 'access', label: 'Access' },
              { dataKey: 'delete', label: 'Delete' },
              null,
            ]}
          />
          <PermissionsTable
            title="Volume"
            parentKey="volume"
            onCellChange={this.onCellChange}
            objects={volume}
            columns={[
              { dataKey: 'all', label: 'All' },
              { dataKey: 'access', label: 'Access' },
              { dataKey: 'delete', label: 'Delete' },
              null,
            ]}
          />
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
