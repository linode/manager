import * as React from 'react';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import Button, { ButtonProps } from 'src/components/Button';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

type ClassNames = 'root' | 'title' | 'copy' | 'icon' | 'button';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  '@keyframes scaleIn': {
    from: {
      transform: 'translateX( -10px ) rotateY( -180deg )'
    },
    to: {
      transformOrigin: 'center center'
    }
  },
  '@keyframes fadeIn': {
    from: {
      opacity: 0
    },
    to: {
      opacity: 1
    }
  },
  root: {
    padding: `${theme.spacing.unit * 2}px 0`,
    [theme.breakpoints.up('md')]: {
      padding: `${theme.spacing.unit * 10}px 0`
    }
  },
  copy: {
    textAlign: 'center',
    maxWidth: '85%',
    marginTop: -theme.spacing.unit * 3,
    [theme.breakpoints.up('md')]: {
      maxWidth: 800
    }
  },
  icon: {
    '&.animate': {
      animation: 'scaleIn .5s ease-in-out'
    },
    width: '120px',
    height: '120px',
    [theme.breakpoints.up('md')]: {
      width: '150px',
      height: '150px'
    },
    '& .outerCircle': {
      fill: theme.color.absWhite,
      stroke: theme.bg.offWhite
    },
    '& .circle': {
      fill: theme.color.absWhite
    },
    '& .insidePath path': {
      opacity: 0,
      animation: 'fadeIn .2s ease-in-out forwards .3s',
      stroke: theme.palette.primary.main
    },
    '& .bucket.insidePath path': {
      fill: theme.palette.primary.main
    }
  },
  title: {
    textAlign: 'center'
  },
  button: {
    marginBottom: theme.spacing.unit * 4
  }
});

export interface Props {
  icon?: React.ComponentType<any>;
  animate?: boolean;
  copy?: string | React.ReactNode;
  title?: string;
  buttonProps?: ButtonProps;
  className?: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const Placeholder: React.StatelessComponent<CombinedProps> = props => {
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
        {Icon && <Icon className={`${classes.icon} ${animate && 'animate'}`} />}
      </Grid>
      <Grid item xs={12}>
        <Typography
          className={classes.title}
          data-qa-placeholder-title
          variant="h1"
        >
          {title}
        </Typography>
      </Grid>
      <Grid item xs={12} lg={10} className={classes.copy}>
        {typeof copy === 'string' ? (
          <Typography variant="subtitle1">{copy}</Typography>
        ) : (
          copy
        )}
      </Grid>
      {buttonProps && (
        <Grid item xs={12} lg={10}>
          <Button
            type="primary"
            className={classes.button}
            {...buttonProps}
            data-qa-placeholder-button
          />
        </Grid>
      )}
    </Grid>
  );
};

Placeholder.defaultProps = {
  icon: LinodeIcon,
  copy:
    'The feature you are looking for is currently in development. Please check back soon.',
  title: 'Feature in Progress',
  animate: true
};

const styled = withStyles(styles);

export default styled(Placeholder);
