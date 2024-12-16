import React from 'react';

import MongoDBIcon from 'src/assets/icons/mongodb.svg';
import MySQLIcon from 'src/assets/icons/mysql.svg';
import PostgreSQLIcon from 'src/assets/icons/postgresql.svg';
import { getDatabasesDescription } from 'src/features/Databases/utilities';

import type { DatabaseEngine } from '@linode/api-v4';

export const determineReplicationType = (
  clusterSize: number,
  engine: string
) => {
  if (/mongo/.test(engine)) {
    return undefined;
  }

  // If engine is a MySQL or Postgres one and it's a standalone DB instance
  if (clusterSize === 1) {
    return 'none';
  }

  // MySQL engine & cluster = semi_synch. PostgreSQL engine & cluster = asynch.
  if (/mysql/.test(engine)) {
    return 'semi_synch';
  } else {
    return 'asynch';
  }
};

export const determineReplicationCommitType = (engine: string) => {
  // 'local' is the default.
  if (/postgres/.test(engine)) {
    return 'local';
  }

  return undefined;
};

export const determineStorageEngine = (engine: string) => {
  // 'wiredtiger' is the default.
  if (/mongo/.test(engine)) {
    return 'wiredtiger';
  }

  return undefined;
};

export const determineCompressionType = (engine: string) => {
  // 'none' is the default.
  if (/mongo/.test(engine)) {
    return 'none';
  }

  return undefined;
};

interface EngineIconsProps {
  mongodb: React.JSX.Element;
  mysql: React.JSX.Element;
  postgresql: React.JSX.Element;
  redis: null;
}
export const engineIcons: EngineIconsProps = {
  mongodb: <MongoDBIcon height="24" width="24" />,
  mysql: <MySQLIcon height="24" width="24" />,
  postgresql: <PostgreSQLIcon height="24" width="24" />,
  redis: null,
};

export const getEngineOptions = (engines: DatabaseEngine[]) => {
  return engines.map((e) => {
    return {
      engine: e.engine,
      flag: engineIcons[e.engine],
      label: getDatabasesDescription({
        engine: e.engine,
        version: e.version,
      }),
      value: `${e.engine}/${e.version}`,
    };
  });
};

/**
 * Determines the suffix string for a node based on whether
 * the database is new and the number of nodes in the configuration.
 *
 * @param {boolean} isNewDatabase - Indicates if the database is a new instance.
 * @param {number} numberOfNodes - The number of nodes.
 * @returns {string} The suffix string to be appended to the node:
 *  - If there are multiple nodes, appends 's - HA ' for new databases or 's: ' otherwise.
 *  - If there is only one node, appends a space for new databases or ': ' otherwise.
 *
 */
export const getSuffix = (isNewDatabase: boolean, numberOfNodes: number) => {
  if (numberOfNodes > 1) {
    return isNewDatabase ? 's - HA ' : 's: ';
  } else {
    return isNewDatabase ? ' ' : ': ';
  }
};
