import { WithStyles } from '@material-ui/core/styles';
import Close from '@material-ui/icons/Close';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import IconButton from 'src/components/IconButton';

type ClassNames = 'icon';

interface Props {
  uuid: string;
  text: string;
}

const styles = (theme: Theme) =>
  createStyles({
    icon: {
      color: theme.palette.text.primary,
      padding: theme.spacing(1)
    }
  });

type CombinedProps = Props & WithStyles<ClassNames>;

const CloseSnackbar: React.FC<CombinedProps> = props => {
  const { classes, text } = props;
  const { closeSnackbar } = useSnackbar();

  const handleClose = () => {
    closeSnackbar(props.uuid);
  };

  return (
    <IconButton onClick={handleClose} title={text} className={classes.icon}>
      <Close />
    </IconButton>
  );
};

const styled = withStyles(styles);

export default styled(CloseSnackbar);
