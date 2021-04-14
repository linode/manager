import { Event } from '@linode/api-v4/lib/account';
import { ImageStatus } from '@linode/api-v4/lib/images/types';
import { splitAt } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActionMenu, {
  Action,
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import { Theme, useMediaQuery, useTheme } from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction';

export interface Handlers {
  onRestore: (imageID: string) => void;
  onDeploy: (imageID: string) => void;
  onEdit: (label: string, description: string, imageID: string) => void;
  onDelete: (label: string, imageID: string, status?: ImageStatus) => void;
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
    onRestore,
    onDeploy,
    onEdit,
    onDelete,
  } = props;

  const actions: Action[] = React.useMemo(() => {
    // @todo remove first half of this conditional when Machine Images is GA
    const isDisabled = status && status !== 'available';
    return status === 'pending_upload'
      ? [
          // Cancelling a pending upload is functionally equivalent to deleting it
          {
            title: 'Cancel',
            onClick: () => {
              onDelete(label, id, status);
            },
          },
        ]
      : [
          {
            title: 'Edit',
            onClick: () => {
              onEdit(label, description ?? ' ', id);
            },
          },
          {
            title: 'Deploy New Linode',
            disabled: isDisabled,
            tooltip: isDisabled
              ? 'Image is not yet available for use.'
              : undefined,
            onClick: () => {
              onDeploy(id);
            },
          },
          {
            title: 'Restore to Existing Linode',
            disabled: isDisabled,
            tooltip: isDisabled
              ? 'Image is not yet available for use.'
              : undefined,
            onClick: () => {
              onRestore(id);
            },
          },
          {
            title: 'Delete',
            onClick: () => {
              onDelete(label, id, status);
            },
          },
        ];
  }, [status, description, id, label, onDelete, onRestore, onDeploy, onEdit]);

  /**
   * Moving all actions to the dropdown menu to prevent visual mismatches
   * between different Image types/statuses.
   *
   * Leaving the logic in place in case until the decision has been officially OK'd.
   */
  const splitActionsArrayIndex = 0;
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
