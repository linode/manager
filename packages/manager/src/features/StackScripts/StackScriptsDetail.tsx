import {
  useStackScriptQuery,
  useUpdateStackScriptMutation,
} from '@linode/queries';
import { useGrants, useProfile } from '@linode/queries';
import { CircleProgress, ErrorState, Paper } from '@linode/ui';
import { NotFound } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { useHistory } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { StackScript } from 'src/components/StackScript/StackScript';

import { getRestrictedResourceText } from '../Account/utils';
import {
  canUserModifyAccountStackScript,
  getStackScriptUrl,
} from './stackScriptUtils';

export const StackScriptDetail = () => {
  const history = useHistory();
  const { data: grants } = useGrants();
  const { data: profile } = useProfile();
  const { id: stackScriptId } = useParams({
    from: '/stackscripts/$id',
  });

  const id = Number(stackScriptId);

  const { data: stackscript, error, isLoading } = useStackScriptQuery(id);
  const {
    error: updateError,
    mutateAsync: updateStackScript,
    reset,
  } = useUpdateStackScriptMutation(id);
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
