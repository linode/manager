import * as React from 'react';
import Tooltip from 'src/components/core/Tooltip';

interface Props {
  title: string;
  children: JSX.Element;
  role: string;
}

export const TopMenuIcon: React.FC<Props> = (props) => {
  const { title } = props;
  return (
    <Tooltip
      title={title}
      disableTouchListener
      enterDelay={500}
      leaveDelay={0}
      role={'link' || 'button'}
    >
      <div>{props.children}</div>
    </Tooltip>
  );
};

export default React.memo(TopMenuIcon);
