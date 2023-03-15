import Close from '@mui/icons-material/Close';
import * as React from 'react';
import { createStyles, withStyles, WithStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
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
    <IconButton
      onClick={onClick}
      title={text}
      className={classes.icon}
      size="large"
    >
      <Close />
    </IconButton>
  );
};

const styled = withStyles(styles);

export default styled(CloseSnackbar);
