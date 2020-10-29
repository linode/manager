import { APIError } from '@linode/api-v4/lib/types';
import { VLAN } from '@linode/api-v4/lib/vlans';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import { getLinodeLabel } from 'src/features/Dashboard/VolumesDashboardCard/VolumeDashboardRow';
import { getEntityByIDFromStore } from 'src/utilities/getEntityByIDFromStore';
import { VlanData } from './LinodeVLANs';
import VlanActionMenu, { ActionHandlers } from './VlanActionMenu';

export const MAX_LINODES_VLANATTACHED_DISPLAY = 50;

export type CombinedProps = VlanData & ActionHandlers;

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
    currentLinodeId,
    ...actionHandlers
  } = props;

  const vlanLabel = description.length > 32 ? `vlan-${id}` : description;

  const getLinodesCellString = (
    vlanLinodes: VLAN['linodes'],
    loading: boolean,
    error?: APIError[]
  ): string | JSX.Element => {
    if (loading) {
      return 'Loading...';
    }

    if (error) {
      return 'Error retrieving Linodes';
    }

    if (vlanLinodes.length === 0) {
      return 'None assigned';
    }

    return getLinodeLinks(vlanLinodes);
  };

  const getLinodeLinks = (vlanLinodes: VLAN['linodes']): JSX.Element => {
    // To render the label of the linode the user is currently on first in the list as  non-link, exclude it from the list of linodes the VLAN is attached to.

    // If the element is the current linode's ID, or the linode ID is not found in the store, filter it out. The second check avoids an edge case where deleted linodes still attached to VLANs cause a manifestation of the comma display bug.
    const filteredLinodes = vlanLinodes.filter(vlanLinode => {
      return (
        vlanLinode.id !== currentLinodeId &&
        getEntityByIDFromStore('linode', vlanLinode.id)
      );
    });

    const generatedLinks = filteredLinodes.map(linode => (
      <Link
        key={linode.id}
        to={`/linodes/${linode.id}/networking`}
        data-testid="vlan-row-link"
      >
        {getLinodeLabel(linode.id)}
      </Link>
    ));

    return (
      // eslint-disable-next-line react/jsx-no-useless-fragment
      <>
        {getLinodeLabel(currentLinodeId)}
        {filteredLinodes.length >= 1 && `, `}
        {truncateAndJoinJSXList(
          generatedLinks,
          MAX_LINODES_VLANATTACHED_DISPLAY
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
      <TableCell data-qa-vlan-address>
        {ipAddress !== '' ? ipAddress : 'None'}
      </TableCell>
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

export const truncateAndJoinJSXList = (
  JSXList: JSX.Element[],
  max = 100
): JSX.Element => {
  const count = JSXList.length;
  const countLessThanOrEqualToMax = count <= max;

  const remainingItemCount = count - max;

  /*
  - If the list length is less than the max, add a comma after every item unless it is the last one in the list.
  - If the list length is greater than the max, slice the list and add truncation text at the end.
  */

  if (countLessThanOrEqualToMax) {
    return (
      // eslint-disable-next-line react/jsx-no-useless-fragment
      <>
        {JSXList.map((item, idx) => (
          <span key={idx}>
            {item}
            {idx !== count - 1 && `, `}
          </span>
        ))}
      </>
    );
  } else {
    // count is greater than max
    const slicedList = JSXList.slice(0, max);

    return (
      <>
        {slicedList.map((item, idx) => (
          <span key={idx}>
            {item}
            {`, `}
          </span>
        ))}
        <span data-testid="truncated-text">
          {` `}plus {remainingItemCount} more
        </span>
      </>
    );
  }
};

export default compose<CombinedProps, VlanData & ActionHandlers>(React.memo)(
  VlanTableRow
);
