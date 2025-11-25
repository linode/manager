import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { AlertReusableComponent } from 'src/features/CloudPulse/Alerts/ContextualView/AlertReusableComponent';

import { useDatabaseDetailContext } from '../DatabaseDetailContext';

export const DatabaseAlerts = () => {
  const navigate = useNavigate();
  const { database, engine, isMonitorEnabled } = useDatabaseDetailContext();
  const databaseId = database?.id;

  if (!isMonitorEnabled) {
    navigate({
      to: `/databases/$engine/$databaseId/summary`,
      params: {
        engine,
        databaseId,
      },
    });
    return null;
  }

  return (
    <AlertReusableComponent
      entityId={databaseId?.toString() ?? ''}
      entityName={database?.label ?? ''}
      regionId={database?.region ?? ''}
      serviceType="dbaas"
    />
  );
};
