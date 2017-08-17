import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { PrimaryButton } from 'linode-components/buttons';

import { Input } from 'linode-components/forms';
import { List } from 'linode-components/lists';
import { ListBody } from 'linode-components/lists/bodies';
import { MassEditControl } from 'linode-components/lists/controls';
import { ListHeader } from 'linode-components/lists/headers';
import { Table } from 'linode-components/tables';
import {
  ButtonCell,
  CheckboxCell,
  LinkCell,
  ThumbnailCell,
} from 'linode-components/tables/cells';

import { setAnalytics, setSource, setTitle } from '~/actions';
import toggleSelected from '~/actions/select';
import { users as api } from '~/api';
import { transform } from '~/api/util';
import { getEmailHash } from '~/cache';
import CreateHelper from '~/components/CreateHelper';
import { GRAVATAR_BASE_URL } from '~/constants';
import { confirmThenDelete } from '~/utilities';


const OBJECT_TYPE = 'users';

function getGravatarURL(user) {
  const emailHash = getEmailHash(user.email);
  return `${GRAVATAR_BASE_URL}${emailHash}`;
}

export class IndexPage extends Component {
  static async preload({ dispatch }) {
    await dispatch(api.all());
  }

  constructor(props) {
    super(props);

    this.state = { filter: '' };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));
    dispatch(setTitle('Users'));
    dispatch(setAnalytics(['users']));
  }

  deleteUsers = confirmThenDelete(
    this.props.dispatch,
    'user',
    api.delete,
    OBJECT_TYPE,
    'username',
    'delete',
    'deleting',
    'username').bind(this)

  renderUsers(users) {
    const { dispatch, selectedMap, profile: { username: currentUsername } } = this.props;
    const { filter } = this.state;

    const { sorted: sortedUsers } = transform(users, {
      filterOn: 'username',
      filterBy: filter,
      sortBy: u => u.username.toLowerCase(),
    });

    return (
      <List>
        <ListHeader className="Menu">
          <div className="Menu-item">
            <MassEditControl
              data={sortedUsers}
              dispatch={dispatch}
              massEditGroups={[{ elements: [
                { name: 'Delete', action: this.deleteUsers },
              ] }]}
              selectedMap={selectedMap}
              selectedKey="username"
              objectType={OBJECT_TYPE}
              toggleSelected={toggleSelected}
            />
          </div>
          <div className="Menu-item">
            <Input
              placeholder="Filter..."
              onChange={({ target: { value } }) => this.setState({ filter: value })}
              value={this.state.filter}
            />
          </div>
        </ListHeader>
        <ListBody>
          <Table
            columns={[
              {
                cellComponent: CheckboxCell,
                headerClassName: 'CheckboxColumn',
                selectedKey: 'username',
              },
              {
                cellComponent: ThumbnailCell,
                headerClassName: 'ThumbnailColumn',
                srcFn: getGravatarURL,
              },
              {
                cellComponent: LinkCell,
                idKey: 'username',
                hrefFn: (user) =>
                  user.username !== currentUsername ? `/users/${user.username}` : '/profile',
                textKey: 'username',
                tooltipEnabled: true,
              },
              { dataKey: 'email' },
              { dataFn: (user) => user.restricted ? 'Restricted' : 'Unrestricted' },
              {
                cellComponent: ButtonCell,
                headerClassName: 'ButtonColumn',
                text: 'Delete',
                onClick: (user) => { this.deleteUsers(user); },
              },
            ]}
            noDataMessage="No users found."
            data={sortedUsers}
            selectedMap={selectedMap}
            disableHeader
            onToggleSelect={(user) => {
              dispatch(toggleSelected(OBJECT_TYPE, user.username));
            }}
          />
        </ListBody>
      </List>
    );
  }

  render() {
    return (
      <div className="PrimaryPage container">
        <header className="PrimaryPage-header">
          <div className="PrimaryPage-headerRow clearfix">
            <h1 className="float-left">Users</h1>
            <PrimaryButton to="/users/create" className="float-right">
              Add a User
            </PrimaryButton>
          </div>
        </header>
        <div className="PrimaryPage-body">
          {Object.keys(this.props.users.users).length ?
            this.renderUsers(this.props.users.users) :
            <CreateHelper label="Users" href="/users/create" linkText="Add a User" />}
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  dispatch: PropTypes.func,
  users: PropTypes.object,
  profile: PropTypes.object,
  selectedMap: PropTypes.object.isRequired,
};

function select(state) {
  return {
    users: state.api.users,
    profile: state.api.profile,
    selectedMap: state.select.selected[OBJECT_TYPE] || {},
  };
}

export default connect(select)(IndexPage);
