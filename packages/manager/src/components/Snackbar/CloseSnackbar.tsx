import Close from '@mui/icons-material/Close';
import { Theme } from '@mui/material/styles';
import { WithStyles, createStyles, withStyles } from '@mui/styles';
import * as React from 'react';

import { IconButton } from 'src/components/IconButton';

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
  const { classes, onClick, text } = props;

  return (
    <IconButton
      className={classes.icon}
      onClick={onClick}
      size="large"
      title={text}
    >
      <Close />
    </IconButton>
  );
};

const styled = withStyles(styles);

export default styled(CloseSnackbar);
