import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { users } from '~/api';
import { Card, CardHeader } from 'linode-components/cards';
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

    const { username } = props.params;
    const permissions = props.users[username]._permissions.permissions.undefined;
    this.state = {
      ...permissions,
      loading: false,
      errors: {},
    };
  }

  async onSubmit() {
    const { dispatch } = this.props;
    const { username } = this.props.params;
    const values = {
      customer: this.state.customer,
      global: this.state.global,
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

  updateGlobal(name) {
    this.setState({
      global: {
        ...this.state.global,
        [name]: !this.state.global[name],
      },
    });
  }

  render() {
    const { global, customer } = this.state;

    if (!customer) {
      return null;
    }

    return (
      <Form
        onSubmit={this.onSubmit}
      >
        <Card
          header={
            <CardHeader
              title="Global permissions"
            />
          }
        >
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
          </Checkboxes>
        </Card>
        <PermissionCard
          updateGlobal={this.updateGlobal}
          title="Linode permissions"
          section="linodes"
          addLabel="Can add Linodes to this Account ($)"
          addCheck={global.add_linodes}
        />
        <PermissionCard
          updateGlobal={this.updateGlobal}
          title="NodeBalancer permissions"
          section="nodebalancers"
          addLabel="Can add NodeBalancers to this Account ($)"
          addCheck={global.add_nodebalancers}
        />
        <PermissionCard
          updateGlobal={this.updateGlobal}
          title="Domains permissions"
          section="domains"
          addLabel="Can add Domains"
          addCheck={global.add_domains}
        />
        <SubmitButton>Save</SubmitButton>
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
