export const determineReplicationType = (
  clusterSize: number,
  engine: string
) => {
  if (Boolean(engine.match(/mongo/))) {
    return undefined;
  }

  // If engine is a MySQL or Postgres one and it's a standalone DB instance
  if (clusterSize === 1) {
    return 'none';
  }

  // MySQL engine & cluster = semi_synch. PostgreSQL engine & cluster = asynch.
  if (Boolean(engine.match(/mysql/))) {
    return 'semi_synch';
  } else {
    return 'asynch';
  }
};

export const determineReplicationCommitType = (engine: string) => {
  // 'local' is the default.
  if (Boolean(engine.match(/postgres/))) {
    return 'local';
  }

  return undefined;
};

export const determineStorageEngine = (engine: string) => {
  // 'wiredtiger' is the default.
  if (Boolean(engine.match(/mongo/))) {
    return 'wiredtiger';
  }

  return undefined;
};

export const determineCompressionType = (engine: string) => {
  // 'none' is the default.
  if (Boolean(engine.match(/mongo/))) {
    return 'none';
  }

  return undefined;
};
