import * as React from 'react';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import InformationDialog from 'src/components/InformationDialog';
import CopyTooltip from '../CopyTooltip';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingBottom: theme.spacing(2),
  },
  commandDisplay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgb(244, 244, 244)',
    border: `1px solid rgb(204, 204, 204)`,
    fontSize: '0.875rem',
    lineHeight: 1,
    padding: theme.spacing(),
    whiteSpace: 'nowrap',
    fontFamily: '"SourceCodePro", monospace, sans-serif',
    wordBreak: 'break-all',
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
  actions: {
    marginTop: theme.spacing(),
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  text: {
    marginBottom: theme.spacing(3),
    '& p': {
      lineHeight: 1.5,
    },
  },
  done: {
    float: 'right',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
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
    <InformationDialog
      title="Upload Image with the Linode CLI"
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      {/* <div className={classes.root}> */}
      <Typography className={classes.commandDisplay}>
        {command} <CopyTooltip text={command} className={classes.copyIcon} />
      </Typography>

      <Button
        className={classes.done}
        buttonType="secondary"
        outline
        onClick={onClose}
      >
        Done
      </Button>
      {/* </div> */}
    </InformationDialog>
  );
};

export default React.memo(ImageUploadSuccessDialog);
