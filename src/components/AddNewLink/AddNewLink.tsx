import * as React from 'react';
import IconTextLink from 'src/components/IconTextLink';
import PlusSquare from 'src/assets/icons/plus-square.svg';

export interface Props {
  label: string;
  onClick: (e?: React.MouseEvent<HTMLElement>) => void;
  display?: string;
  disabled?: boolean;
  left?: boolean;
}

type CombinedProps = Props;

const AddNewLink: React.StatelessComponent<CombinedProps> = (props) => {
  const { onClick, label, display, disabled, left } = props;
  return (
    <IconTextLink
      SideIcon={PlusSquare}
      onClick={onClick}
      title={label}
      text={label}
      disabled={disabled}
      left={left}
    >
      {display || label}
    </IconTextLink>
  );
};

export default AddNewLink;
