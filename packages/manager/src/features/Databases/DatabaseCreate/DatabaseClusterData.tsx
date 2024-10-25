import Grid from '@mui/material/Unstable_Grid2';
import { groupBy } from 'ramda';
import React from 'react';

import MongoDBIcon from 'src/assets/icons/mongodb.svg';
import MySQLIcon from 'src/assets/icons/mysql.svg';
import PostgreSQLIcon from 'src/assets/icons/postgresql.svg';
import { Divider } from 'src/components/Divider';
import Select from 'src/components/EnhancedSelect';
import { _SingleValue } from 'src/components/EnhancedSelect/components/SingleValue';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { RegionHelperText } from 'src/components/SelectRegionPanel/RegionHelperText';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useStyles } from 'src/features/Databases/DatabaseCreate/DatabaseCreate.style';
import { EngineOption } from 'src/features/Databases/DatabaseCreate/EngineOption';
import { databaseEngineMap } from 'src/features/Databases/DatabaseLanding/DatabaseRow';
import { getSelectedOptionFromGroupedOptions } from 'src/utilities/getSelectedOptionFromGroupedOptions';

import type {
  ClusterSize,
  ComprehensiveReplicationType,
  DatabaseEngine,
  Engine,
  Region,
} from '@linode/api-v4';
import type { FormikErrors } from 'formik';
import type { Item } from 'src/components/EnhancedSelect';
export interface DatabaseCreateValues {
  allow_list: {
    address: string;
    error: string;
  }[];
  cluster_size: ClusterSize;
  compression_type: undefined;
  engine: Engine;
  label: string;
  region: string;
  replication_commit_type: undefined;
  replication_type: ComprehensiveReplicationType;
  ssl_connection: boolean;
  storage_engine: undefined;
  type: string;
}
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

interface Props {
  engines: DatabaseEngine[] | undefined;
  errors: FormikErrors<DatabaseCreateValues>;
  onChange: (filed: string, value: any) => void;
  regionsData: Region[];
  values: DatabaseCreateValues;
}
export const DatabaseClusterData = (props: Props) => {
  const { engines, errors, onChange, regionsData, values } = props;
  const { classes } = useStyles();
  const engineIcons = {
    mongodb: <MongoDBIcon height="24" width="24" />,
    mysql: <MySQLIcon height="24" width="24" />,
    postgresql: <PostgreSQLIcon height="24" width="24" />,
    redis: null,
  };
  const isRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_databases',
  });
  const getEngineOptions = (engines: DatabaseEngine[]) => {
    const groupedEngines = groupBy<DatabaseEngine>((engineObject) => {
      if (engineObject.engine.match(/mysql/i)) {
        return 'MySQL';
      }
      if (engineObject.engine.match(/postgresql/i)) {
        return 'PostgreSQL';
      }
      if (engineObject.engine.match(/mongodb/i)) {
        return 'MongoDB';
      }
      if (engineObject.engine.match(/redis/i)) {
        return 'Redis';
      }
      return 'Other';
    }, engines);
    return ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Other'].reduce(
      (accum, thisGroup) => {
        if (
          !groupedEngines[thisGroup] ||
          groupedEngines[thisGroup].length === 0
        ) {
          return accum;
        }
        return [
          ...accum,
          {
            label: thisGroup,
            options: groupedEngines[thisGroup]
              .map((engineObject) => ({
                ...engineObject,
                flag: engineIcons[engineObject.engine],
                label: `${databaseEngineMap[engineObject.engine]} v${
                  engineObject.version
                }`,
                value: `${engineObject.engine}/${engineObject.version}`,
              }))
              .sort((a, b) => (a.version > b.version ? -1 : 1)),
          },
        ];
      },
      []
    );
  };

  const engineOptions = React.useMemo(() => {
    if (!engines) {
      return [];
    }
    return getEngineOptions(engines);
  }, [engines]);

  const labelToolTip = (
    <div className={classes.labelToolTipCtn}>
      <strong>Label must:</strong>
      <ul>
        <li>Begin with an alpha character</li>
        <li>Contain only alpha characters or single hyphens</li>
        <li>Be between 3 - 32 characters</li>
      </ul>
    </div>
  );

  return (
    <>
      <Grid>
        <Typography variant="h2">Name Your Cluster</Typography>
        <TextField
          data-qa-label-input
          errorText={errors.label}
          disabled={isRestricted}
          label="Cluster Label"
          onChange={(e) => onChange('label', e.target.value)}
          tooltipClasses={classes.tooltip}
          tooltipText={labelToolTip}
          value={values.label}
        />
      </Grid>
      <Divider spacingBottom={12} spacingTop={38} />
      <Grid>
        <Typography variant="h2">Select Engine and Region</Typography>
        <Select
          onChange={(selected: Item<string>) => {
            onChange('engine', selected.value);
          }}
          value={getSelectedOptionFromGroupedOptions(
            values.engine,
            engineOptions
          )}
          className={classes.engineSelect}
          components={{ Option: EngineOption, SingleValue: _SingleValue }}
          disabled={isRestricted}
          errorText={errors.engine}
          isClearable={false}
          label="Database Engine"
          options={engineOptions}
          placeholder={'Select a Database Engine'}
        />
      </Grid>
      <Grid>
        <RegionSelect
          currentCapability="Managed Databases"
          disableClearable
          disabled={isRestricted}
          errorText={errors.region}
          onChange={(e, region) => onChange('region', region.id)}
          regions={regionsData}
          value={values.region}
        />
        <RegionHelperText mt={1} />
      </Grid>
    </>
  );
};
