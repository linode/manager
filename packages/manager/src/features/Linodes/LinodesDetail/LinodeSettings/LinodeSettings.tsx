import { useGrants } from '@linode/queries';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { LinodeSettingsDeletePanel } from './LinodeSettingsDeletePanel';
import { LinodeSettingsLabelPanel } from './LinodeSettingsLabelPanel';
import { LinodeSettingsPasswordPanel } from './LinodeSettingsPasswordPanel';
import { LinodeWatchdogPanel } from './LinodeWatchdogPanel';

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
      <LinodeSettingsLabelPanel isReadOnly={isReadOnly} linodeId={id} />
      <LinodeSettingsPasswordPanel isReadOnly={isReadOnly} linodeId={id} />
      <LinodeWatchdogPanel isReadOnly={isReadOnly} linodeId={id} />
      <LinodeSettingsDeletePanel isReadOnly={isReadOnly} linodeId={id} />
    </>
  );
};

export default LinodeSettings;
