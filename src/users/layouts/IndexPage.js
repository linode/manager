import _ from 'lodash';
import moment from 'moment';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Input } from 'linode-components/forms';
import { List } from 'linode-components/lists';
import { ListBody } from 'linode-components/lists/bodies';
import { MassEditControl } from 'linode-components/lists/controls';
import { ListHeader } from 'linode-components/lists/headers';
import { DeleteModalBody } from 'linode-components/modals';
import { Table } from 'linode-components/tables';
import {
  ButtonCell,
  CheckboxCell,
  LinkCell,
  ThumbnailCell,
} from 'linode-components/tables/cells';
import { EmitEvent } from 'linode-components/utils';

import { showModal, hideModal } from '~/actions/modal';
import toggleSelected from '~/actions/select';
import { setSource } from '~/actions/source';
import { setTitle } from '~/actions/title';
import { users as api } from '~/api';
import { getEmailHash } from '~/cache';
import CreateHelper from '~/components/CreateHelper';
import { GRAVATAR_BASE_URL } from '~/constants';


const OBJECT_TYPE = 'users';

function getGravatarURL(user) {
  const emailHash = getEmailHash(user.email);
  return `${GRAVATAR_BASE_URL}${emailHash}`;
}

export class IndexPage extends Component {
  static async preload({ dispatch }) {
    await dispatch(api.all());
  }

  constructor() {
    super();

    this.state = { filter: '' };
  }

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(setSource(__filename));

    dispatch(setTitle('Users'));
  }

  deleteUsers = (users) => {
    const { dispatch } = this.props;
    const usersArr = Array.isArray(users) ? users : [users];
    const title = 'Delete User(s)';

    dispatch(showModal(title,
      <DeleteModalBody
        onOk={async () => {
          const ids = usersArr.map(user => user.username);

          await Promise.all(ids.map(id => dispatch(api.delete(id))));
          dispatch(toggleSelected(OBJECT_TYPE, ids));
          EmitEvent('modal:submit', 'Modal', 'delete', title);
          dispatch(hideModal());
        }}
        onCancel={() => {
          EmitEvent('modal:cancel', 'Modal', 'cancel', title);
          dispatch(hideModal());
        }}
        items={usersArr.map(n => n.username)}
        typeOfItem="Users"
      />
    ));
  }

  renderUsers(users) {
    const { dispatch, selectedMap, profile: { username: currentUsername } } = this.props;
    const { filter } = this.state;

    const filteredUsers = filter.length ? _.pickBy(users, u =>
      u.username.toLowerCase().indexOf(filter.toLowerCase()) !== -1) : users;
    const sortedUsers = _.sortBy(Object.values(filteredUsers), ({ created }) => moment(created));

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
            <h1 className="float-sm-left">Users</h1>
            <Link to="/users/create" className="linode-add btn btn-primary float-sm-right">
              <span className="fa fa-plus"></span>
              Add a user
            </Link>
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
