import md5 from 'md5';
import React, { PropTypes } from 'react';
import { Button } from 'linode-components/buttons';
import { Card, CardImageHeader } from 'linode-components/cards/';

import { GRAVATAR_BASE_URL } from '~/constants';

function getGravatarURL(email) {
  return `${GRAVATAR_BASE_URL}${md5(email.trim().toLowerCase())}`;
}

export default function User(props) {
  const navTo = props.currentUser === props.user.username ? `/users/${props.user.username}` : '/profile';
  const nav = <Button to={navTo}>Edit</Button>;
  const header = (
    <CardImageHeader
      title={props.user.username}
      icon={getGravatarURL(props.user.email)}
      nav={nav}
    />
  );

  return (
    <Card header={header}>
      <div className="row">
        <div className="col-sm-4 row-label">Email</div>
        <div className="col-sm-8" id="email">{props.user.email}</div>
      </div>
    </Card>
  );
}

User.propTypes = {
  user: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
};
