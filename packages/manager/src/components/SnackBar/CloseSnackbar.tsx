import Close from '@material-ui/icons/Close';
import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import IconButton from 'src/components/IconButton';

type ClassNames = 'icon';

interface Props {
  onClick: () => void;
  text: string;
}

const styles = (theme: Theme) =>
  createStyles({
    icon: {
      color: theme.palette.text.primary,
      padding: theme.spacing(1),
    },
  });

type CombinedProps = Props & WithStyles<ClassNames>;

const CloseSnackbar: React.FC<CombinedProps> = (props) => {
  const { classes, text, onClick } = props;

  return (
    <IconButton onClick={onClick} title={text} className={classes.icon}>
      <Close />
    </IconButton>
  );
};

const styled = withStyles(styles);

export default styled(CloseSnackbar);
