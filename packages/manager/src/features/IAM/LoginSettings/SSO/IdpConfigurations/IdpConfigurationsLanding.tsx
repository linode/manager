import { useGetIdpConfigsQuery } from '@linode/queries';
import * as React from 'react';

import { Paper } from 'src/features/IAM/Shared/Paper/Paper';

import { usePermissions } from '../../../hooks/usePermissions';
import { CircleProgress } from '../../../Shared/CircleProgress/CircleProgress';
import { DocumentTitleSegment } from '../../../Shared/DocumentTitleSegment/DocumentTitleSegment';
import { ErrorState } from '../../../Shared/ErrorState/ErrorState';
import { NoIDPConfiguration } from '../../../Shared/NoIDPConfiguration/NoIDPConfiguration';
import { IdpConfigurations } from './IdpConfigurations';

export const IdpConfigurationsLanding = () => {
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
    return <ErrorState />;
  }

  return (
    <>
      <DocumentTitleSegment segment="IDP Configuration" />
      {hasIdpConfig ? (
        <IdpConfigurations idpConfig={data?.data[0]} />
      ) : (
        <Paper>
          <NoIDPConfiguration permissions={permissions} />
        </Paper>
      )}
    </>
  );
};
