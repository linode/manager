import { compose } from 'ramda';
import * as React from 'react';
import DialogTitle from 'src/components/core/DialogTitle';
import RenderGuard from 'src/components/RenderGuard';

interface Props {
  title: string;
  className?: string;
}

// Accessibility Feature:
// Focus on modal title on component mount

const _DialogTitle: React.FC<Props> = props => {
  const dialogTitile = React.useRef<HTMLDivElement>(null);
  const { className, title } = props;

  React.useEffect(() => {
    if (dialogTitile.current !== null) {
      dialogTitile.current.focus();
    }
  }, []);

  return (
    <DialogTitle
      title={title}
      tabIndex={-1}
      className={className}
      ref={dialogTitile}
    >
      {title}
    </DialogTitle>
  );
};

export default compose<any, any>(RenderGuard)(_DialogTitle);
