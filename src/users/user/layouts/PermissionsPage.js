import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { users } from '~/api';
import { Card } from 'linode-components/cards';
import { Form,
  Checkbox,
  Checkboxes,
  SubmitButton,
} from 'linode-components/forms';
import { PermissionCard } from '../components/PermissionCard';
import { reduceErrors } from '~/errors';

export class PermissionsPage extends Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.updateGlobal = this.updateGlobal.bind(this);
    this.onCellChange = this.onCellChange.bind(this);

    const { username } = props.params;
    const permissions = props.users[username]._permissions;
    this.state = {
      ...permissions,
      loading: false,
      errors: {},
    };
  }

  async onSubmit() {
    const { dispatch } = this.props;
    const { username } = this.props.params;
    const { global, customer, linode, nodebalancer, dnszone } = this.state;
    const values = {
      global,
      customer,
      linode,
      nodebalancer,
      dnszone,
    };

    this.setState({ loading: true });
    try {
      await dispatch(users.permissions.put(values, username));
      dispatch(push('/users'));
    } catch (response) {
      const errors = await reduceErrors(response);
      this.setState({ errors, loading: false });
    }
  }

  onCellChange(record, checked, keys) {
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

  updateGlobal(name) {
    this.setState({
      global: {
        ...this.state.global,
        [name]: !this.state.global[name],
      },
    });
  }

  render() {
    const { global, customer, linode, dnszone, nodebalancer } = this.state;

    if (!customer) {
      return null;
    }

    return (
      <Form
        onSubmit={this.onSubmit}
      >
        <Card>
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
          <PermissionCard
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
          <PermissionCard
            title="NodeBalancer"
            parentKey="nodebalancer"
            onCellChange={this.onCellChange}
            objects={nodebalancer}
            columns={[
              { dataKey: 'all', label: 'All' },
              { dataKey: 'access', label: 'Access' },
              { dataKey: 'delete', label: 'Delete' },
            ]}
          />
          <PermissionCard
            title="Domains"
            parentKey="dnszone"
            onCellChange={this.onCellChange}
            objects={dnszone}
            columns={[
              { dataKey: 'all', label: 'All' },
              { dataKey: 'access', label: 'Access' },
              { dataKey: 'delete', label: 'Delete' },
            ]}
          />
          <SubmitButton>Save</SubmitButton>
        </Card>
      </Form>
    );
  }
}

PermissionsPage.propTypes = {
  users: PropTypes.object,
  params: PropTypes.shape({
    username: PropTypes.string,
  }),
  dispatch: PropTypes.func.isRequired,
};

function select(state) {
  return {
    users: state.api.users.users,
  };
}

export default connect(select)(PermissionsPage);
