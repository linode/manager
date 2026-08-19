import { useGetIdpConfigsQuery } from '@linode/queries';
import * as React from 'react';

import { usePermissions } from '../../../hooks/usePermissions';
import { CircleProgress } from '../../../Shared/CircleProgress/CircleProgress';
import { DocumentTitleSegment } from '../../../Shared/DocumentTitleSegment/DocumentTitleSegment';
import { ErrorState } from '../../../Shared/ErrorState/ErrorState';
import { NoIDPConfiguration } from '../../../Shared/NoIDPConfiguration/NoIDPConfiguration';
import { Paper } from '../../../Shared/Paper/Paper';
import { EnforcementSettings } from './EnforcementSettings';

export const EnforcementSettingsLanding = () => {
  const { data: permissions, error: permissionsError } = usePermissions(
    'account',
    ['create_idp_config']
  );
  const { data, error, isLoading } = useGetIdpConfigsQuery();

  const hasIdpConfig = data && data.results > 0;

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error || permissionsError) {
    return <ErrorState withPaper />;
  }

  return (
    <>
      <DocumentTitleSegment segment="SSO Enforcement" />
      {hasIdpConfig ? (
        <EnforcementSettings />
      ) : (
        <Paper>
          <NoIDPConfiguration permissions={permissions} />
        </Paper>
      )}
    </>
  );
};
