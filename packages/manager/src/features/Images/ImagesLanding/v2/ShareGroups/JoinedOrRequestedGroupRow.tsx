import { TableCell, TableRow } from '@akamai/cds-components/react/Table';
import { formatDate } from '@akamai/compute-ui-core/datetime';
import { capitalize, truncateEnd } from '@akamai/compute-ui-core/formatting';
import { usePreferences, useProfile } from '@linode/queries';
import { Hidden, LinkButton, Tooltip } from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';

import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import {
  SHARE_GROUPS_JOINED_TAB_PENDO_IDS,
  SHARE_GROUPS_MEMBERSHIP_REQUESTS_TAB_PENDO_IDS,
} from 'src/features/Images/constants';
import { getIsTableStripingEnabled } from 'src/features/Profile/Settings/TableStriping.utils';

import {
  CANCEL_MEMBERSHIP_REQUEST_DIALOG_PENDO_IDS,
  LEAVE_GROUP_DIALOG_PENDO_IDS,
} from '../constants';
import { LeaveGroupOrCancelRequestDialog } from './LeaveGroupOrCancelRequestDialog';
import {
  StyledCopyIcon,
  TABLE_CELL_BASE_STYLES,
} from './ShareGroupTable.styles';

import type { SharegroupToken } from '@linode/api-v4';
import type { Status } from 'src/components/StatusIcon/StatusIcon';

interface Props {
  joinedGroup: SharegroupToken;
}

const statusIconMap: Record<SharegroupToken['status'], Status> = {
  active: 'active',
  expired: 'inactive',
  pending: 'other',
  revoked: 'inactive',
};

export const JoinedOrRequestedGroupRow = (props: Props) => {
  const { joinedGroup } = props;

  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = React.useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);

  const { data: profile } = useProfile();

  const navigate = useNavigate();

  const {
    created,
    expiry,
    sharegroup_label,
    sharegroup_uuid,
    status,
    token_uuid,
    updated,
    valid_for_sharegroup_uuid,
  } = joinedGroup;

  const { data: tableStripingPreference } = usePreferences(
    (preferences) => preferences?.isTableStripingEnabled
  );

  const isTableStripingEnabled = getIsTableStripingEnabled(
    tableStripingPreference
  );

  const isRequestedMembership = !sharegroup_uuid; // If sharegroup_uuid is null, then this token represents a pending membership request. If it's not null, then it's an active membership in a joined group.

  if (isRequestedMembership) {
    return (
      <>
        <TableRow
          data-qa-membershiprequestrow-row={token_uuid}
          key={token_uuid}
          rowborder={!isTableStripingEnabled}
          style={{ padding: 0 }}
          zebra={isTableStripingEnabled}
        >
          <Hidden smDown>
            <TableCell
              data-pendo-id={
                SHARE_GROUPS_MEMBERSHIP_REQUESTS_TAB_PENDO_IDS.shareGroupUuid
              }
              style={{
                ...TABLE_CELL_BASE_STYLES,
                maxWidth: '35%',
                wordBreak: 'break-all',
              }}
            >
              {valid_for_sharegroup_uuid ?? '–'}
              {valid_for_sharegroup_uuid && (
                <StyledCopyIcon
                  data-pendo-id={
                    SHARE_GROUPS_MEMBERSHIP_REQUESTS_TAB_PENDO_IDS.shareGroupUuid
                  }
                  text={valid_for_sharegroup_uuid}
                />
              )}
            </TableCell>
          </Hidden>
          <TableCell
            className="token-uuid-column"
            style={{
              ...TABLE_CELL_BASE_STYLES,
              maxWidth: '35%',
              wordBreak: 'break-all',
            }}
          >
            {token_uuid}
            {
              <StyledCopyIcon
                data-pendo-id={
                  SHARE_GROUPS_MEMBERSHIP_REQUESTS_TAB_PENDO_IDS.tokenUuid
                }
                text={token_uuid}
              />
            }
          </TableCell>
          <TableCell
            style={{
              ...TABLE_CELL_BASE_STYLES,
              maxWidth: '15%',
            }}
          >
            <StatusIcon pulse={false} status={statusIconMap[status]} />
            {capitalize(status)}
          </TableCell>
          <Hidden lgDown>
            <TableCell
              style={{
                ...TABLE_CELL_BASE_STYLES,
                maxWidth: '15%',
                whiteSpace: 'nowrap',
              }}
            >
              {formatDate(created, { timezone: profile?.timezone })}
            </TableCell>
          </Hidden>
          <Hidden mdDown>
            <TableCell
              style={{
                ...TABLE_CELL_BASE_STYLES,
                maxWidth: '15%',
                whiteSpace: 'nowrap',
              }}
            >
              {formatDate(expiry, { timezone: profile?.timezone })}
            </TableCell>
          </Hidden>
          <TableCell style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {status === 'pending' && (
              <LinkButton
                data-pendo-id={
                  SHARE_GROUPS_MEMBERSHIP_REQUESTS_TAB_PENDO_IDS.cancelRequestButton
                }
                onClick={() => setIsCancelDialogOpen(true)}
                sx={{
                  whiteSpace: 'nowrap',
                }}
              >
                Cancel
              </LinkButton>
            )}
          </TableCell>
        </TableRow>
        {isCancelDialogOpen && (
          <LeaveGroupOrCancelRequestDialog
            groupName={''}
            isCancelRequestDialog
            onClose={() => setIsCancelDialogOpen(false)}
            open={isCancelDialogOpen}
            pendoIDs={{
              cancelButton:
                CANCEL_MEMBERSHIP_REQUEST_DIALOG_PENDO_IDS.cancelButton,
              confirmButton:
                CANCEL_MEMBERSHIP_REQUEST_DIALOG_PENDO_IDS.confirmButton,
              xButton: CANCEL_MEMBERSHIP_REQUEST_DIALOG_PENDO_IDS.xButton,
            }}
            tokenUuid={token_uuid}
          />
        )}
      </>
    );
  }

  return (
    <>
      <TableRow
        data-qa-joinedgroup-row={token_uuid}
        key={token_uuid}
        rowborder={!isTableStripingEnabled}
        style={{ padding: 0 }}
        zebra={isTableStripingEnabled}
      >
        <Tooltip
          title={
            sharegroup_label && sharegroup_label.length > 32
              ? sharegroup_label
              : ''
          }
        >
          <TableCell
            className="group-column"
            data-pendo-id={SHARE_GROUPS_JOINED_TAB_PENDO_IDS.joinedGroupName}
          >
            {sharegroup_label ? (
              <LinkButton
                onClick={() => {
                  navigate({
                    to: '/images/share-groups/joined-groups/$tokenUuid',
                    params: {
                      tokenUuid: token_uuid,
                    },
                  });
                }}
                sx={{
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  display: 'block',
                }}
              >
                {truncateEnd(sharegroup_label, 32)}
              </LinkButton>
            ) : (
              '–'
            )}
          </TableCell>
        </Tooltip>
        <TableCell className="membership-status-column">
          <StatusIcon pulse={false} status={statusIconMap[status]} />
          {capitalize(status)}
        </TableCell>
        <Hidden mdDown>
          <TableCell className="status-changed-column">
            {updated !== null
              ? formatDate(updated, { timezone: profile?.timezone })
              : '–'}
          </TableCell>
        </Hidden>
        <TableCell style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {!['expired', 'revoked'].includes(status) && (
            <LinkButton
              data-pendo-id={SHARE_GROUPS_JOINED_TAB_PENDO_IDS.leaveGroupButton}
              onClick={() => setIsLeaveDialogOpen(true)}
              sx={{
                whiteSpace: 'nowrap',
              }}
            >
              Leave Group
            </LinkButton>
          )}
        </TableCell>
      </TableRow>
      {isLeaveDialogOpen && (
        <LeaveGroupOrCancelRequestDialog
          groupName={sharegroup_label ?? 'share group'}
          onClose={() => setIsLeaveDialogOpen(false)}
          open={isLeaveDialogOpen}
          pendoIDs={{
            cancelButton:
              LEAVE_GROUP_DIALOG_PENDO_IDS.cancelButton.joinedGroupLanding,
            confirmButton:
              LEAVE_GROUP_DIALOG_PENDO_IDS.confirmButton.joinedGroupLanding,
            xButton: LEAVE_GROUP_DIALOG_PENDO_IDS.xButton.joinedGroupLanding,
          }}
          tokenUuid={token_uuid}
        />
      )}
    </>
  );
};
