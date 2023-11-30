import { Theme, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import { Action, ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

export interface Handlers {
  handleClickDelete: (objectName: string) => void;
  handleClickDownload: (objectName: string, newTab: boolean) => void;
}

export interface Props extends Handlers {
  objectName: string;
}

export const ObjectActionMenu: React.FC<Props> = (props) => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const { handleClickDelete, handleClickDownload, objectName } = props;

  const actions: Action[] = [
    {
      onClick: () => {
        const shouldOpenInNewTab = true;
        handleClickDownload(objectName, shouldOpenInNewTab);
      },
      title: 'Download',
    },
    {
      onClick: () => {
        handleClickDelete(objectName);
      },
      title: 'Delete',
    },
  ];

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {matchesSmDown ? (
        <ActionMenu
          actionsList={actions}
          ariaLabel={`Action menu for Object ${objectName}`}
        />
      ) : (
        actions.map((action) => {
          return (
            <InlineMenuAction
              actionText={action.title}
              key={action.title}
              onClick={action.onClick}
            />
          );
        })
      )}
    </>
  );
};

export default ObjectActionMenu;
