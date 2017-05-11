import md5 from 'md5';
import React, { PropTypes } from 'react';

import { Button } from 'linode-components/buttons';
import { Card, CardImageHeader } from 'linode-components/cards/';

import { GRAVATAR_BASE_URL } from '~/constants';


function getGravatarURL(email) {
  return `${GRAVATAR_BASE_URL}${md5(email.trim().toLowerCase())}`;
}

export default function User(props) {
  const { currentUser, user } = props;
  const navTo = currentUser === user.username ? '/profile' : `/users/${props.user.username}`;
  const nav = <Button to={navTo}>Edit</Button>;
  const header = (
    <CardImageHeader
      title={user.username}
      icon={getGravatarURL(user.email)}
      nav={nav}
    />
  );

  return (
    <Card header={header}>
      <div className="row">
        <div className="col-sm-4 row-label">Email</div>
        <div className="col-sm-8" id="email">{user.email}</div>
      </div>
    </Card>
  );
}

User.propTypes = {
  user: PropTypes.object.isRequired,
  currentUser: PropTypes.string.isRequired,
};
