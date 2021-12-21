import React from 'react';
import classNames from 'classnames';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import StatusIcon from 'src/components/StatusIcon';
import { Link } from 'react-router-dom';
import { Status } from 'src/components/StatusIcon/StatusIcon';
import { makeStyles } from 'src/components/core/styles';
import { dcDisplayNames } from 'src/constants';
import { formatDate } from 'src/utilities/formatDate';
import { isWithinDays, parseAPIDate } from 'src/utilities/date';
import {
  Database,
  DatabaseStatus,
  Engine,
} from '@linode/api-v4/lib/databases/types';
import Hidden from 'src/components/core/Hidden';

export const databaseStatusMap: Record<DatabaseStatus, Status> = {
  creating: 'other',
  running: 'active',
  failed: 'error',
  degraded: 'inactive',
  updating: 'other',
};

export const databaseEngineMap: Record<Engine, string> = {
  mysql: 'MySQL',
};

const useStyles = makeStyles(() => ({
  capitalize: {
    textTransform: 'capitalize',
  },
  status: {
    display: 'flex',
    alignItems: 'center',
  },
}));

export const getDatabaseVersionNumber = (version: Database['version']) =>
  version.split('/')[1];

interface Props {
  database: Database;
}

export const DatabaseRow: React.FC<Props> = ({ database }) => {
  const { id, label, engine, created, status, region, version } = database;
  const classes = useStyles();

  return (
    <TableRow key={`database-row-${id}`} ariaLabel={`Database ${label}`}>
      <TableCell>
        <Link to={`/databases/${id}`}>{label}</Link>
      </TableCell>
      <TableCell>
        <div className={classNames(classes.status, classes.capitalize)}>
          <StatusIcon status={databaseStatusMap[status]} />
          {status}
        </div>
      </TableCell>
      <TableCell>Primary +2</TableCell>
      <TableCell>
        {`${databaseEngineMap[engine]} v${getDatabaseVersionNumber(version)}`}
      </TableCell>
      <Hidden smDown>
        <TableCell>{dcDisplayNames[region]}</TableCell>
      </Hidden>
      <Hidden mdDown>
        <TableCell>
          {isWithinDays(3, created)
            ? parseAPIDate(created).toRelative()
            : formatDate(created)}
        </TableCell>
      </Hidden>
    </TableRow>
  );
};

export default React.memo(DatabaseRow);
