import * as React from 'react';
import MenuItem from 'src/components/MenuItem';

interface Props {
  createActions: any;
}

const MockActionMenu: React.FC<Props> = (props) => {
  const { createActions } = props;
  const actions = createActions(() => null);
  return (
    // eslint-disable-next-line
    <>
      {(actions as any).map((a: any, idx: number) => (
        <MenuItem
          key={idx}
          onClick={a.onClick}
          data-qa-action-menu-item={a.title}
          disabled={a.disabled}
          tooltip={a.tooltip}
          isLoading={a.isLoading}
        >
          {a.title}
        </MenuItem>
      ))}
    </>
  );
};

export default MockActionMenu;
