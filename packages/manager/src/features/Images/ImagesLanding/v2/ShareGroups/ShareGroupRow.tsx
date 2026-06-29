import { TableCell, TableRow } from '@akamai/cds-components/react/Table';
import { formatDate } from '@akamai/compute-ui-core/datetime';
import { usePreferences, useProfile } from '@linode/queries';
import { Hidden, Tooltip } from '@linode/ui';
import React from 'react';

import { Link } from 'src/components/Link';
import { getIsTableStripingEnabled } from 'src/features/Profile/Settings/TableStriping.utils';

import { ShareGroupActionMenu } from './ShareGroupActionMenu';
import { StyledActionMenuWrapper } from './ShareGroupTable.styles';

import type { Handlers } from './ShareGroupActionMenu';
import type { Sharegroup } from '@linode/api-v4';

interface Props {
  handlers?: Handlers;
  shareGroup: Sharegroup;
}

export const ShareGroupRow = (props: Props) => {
  const { shareGroup, handlers } = props;
  const { data: profile } = useProfile();

  const {
    created,
    description,
    images_count,
    label,
    members_count,
    updated,
    id,
  } = shareGroup;

  const labelRef = React.useRef<HTMLAnchorElement>(null);
  const [isLabelOverflowing, setIsLabelOverflowing] = React.useState(false);

  const descriptionRef = React.useRef<HTMLSpanElement>(null);
  const [isDescriptionOverflowing, setIsDescriptionOverflowing] =
    React.useState(false);

  React.useLayoutEffect(() => {
    const checkOverflow = () => {
      if (labelRef.current) {
        setIsLabelOverflowing(
          labelRef.current.scrollWidth > labelRef.current.clientWidth
        );
      }
      if (descriptionRef.current) {
        setIsDescriptionOverflowing(
          descriptionRef.current.scrollWidth >
            descriptionRef.current.clientWidth
        );
      }
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    if (labelRef.current) {
      observer.observe(labelRef.current);
    }
    if (descriptionRef.current) {
      observer.observe(descriptionRef.current);
    }

    return () => observer.disconnect();
  }, [label, description]);

  const { data: tableStripingPreference } = usePreferences(
    (preferences) => preferences?.isTableStripingEnabled
  );

  const isTableStripingEnabled = getIsTableStripingEnabled(
    tableStripingPreference
  );

  return (
    <TableRow
      data-qa-sharegroup-row={id}
      key={id}
      rowborder={!isTableStripingEnabled}
      style={{ padding: 0 }}
      zebra={isTableStripingEnabled}
    >
      <TableCell
        className="group-column"
        data-pendo-id={`Images Groups Owned-Group name`}
      >
        <Tooltip title={isLabelOverflowing ? label : ''}>
          <Link
            ref={labelRef}
            style={{
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              display: 'block',
            }}
            to={`/images/share-groups/owned-groups/${id}`}
          >
            {label}
          </Link>
        </Tooltip>
      </TableCell>
      <TableCell className="description-column">
        <Tooltip title={isDescriptionOverflowing ? description : ''}>
          <span
            ref={descriptionRef}
            style={{
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {description}
          </span>
        </Tooltip>
      </TableCell>
      <TableCell className="membersCount-column">{members_count}</TableCell>
      <Hidden smDown>
        <TableCell className="imagesCount-column">{images_count}</TableCell>
      </Hidden>
      <Hidden lgDown>
        <TableCell className="created-column">
          {created &&
            formatDate(created, {
              timezone: profile?.timezone,
            })}
        </TableCell>
      </Hidden>
      <Hidden lgDown>
        <TableCell className="updated-column">
          {updated !== null
            ? formatDate(updated, { timezone: profile?.timezone })
            : '–'}
        </TableCell>
      </Hidden>
      <StyledActionMenuWrapper>
        <ShareGroupActionMenu
          deleteButtonDisabled={!!members_count}
          handlers={handlers}
          shareGroup={shareGroup}
        />
      </StyledActionMenuWrapper>
    </TableRow>
  );
};
