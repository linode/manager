import { VLAN } from '@linode/api-v4/lib/vlans';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import VlanActionMenu, { ActionHandlers } from './VlanActionMenu';
import { getLinodeLabel } from 'src/features/Dashboard/VolumesDashboardCard/VolumeDashboardRow';

export const MAX_LINODES_VLANATTACHED_DISPLAY = 50;

interface Props {
  readOnly: boolean;
}

export type CombinedProps = Props & VLAN & ActionHandlers;

export const VlanTableRow: React.FC<CombinedProps> = props => {
  const {
    id,
    description,
    interfaceName,
    ip_address: ipAddress,
    linodes,
    loading,
    error,
    readOnly,
    currentLinode,
    ...actionHandlers
  } = props;

  const vlanLabel = description.length > 32 ? `vlan-${id}` : description;

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
    // Remove the Linode the user is currently on from the array of Linode IDs the VLAN is attached to, and render that Linode's label first in the list as a non-link.
    const indexOfCurrentLinode = data.findIndex(
      element => element === currentLinode
    );
    data.splice(indexOfCurrentLinode, 1);

    return (
      // eslint-disable-next-line react/jsx-no-useless-fragment
      <>
        {getLinodeLabel(currentLinode)}
        {data.length > 0 && `, `}
        {data.map((linodeID, idx) => (
          <Link
            key={linodeID}
            to={`/linodes/${linodeID}/networking`}
            data-testid="vlan-row-link"
          >
            {getLinodeLabel(linodeID)}
            {(idx !== data.length - 1 &&
              data.length <= MAX_LINODES_VLANATTACHED_DISPLAY &&
              `, `) ||
              (data.length > MAX_LINODES_VLANATTACHED_DISPLAY && `, `)}
          </Link>
        ))}
        {data.length > MAX_LINODES_VLANATTACHED_DISPLAY && (
          <span>
            {` `}plus {data.length - MAX_LINODES_VLANATTACHED_DISPLAY} more
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
            <Typography style={{ fontWeight: 700 }} data-qa-label>
              {' '}
              <Link to={`/vlans/${id}`}>{vlanLabel}</Link>
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
          readOnly={readOnly}
          {...actionHandlers}
        />
      </TableCell>
    </TableRow>
  );
};

export default compose<CombinedProps, ActionHandlers & VLAN>(React.memo)(
  VlanTableRow
);
