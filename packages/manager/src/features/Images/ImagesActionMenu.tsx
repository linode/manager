import { Event } from '@linode/api-v4/lib/account';
import { ImageStatus } from '@linode/api-v4/lib/images/types';
import { splitAt } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionMenu, { Action } from 'src/components/ActionMenu';
import { Theme, useMediaQuery, useTheme } from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';

export interface Handlers {
  onRestore: (imageID: string) => void;
  onDeploy: (imageID: string) => void;
  onEdit: (label: string, description: string, imageID: string) => void;
  onDelete: (label: string, imageID: string, status?: ImageStatus) => void;
  onRetry: (imageID: string, label: string, description: string) => void;
  onCancelFailed: (imageID: string) => void;
  [index: string]: any;
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
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    description,
    id,
    label,
    status,
    event,
    onRestore,
    onDeploy,
    onEdit,
    onDelete,
    onRetry,
    onCancelFailed,
  } = props;

  const actions: Action[] = React.useMemo(() => {
    const isDisabled = status && status !== 'available';
    const isAvailable = !isDisabled;
    const isFailed = event?.status === 'failed';
    return isFailed
      ? [
          {
            title: 'Retry',
            onClick: () => {
              onRetry(id, label, description);
            },
          },
          {
            title: 'Cancel',
            onClick: () => {
              onCancelFailed(id);
            },
          },
        ]
      : [
          {
            title: 'Edit',
            disabled: isDisabled,
            tooltip: isDisabled
              ? 'Image is not yet available for use.'
              : undefined,
            onClick: () => {
              onEdit(label, description ?? ' ', id);
            },
          },
          {
            title: 'Deploy to New Linode',
            disabled: isDisabled,
            tooltip: isDisabled
              ? 'Image is not yet available for use.'
              : undefined,
            onClick: () => {
              onDeploy(id);
            },
          },
          {
            title: 'Rebuild an Existing Linode',
            disabled: isDisabled,
            tooltip: isDisabled
              ? 'Image is not yet available for use.'
              : undefined,
            onClick: () => {
              onRestore(id);
            },
          },
          {
            title: isAvailable ? 'Delete' : 'Cancel Upload',
            onClick: () => {
              onDelete(label, id, status);
            },
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
              key={action.title}
              actionText={action.title}
              onClick={action.onClick}
              disabled={action.disabled}
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
