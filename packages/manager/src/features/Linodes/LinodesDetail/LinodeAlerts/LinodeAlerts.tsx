import { useGrants } from '@linode/queries';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { LinodeSettingsAlertsPanel } from '../LinodeSettings/LinodeSettingsAlertsPanel';

const LinodeAlerts = () => {
  const { linodeId } = useParams<{ linodeId: string }>();
  const id = Number(linodeId);
  const { data: grants } = useGrants();

  const isReadOnly =
    grants !== undefined &&
    grants?.linode.find((grant) => grant.id === id)?.permissions ===
      'read_only';

  return <LinodeSettingsAlertsPanel isReadOnly={isReadOnly} linodeId={id} />;
};

export default LinodeAlerts;
