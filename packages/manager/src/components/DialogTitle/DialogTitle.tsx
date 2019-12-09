import * as React from 'react';
import DialogTitle from 'src/components/core/DialogTitle';

interface Props {
  title: string;
  className?: string;
}

// Accessibility Feature:
// Focus on modal title on component mount

const _DialogTitle: React.FC<Props> = props => {
  const dialogTitle = React.useRef<HTMLDivElement>(null);
  const { className, title } = props;

  React.useEffect(() => {
    if (dialogTitle.current !== null) {
      dialogTitle.current.focus();
    }
  }, []);

  return (
    <DialogTitle
      title={title}
      tabIndex={-1}
      className={className}
      ref={dialogTitle}
    >
      {title}
    </DialogTitle>
  );
};

export default _DialogTitle;
