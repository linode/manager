import { VLAN } from '@linode/api-v4/lib/vlans';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import VlanActionMenu, { ActionHandlers } from './VlanActionMenu';
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

export type CombinedProps = VLAN & ActionHandlers;

export const VlanTableRow: React.FC<CombinedProps> = props => {
  const {
    id,
    description,
    interfaceName,
    ip_address: ipAddress,
    linodes,
    loading,
    error,
    ...actionHandlers
  } = props;

  const vlanLabel = description.length > 32 ? `vlan-${id}` : description;

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
    const firstFour = data.slice(0, 4);
    return (
      // eslint-disable-next-line react/jsx-no-useless-fragment
      <>
        {firstFour.map((linodeID, idx) => (
          <Link
            className={classes.link}
            key={linodeID}
            to={`/linodes/${linodeID}/networking`}
            data-testid="vlan-row-link"
          >
            {getLinodeLabel(linodeID)}
            {(idx !== firstFour.length - 1 && data.length <= 4 && `, `) ||
              (data.length > 4 && `, `)}
          </Link>
        ))}
        {data.length > 4 && (
          <span>
            {` `}plus {data.length - 4} more.
          </span>
        )}
      </>
    );
  };

  const linodesList = getLinodesCellString(linodes, loading, error);

  return (
    <TableRow
      key={`vlan-row-${id}`}
      data-testid={`vlan-row-${id}`}
      ariaLabel={`Virtual LAN ${description}`}
    >
      <TableCell data-qa-vlan-cell-label={vlanLabel}>
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item>
            {/* Make this bolder later */}
            <Typography variant="body2" component="h3" data-qa-label>
              {' '}
              <Link to={`/networking/vlans/${id}`}>{vlanLabel} </Link>
            </Typography>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell data-qa-vlan-address>{ipAddress}</TableCell>
      <TableCell data-qa-vlan-interface>{interfaceName}</TableCell>
      <TableCell data-qa-vlan-linodes>{linodesList}</TableCell>
      <TableCell>
        <VlanActionMenu
          vlanID={id}
          vlanLabel={description}
          {...actionHandlers}
        />
      </TableCell>
    </TableRow>
  );
};

export default compose<CombinedProps, ActionHandlers & VLAN>(React.memo)(
  VlanTableRow
);
