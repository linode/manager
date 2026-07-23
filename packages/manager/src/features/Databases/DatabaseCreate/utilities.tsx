import React from 'react';

import MySQLIcon from 'src/assets/icons/mysql.svg';
import PostgreSQLIcon from 'src/assets/icons/postgresql.svg';
import ValkeyIcon from 'src/assets/icons/valkey.svg';
import { getDatabasesDescription } from 'src/features/Databases/utilities';

import type { DatabaseEngine } from '@linode/api-v4';

export const determineReplicationType = (
  clusterSize: number,
  engine: string
) => {
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

export const engineIcons = {
  mysql: <MySQLIcon height="24" width="24" />,
  postgresql: <PostgreSQLIcon height="24" width="24" />,
  valkey: <ValkeyIcon height="24" width="24" />,
};

export const getEngineOptions = (engines: DatabaseEngine[]) => {
  const _engines = engines.map((e) => {
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

  return _engines.sort((engine1, engine2) => {
    // Group by engine first
    if (engine1.engine < engine2.engine) {
      return -1;
    }
    if (engine1.engine > engine2.engine) {
      return 1;
    }
    // Then sort by descending version within each engine group
    if (engine1.label < engine2.label) {
      return 1;
    }
    if (engine1.label > engine2.label) {
      return -1;
    }
    return 0;
  });
};

/**
 * Determines the suffix string for a node based on the number of nodes in the configuration.
 *
 * @param {number} numberOfNodes - The number of nodes.
 * @returns {string} The suffix string to be appended to the node:
 *  - If there are multiple nodes, appends 's - HA ' for new databases or 's: ' otherwise.
 *  - If there is only one node, appends a space for new databases or ': ' otherwise.
 *
 */
export const getSuffix = (numberOfNodes: number) => {
  if (numberOfNodes > 1) {
    return 's - HA ';
  } else {
    return ' ';
  }
};
