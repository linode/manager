import { Event } from '@linode/api-v4/lib/account';
import { ImageStatus } from '@linode/api-v4/lib/images/types';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/styles';
import { splitAt } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import ActionMenu, { Action } from 'src/components/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

export interface Handlers {
  [index: string]: any;
  onCancelFailed: (imageID: string) => void;
  onDelete: (label: string, imageID: string, status?: ImageStatus) => void;
  onDeploy: (imageID: string) => void;
  onEdit: (label: string, description: string, imageID: string) => void;
  onRestore: (imageID: string) => void;
  onRetry: (imageID: string, label: string, description: string) => void;
}

interface Props extends Handlers {
  description: string;
  event: Event;
  id: string;
  label: string;
  status?: ImageStatus;
}

type CombinedProps = Props & RouteComponentProps<{}>;

export const ImagesActionMenu: React.FC<CombinedProps> = (props) => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const {
    description,
    event,
    id,
    label,
    onCancelFailed,
    onDelete,
    onDeploy,
    onEdit,
    onRestore,
    onRetry,
    status,
  } = props;

  const actions: Action[] = React.useMemo(() => {
    const isDisabled = status && status !== 'available';
    const isAvailable = !isDisabled;
    const isFailed = event?.status === 'failed';
    return isFailed
      ? [
          {
            onClick: () => {
              onRetry(id, label, description);
            },
            title: 'Retry',
          },
          {
            onClick: () => {
              onCancelFailed(id);
            },
            title: 'Cancel',
          },
        ]
      : [
          {
            disabled: isDisabled,
            onClick: () => {
              onEdit(label, description ?? ' ', id);
            },
            title: 'Edit',
            tooltip: isDisabled
              ? 'Image is not yet available for use.'
              : undefined,
          },
          {
            disabled: isDisabled,
            onClick: () => {
              onDeploy(id);
            },
            title: 'Deploy to New Linode',
            tooltip: isDisabled
              ? 'Image is not yet available for use.'
              : undefined,
          },
          {
            disabled: isDisabled,
            onClick: () => {
              onRestore(id);
            },
            title: 'Rebuild an Existing Linode',
            tooltip: isDisabled
              ? 'Image is not yet available for use.'
              : undefined,
          },
          {
            onClick: () => {
              onDelete(label, id, status);
            },
            title: isAvailable ? 'Delete' : 'Cancel Upload',
          },
        ];
  }, [
    status,
    description,
    id,
    label,
    onDelete,
    onRestore,
    onDeploy,
    onEdit,
    onRetry,
    onCancelFailed,
    event,
  ]);

  /**
   * Moving all actions to the dropdown menu to prevent visual mismatches
   * between different Image types/statuses.
   *
   * Leaving the logic in place in case until the decision has been officially OK'd.
   */
  const splitActionsArrayIndex =
    !matchesSmDown && status === 'pending_upload' ? 1 : 0;
  const [inlineActions, menuActions] = splitAt(splitActionsArrayIndex, actions);

  return (
    <>
      {!matchesSmDown &&
        inlineActions.map((action) => {
          return (
            <InlineMenuAction
              actionText={action.title}
              disabled={action.disabled}
              key={action.title}
              onClick={action.onClick}
              tooltip={action.tooltip}
            />
          );
        })}
      <ActionMenu
        actionsList={menuActions}
        ariaLabel={`Action menu for Image ${props.label}`}
      />
    </>
  );
};

export default withRouter(ImagesActionMenu);
