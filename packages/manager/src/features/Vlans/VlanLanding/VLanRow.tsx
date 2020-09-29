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
import ActionMenu, { ActionHandlers } from './VlanActionMenu';
import { getLinodeLabel } from 'src/features/Dashboard/VolumesDashboardCard/VolumeDashboardRow';
import { truncateAndJoinList } from 'src/utilities/stringUtils';

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
  isVLANLanding?: boolean;
}

export type CombinedProps = VLAN & ActionHandlers;

export const VlanRow: React.FC<CombinedProps> = props => {
  const {
    // id,
    // description,
    // region,
    // linodeIDs,
    // loading,
    // error,
    isVLANLanding,
    id,
    description,
    interfaceName,
    ip_address: ipAddress,
    linodes,
    loading,
    error,
    linodeIDs,
    ...actionHandlers
  } = props;

  // console.log(props);

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
    return (
      // eslint-disable-next-line react/jsx-no-useless-fragment
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

  return isVLANLanding ? (
    <TableRow
      key={`vlan-row-${id}`}
      data-testid={`vlan-row-${id}`}
      ariaLabel={`Virtual LAN ${description}`}
    >
      <TableCell>
        <div className={classes.labelWrapper}>
          <Link className={classes.link} to={`/networking/vlans/${id}`}>
            {description}
          </Link>
        </div>
      </TableCell>
      <TableCell>{/* region */}</TableCell>

      <TableCell className={classes.linodesWrapper}>
        {/* {getLinodesCellString(linodeIDs, loading, error)} */}
      </TableCell>

      <TableCell>
        <ActionMenu vlanID={id} vlanLabel={description} {...actionHandlers} />
      </TableCell>
    </TableRow>
  ) : (
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
      <TableCell data-qa-vlan-linodes>{/* {truncatedLinodeIDs} */}</TableCell>
      <TableCell>
        <ActionMenu vlanID={id} vlanLabel={description} {...actionHandlers} />
      </TableCell>
    </TableRow>
  );
};

export default compose<CombinedProps, ActionHandlers & VLAN>(React.memo)(
  VlanRow
);
