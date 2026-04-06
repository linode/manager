import React from 'react';

import type { Database, Engine } from '@linode/api-v4';

export interface DatabaseDetailContextProps {
  database: Database;
  disabled?: boolean;
  engine: Engine;
  isAdvancedConfigEnabled?: boolean;
  isMonitorEnabled?: boolean;
  isResizeEnabled?: boolean;
  isVPCEnabled?: boolean;
}

export const DatabaseDetailContext =
  React.createContext<DatabaseDetailContextProps>(
    {} as DatabaseDetailContextProps
  );

export const useDatabaseDetailContext = () =>
  React.useContext(DatabaseDetailContext);
