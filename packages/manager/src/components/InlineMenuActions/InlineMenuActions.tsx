import * as React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  actionText: string;
  className: string;
  element: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  linodeId?: number;
}

type CombinedProps = Props;

const InlineMenuActions: React.FC<CombinedProps> = props => {
  const { actionText, className, element, disabled, onClick, linodeId } = props;

  if (element === 'button') {
    return (
      <button className={className} onClick={onClick} disabled={disabled}>
        {actionText}
      </button>
    );
  } else if (element === 'link') {
    return (
      <Link className={className} to={`/linodes/${linodeId}`}>
        <span>{actionText}</span>
      </Link>
    );
  } else {
    return;
  }
};

export default InlineMenuActions;
