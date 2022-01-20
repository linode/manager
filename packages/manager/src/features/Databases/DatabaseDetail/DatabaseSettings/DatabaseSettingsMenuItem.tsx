import * as React from 'react';
import Grid from 'src/components/Grid';
import Typography from 'src/components/core/Typography';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';

interface Props {
  buttonText: string;
  descriptiveText: string;
  sectionTitle: string;
  onClick: () => void;
  disabled?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  menuItem: {
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
  },
  menuItemTitle: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  menuItemButtonContainer: {
    marginTop: theme.spacing(2),
    justifyContent: 'flex-end',
    alignContent: 'flex-start',
  },
}));

export const DatabaseSettingsMenuItem: React.FC<Props> = (props) => {
  const {
    buttonText,
    descriptiveText,
    sectionTitle,
    onClick,
    disabled = false,
    children,
  } = props;

  const classes = useStyles();

  return (
    <Grid container className={classes.menuItem}>
      <Grid item lg={6} sm={12}>
        <Typography className={classes.menuItemTitle} variant="h3">
          {sectionTitle}
        </Typography>
        <Typography>{descriptiveText}</Typography>
        {children}
      </Grid>
      <Grid
        container
        item
        lg={3}
        sm={12}
        className={classes.menuItemButtonContainer}
      >
        <Button
          disabled={disabled}
          buttonType="primary"
          onClick={onClick}
          fullWidth
        >
          {buttonText}
        </Button>
      </Grid>
    </Grid>
  );
};

export default DatabaseSettingsMenuItem;
