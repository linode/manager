import { CircleProgress, ErrorState, Paper } from '@linode/ui';
import React from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { NotFound } from 'src/components/NotFound';
import { StackScript } from 'src/components/StackScript/StackScript';
import { useGrants, useProfile } from 'src/queries/profile/profile';
import {
  useStackScriptQuery,
  useUpdateStackScriptMutation,
} from 'src/queries/stackscripts';

import { getRestrictedResourceText } from '../Account/utils';
import {
  canUserModifyAccountStackScript,
  getStackScriptUrl,
} from './stackScriptUtils';

export const StackScriptDetail = () => {
  const { data: grants } = useGrants();
  const { data: profile } = useProfile();
  const { stackScriptId } = useParams<{ stackScriptId: string }>();

  const id = Number(stackScriptId);

  const { data: stackscript, error, isLoading } = useStackScriptQuery(id);
  const {
    error: updateError,
    mutateAsync: updateStackScript,
    reset,
  } = useUpdateStackScriptMutation(id);

  const history = useHistory();
  const location = useLocation();

  const isRestrictedUser = profile?.restricted ?? false;
  const username = profile?.username;
  const userCannotAddLinodes = isRestrictedUser && !grants?.global.add_linodes;
  const stackScriptGrants = grants?.stackscript ?? [];

  const userCanModify = Boolean(
    stackscript?.mine &&
      canUserModifyAccountStackScript(isRestrictedUser, stackScriptGrants, id)
  );

  const handleCreateClick = () => {
    if (!stackscript) {
      return;
    }
    const url = getStackScriptUrl(stackscript.username, id, username);
    history.push(url);
  };

  const handleLabelChange = (label: string) => {
    return updateStackScript({ label });
  };

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText={error[0].reason} />;
  }

  if (!stackscript) {
    return <NotFound />;
  }

  return (
    <>
      <DocumentTitleSegment segment={`${stackscript.label} | StackScripts`} />
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'StackScripts',
              linkTo: stackscript.mine
                ? '/stackscripts/account'
                : '/stackscripts/community',
              position: 1,
            },
          ],
          labelOptions: { noCap: true },
          onEditHandlers: userCanModify
            ? {
                editableTextTitle: stackscript.label,
                errorText: updateError?.[0].reason,
                onCancel: () => reset(),
                onEdit: handleLabelChange,
              }
            : undefined,
          pathname: location.pathname,
        }}
        buttonDataAttrs={{
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'Linodes',
          }),
        }}
        createButtonText="Deploy New Linode"
        disabledCreateButton={userCannotAddLinodes}
        docsLabel="Docs"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/stackscripts"
        onButtonClick={handleCreateClick}
        title={stackscript.label}
      />
      <Paper>
        <StackScript data={stackscript} userCanModify={userCanModify} />
      </Paper>
    </>
  );
};
