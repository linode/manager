import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';

type ClassNames = 'root' | 'button' | 'copy';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    paddingTop: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 3,
  },
  copy: {
    textAlign: 'center',
  },
  button: {
    borderRadius: '4px',
  },
  [theme.breakpoints.up('md')]: {
    root: {
      paddingTop: '50px',
      paddingBottom: '50px',
    },
  },
});



interface Props {
  icon?: React.ComponentType<any>;
  copy?: string;
  title?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const Placeholder: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, copy, title, icon: Icon } = props;
  return (
    <Grid
      container
      spacing={24}
      alignItems="center"
      direction="column"
      justify="center"
      className={classes.root}
    >
      <Grid item xs={12}>{Icon && <Icon />}</Grid>
      <Grid item xs={12}>{title}</Grid>
      <Grid item xs={12} lg={10} className={classes.copy}>
        <Typography variant="body1">{copy}</Typography>
      </Grid>
    </Grid >
  );
};

Placeholder.defaultProps = {
  icon: LinodeIcon,
  copy: 'The feature you are looking for is currently in development. Please check back soon.',
  title: 'Feature in Progress',
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(Placeholder);
