import * as React from 'react';

import Button, { ButtonProps } from '@material-ui/core/Button';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import Grid from 'src/components/Grid';

type ClassNames = 'root'
  | 'title'
  | 'copy'
  | 'icon'
  | 'button';

const styles: StyleRulesCallback<ClassNames> = (theme: Linode.Theme) => ({
  '@keyframes scaleIn': {
    from: {
      transform: 'translateX( -10px ) rotateY( -180deg )',
    },
    to: {
      transformOrigin: 'center center',
    },
  },
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  root: {
    padding: `${theme.spacing.unit * 2}px 0`,
    [theme.breakpoints.up('md')]: {
      padding: `${theme.spacing.unit * 10}px 0`,
    },
  },
  copy: {
    textAlign: 'center',
    maxWidth: 350,
  },
  icon: {
    '&.animate' : {
      animation: 'scaleIn .5s ease-in-out',
    },
    width: '225px !important',
    height: '225px !important',
    '& .outerCircle': {
      fill: 'white',
      stroke: theme.bg.offWhite,
    },
    '& .insidePath path': {
      opacity: 0,
      animation: 'fadeIn .2s ease-in-out forwards .3s',
      stroke: theme.palette.primary.main,
    },
  },
  title: {
    textAlign: 'center',
    fontWeight: 700,
  },
  button: {},
});

export interface Props {
  icon?: React.ComponentType<any>;
  animate?: boolean;
  copy?: string;
  title?: string;
  buttonProps?: ButtonProps;
  className?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const Placeholder: React.StatelessComponent<CombinedProps> = (props) => {
  const { animate, classes, copy, title, icon: Icon, buttonProps } = props;
  return (
    <Grid
      container
      spacing={24}
      alignItems="center"
      direction="column"
      justify="center"
      className={`${classes.root} ${props.className}`}
    >
      <Grid item xs={12}>
        {Icon &&
          <Icon className={`${classes.icon} ${animate && 'animate'}`} />
        }
      </Grid>
      <Grid item xs={12}>
        <Typography variant="display2" className={classes.title} data-qa-placeholder-title>
          {title}
        </Typography>
      </Grid>
      <Grid item xs={12} lg={10} className={classes.copy}>
        <Typography variant="body1">{copy}</Typography>
      </Grid>
      {buttonProps &&
        <Grid item xs={12} lg={10} className={classes.copy}>
          <Button
            variant="raised"
            color="primary"
            className={classes.button}
            {...buttonProps}
            data-qa-placeholder-button
          />
        </Grid>
      }
    </Grid >
  );
};

Placeholder.defaultProps = {
  icon: LinodeIcon,
  copy: 'The feature you are looking for is currently in development. Please check back soon.',
  title: 'Feature in Progress',
  animate: true,
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(Placeholder);
