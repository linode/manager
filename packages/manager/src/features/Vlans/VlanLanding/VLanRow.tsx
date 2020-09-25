import { VLAN } from '@linode/api-v4/lib/vlans';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import ActionMenu, { ActionHandlers } from './VlanActionMenu';
import { getLinodeLabel } from 'src/features/Dashboard/VolumesDashboardCard/VolumeDashboardRow';

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    display: 'block',
    fontFamily: theme.font.bold,
    fontSize: '.875rem',
    lineHeight: '1.14rem'
  },
  linodesWrapper: {
    padding: '8px 0'
  },
  labelWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    whiteSpace: 'nowrap'
  }
}));

interface Props {
  loading: boolean;
  error: APIError[];
}

export type CombinedProps = Props & VLAN & ActionHandlers;

export const VlanRow: React.FC<CombinedProps> = props => {
  const {
    id,
    description,
    region,
    linodes,
    loading,
    error,
    ...actionHandlers
  } = props;

  const classes = useStyles();

  const getLinodesCellString = (
    data: number[],
    loading: boolean,
    error?: APIError[]
  ): string | JSX.Element => {
    if (loading) {
      return 'Loading...';
    }

    if (error) {
      return 'Error retrieving Linodes';
    }

    if (data.length === 0) {
      return 'None assigned';
    }

    return getLinodeLinks(data);
  };

  const getLinodeLinks = (data: number[]): JSX.Element => {
    return (
      <>
        {data.map((linodeID, idx) => (
          <Link
            className={classes.link}
            key={linodeID}
            to={`/linodes/${linodeID}`}
            data-testid="vlan-row-link"
          >
            {getLinodeLabel(linodeID)}
          </Link>
        ))}
      </>
    );
  };

  return (
    <TableRow
      key={`vlan-row-${id}`}
      data-testid={`vlan-row-${id}`}
      ariaLabel={`Virtual LAN ${description}`}
    >
      <TableCell>
        <div className={classes.labelWrapper}>
          <Link className={classes.link} to={`/vlans/${id}`}>
            {description}
          </Link>
        </div>
      </TableCell>
      <TableCell>{region}</TableCell>

      <TableCell className={classes.linodesWrapper}>
        {getLinodesCellString(linodes, loading, error)}
      </TableCell>

      <TableCell>
        <ActionMenu vlanID={id} vlanLabel={description} {...actionHandlers} />
      </TableCell>
    </TableRow>
  );
};

export default compose<CombinedProps, ActionHandlers>(React.memo)(VlanRow);
