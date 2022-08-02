import Close from '@material-ui/icons/Close';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import IconButton from 'src/components/IconButton';

interface Props {
  onClick: () => void;
  text: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    color: theme.palette.text.primary,
    padding: theme.spacing(1),
  },
}));

const CloseSnackbar = (props: Props) => {
  const classes = useStyles();
  const { text, onClick } = props;

  return (
    <IconButton onClick={onClick} title={text} className={classes.icon}>
      <Close />
    </IconButton>
  );
};

export default CloseSnackbar;
