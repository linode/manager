import React from 'react';
import { useHistory } from 'react-router-dom';
import { Action, ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { useProfile } from 'src/queries/profile/profile';

export const UsersLanding = () => {
  const history = useHistory();
  const { data: profile } = useProfile();

  const username = profile?.username;

  const actions: Action[] = [
    {
      onClick: () => {
        history.push(`/iam/users/${username}/details`);
      },
      title: 'View User Details',
    },
    {
      onClick: () => {
        history.push(`/iam/users/${username}/roles`);
      },
      title: 'View User Roles',
    },
  ];

  return (
    <>
      <p>Users Table - UIE-8136 </p>

      <ActionMenu actionsList={actions} ariaLabel={`Action menu for user`} />
    </>
  );
};
