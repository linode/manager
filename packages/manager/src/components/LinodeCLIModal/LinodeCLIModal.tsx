import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Dialog from 'src/components/Dialog';
import CopyTooltip from '../CopyTooltip';

const useStyles = makeStyles((theme: Theme) => ({
  dialog: {
    width: '100%',
    padding: theme.spacing(),
    '& [data-qa-copied]': {
      zIndex: 2,
    },
  },
  commandAndCopy: {
    paddingBottom: theme.spacing(4),
  },
  commandDisplay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.bg.main,
    border: `1px solid ${theme.color.border2}`,
    fontSize: '0.875rem',
    lineHeight: 1,
    padding: theme.spacing(),
    whiteSpace: 'nowrap',
    fontFamily: '"SourceCodePro", monospace, sans-serif',
    wordBreak: 'break-all',
    position: 'relative',
    width: '100%',
  },
  cliText: {
    overflowY: 'hidden', // For Edge
    overflowX: 'auto',
    paddingRight: 15,
  },
  copyIcon: {
    color: theme.palette.primary.main,
    position: 'relative',
    display: 'inline-block',
    transition: theme.transitions.create(['color']),
    '& svg': {
      width: '1em',
      height: '1em',
    },
  },
  text: {
    marginBottom: theme.spacing(3),
    '& p': {
      lineHeight: 1.5,
    },
  },
}));

interface Props {
  isOpen: boolean;
  onClose: () => void;
  command: string;
}

export type CombinedProps = Props;

export const ImageUploadSuccessDialog: React.FC<Props> = (props) => {
  const { isOpen, onClose, command } = props;
  const classes = useStyles();

  return (
    <Dialog
      title="Upload Image with the Linode CLI"
      open={isOpen}
      onClose={onClose}
      fullWidth
      className={classes.dialog}
    >
      <div className={classes.commandAndCopy}>
        <Typography className={classes.commandDisplay}>
          <div className={classes.cliText}>{command}</div>{' '}
          <CopyTooltip text={command} className={classes.copyIcon} />
        </Typography>
      </div>
    </Dialog>
  );
};

export default React.memo(ImageUploadSuccessDialog);
