import Close from '@mui/icons-material/Close';
import * as React from 'react';
import DialogTitle from 'src/components/core/DialogTitle';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    border: 'none',
    backgroundColor: 'inherit',
    paddingRight: 0,
    paddingLeft: 0,
    cursor: 'pointer',
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
}));
interface Props {
  title: string;
  className?: string;
  onClose?: () => void;
}

// Accessibility Feature:
// Focus on modal title on component mount

const _DialogTitle: React.FC<Props> = (props) => {
  const dialogTitle = React.useRef<HTMLDivElement>(null);
  const { className, onClose, title } = props;
  const classes = useStyles();

  React.useEffect(() => {
    if (dialogTitle.current !== null) {
      dialogTitle.current.focus();
    }
  }, []);

  return (
    <DialogTitle
      data-qa-dialog-title={title}
      title={title}
      tabIndex={0}
      className={className}
      ref={dialogTitle}
    >
      <div className={classes.root}>
        {title}
        {onClose ? (
          <button className={classes.button} onClick={onClose}>
            <Close />
          </button>
        ) : null}
      </div>
    </DialogTitle>
  );
};

export default _DialogTitle;
