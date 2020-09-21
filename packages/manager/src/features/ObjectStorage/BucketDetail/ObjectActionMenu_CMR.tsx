import * as React from 'react';
import ActionMenu, {
  Action
} from 'src/components/ActionMenu_CMR/ActionMenu_CMR';
import { Theme, useTheme, useMediaQuery } from 'src/components/core/styles';
import InlineMenuAction from 'src/components/InlineMenuAction/InlineMenuAction';

export interface Handlers {
  handleClickDownload: (objectName: string, newTab: boolean) => void;
  handleClickDelete: (objectName: string) => void;
  handleClickDetails: (objectName: string) => void;
}

interface Props extends Handlers {
  objectName: string;
}

export const ObjectActionMenu: React.FC<Props> = props => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    handleClickDownload,
    handleClickDelete,
    handleClickDetails,
    objectName
  } = props;

  const actions: Action[] = [
    {
      title: 'Details',
      onClick: () => {
        handleClickDetails(objectName);
      }
    },
    {
      title: 'Download',
      onClick: () => {
        const shouldOpenInNewTab = true;
        handleClickDownload(objectName, shouldOpenInNewTab);
      }
    },
    {
      title: 'Delete',
      onClick: () => {
        handleClickDelete(objectName);
      }
    }
  ];

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {matchesSmDown ? (
        <ActionMenu
          createActions={() => actions}
          ariaLabel={`Action menu for Object ${objectName}`}
        />
      ) : (
        actions.map(action => {
          return (
            <InlineMenuAction
              key={action.title}
              actionText={action.title}
              onClick={action.onClick}
            />
          );
        })
      )}
    </>
  );
};

export default ObjectActionMenu;
