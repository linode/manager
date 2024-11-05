import { Paper } from '@linode/ui';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { NotFound } from 'src/components/NotFound';
import { StackScript } from 'src/components/StackScript/StackScript';
import { useGrants, useProfile } from 'src/queries/profile/profile';
import {
  useStackScriptQuery,
  useUpdateStackScriptMutation,
} from 'src/queries/stackscripts';

import {
  canUserModifyAccountStackScript,
  getStackScriptUrl,
} from './stackScriptUtils';

export const StackScriptsDetail = () => {
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const { stackScriptId } = useParams<{ stackScriptId: string }>();
  const id = Number(stackScriptId);
  const history = useHistory();

  const { data: stackScript, error, isLoading } = useStackScriptQuery(id);

  const {
    error: updateError,
    mutateAsync: updateStackScript,
    reset,
  } = useUpdateStackScriptMutation(id);

  const username = profile?.username;
  const userCannotAddLinodes =
    profile?.restricted && !grants?.global.add_linodes;

  const isRestrictedUser = profile?.restricted ?? false;
  const stackScriptGrants = grants?.stackscript ?? [];

  const userCanModify = Boolean(
    stackScript?.mine &&
      canUserModifyAccountStackScript(
        isRestrictedUser,
        stackScriptGrants,
        +stackScriptId
      )
  );

  const handleCreateClick = () => {
    if (!stackScript) {
      return;
    }
    const url = getStackScriptUrl(
      stackScript.username,
      stackScript.id,
      username
    );
    history.push(url);
  };

  const handleLabelChange = (label: string) => {
    return updateStackScript({ label });
  };

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText={error?.[0].reason} />;
  }

  if (!stackScript) {
    return <NotFound />;
  }

  return (
    <>
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'StackScripts',
              linkTo: stackScript.mine
                ? '/stackscripts/account'
                : '/stackscripts/community',
              position: 1,
            },
          ],
          labelOptions: { noCap: true },
          onEditHandlers: userCanModify
            ? {
                editableTextTitle: stackScript.label,
                errorText: updateError ? updateError[0].reason : undefined,
                onCancel: reset,
                onEdit: handleLabelChange,
              }
            : undefined,
          pathname: location.pathname,
        }}
        createButtonText="Deploy New Linode"
        disabledCreateButton={userCannotAddLinodes}
        docsLabel="Docs"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/stackscripts"
        onButtonClick={handleCreateClick}
        title={stackScript.label}
      />
      <Paper>
        <StackScript data={stackScript} userCanModify={userCanModify} />
      </Paper>
    </>
  );
};
