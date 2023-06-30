import * as React from 'react';
import { LinodePermissionsError } from '../LinodePermissionsError';
import { LinodeSettingsAlertsPanel } from './LinodeSettingsAlertsPanel';
import { LinodeSettingsLabelPanel } from './LinodeSettingsLabelPanel';
import { LinodeSettingsPasswordPanel } from './LinodeSettingsPasswordPanel';
import { useParams } from 'react-router-dom';
import { useGrants } from 'src/queries/profile';
import { LinodeWatchdogPanel } from './LinodeWatchdogPanel';
import { LinodeSettingsDeletePanel } from './LinodeSettingsDeletePanel';

const LinodeSettings = () => {
  const { linodeId } = useParams<{ linodeId: string }>();
  const id = Number(linodeId);

  const { data: grants } = useGrants();

  const isReadOnly =
    grants !== undefined &&
    grants?.linode.find((grant) => grant.id === id)?.permissions ===
      'read_only';

  return (
    <>
      {isReadOnly && <LinodePermissionsError />}
      <LinodeSettingsLabelPanel linodeId={id} isReadOnly={isReadOnly} />
      <LinodeSettingsPasswordPanel linodeId={id} isReadOnly={isReadOnly} />
      <LinodeSettingsAlertsPanel linodeId={id} isReadOnly={isReadOnly} />
      <LinodeWatchdogPanel linodeId={id} isReadOnly={isReadOnly} />
      <LinodeSettingsDeletePanel linodeId={id} isReadOnly={isReadOnly} />
    </>
  );
};

export default LinodeSettings;
