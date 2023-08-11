import * as React from 'react';

import Info from 'src/assets/icons/info.svg';
import { IconButton } from 'src/components/IconButton';

interface Props {
  onClick: () => void;
}

const getOnClickHandler = (openDrawer: Props['onClick']) => (
  event: React.MouseEvent<any>
) => {
  event.stopPropagation();
  event.preventDefault();
  openDrawer();
};

export const AppInfo = (props: Props) => {
  const { onClick } = props;
  const onClickHandler = getOnClickHandler(onClick);
  return (
    <IconButton onClick={onClickHandler} size="large">
      <Info />
    </IconButton>
  );
};
