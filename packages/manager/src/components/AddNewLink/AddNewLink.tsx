import * as React from 'react';

import PlusSquare from 'src/assets/icons/plus-square.svg';
import IconTextLink from 'src/components/IconTextLink';

export interface Props {
  label: string;
  onClick: (e?: React.MouseEvent<HTMLElement>) => void;
  display?: string;
  disabled?: boolean;
  left?: boolean;
  className?: any;
}

type CombinedProps = Props;

const AddNewLink: React.StatelessComponent<CombinedProps> = props => {
  const { onClick, label, display, disabled, left, className } = props;
  return (
    <IconTextLink
      SideIcon={PlusSquare}
      onClick={onClick}
      title={label}
      text={label}
      disabled={disabled}
      left={left}
      className={className}
    >
      {display || label}
    </IconTextLink>
  );
};

export default AddNewLink;
