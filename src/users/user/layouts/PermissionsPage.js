import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Card } from 'linode-components/cards';
import {
  Checkbox,
  Checkboxes,
  Form,
  FormGroup,
  FormSummary,
  SubmitButton,
} from 'linode-components/forms';

import { EmitEvent } from 'linode-components/utils';
import { users } from '~/api';
import { dispatchOrStoreErrors, getObjectByLabelLazily } from '~/api/util';

import { selectUser } from './IndexPage';
import { PermissionsTable } from '../components';


export class PermissionsPage extends Component {
  static async preload({ dispatch, getState }, { username }) {
    const user = await dispatch(getObjectByLabelLazily('users', username, 'username'));

    if (user.restricted) {
      await dispatch(users.permissions.one([username]));
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
    const { global, customer, linode, nodebalancer, domain } = this.state;
    const data = { global, customer, linode, nodebalancer, domain };

    return dispatch(dispatchOrStoreErrors.call(this, [
      () => users.permissions.put(data, username),
    ]));
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

  updateGlobal = (name) => {
    this.setState({
      global: {
        ...this.state.global,
        [name]: !this.state.global[name],
      },
    });
  }

  render() {
    const { global, customer, linode, domain, nodebalancer, loading, errors } = this.state;

    return (
      <Form onSubmit={() => {
        this.onSubmit();
        EmitEvent('Submit', 'change permissions', 'user');
      }}>
        <Card className="Permissions">
          <div className="Permissions-section">
            <h3>Global Permissions</h3>
            <Checkboxes>
              <Checkbox
                id="permission-customer-access"
                checked={customer.access}
                onChange={() => this.setState({
                  customer: {
                    ...this.state.customer,
                    access: !customer.access,
                  },
                })}
                label="Can view invoices, make payments, update contact and
                  billing info, and will receive copies of all invoices and
                  payment emails"
              />
              <Checkbox
                id="permission-customer-cancel"
                checked={customer.cancel}
                onChange={() => this.setState({
                  customer: {
                    ...this.state.customer,
                    cancel: !customer.cancel,
                  },
                })}
                label="Can cancel the entire account"
              />
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
                id="permission-global-domains"
                checked={global.add_domains}
                onChange={() => this.updateGlobal('add_domains')}
                label="Can add Domains"
              />
            </Checkboxes>
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
