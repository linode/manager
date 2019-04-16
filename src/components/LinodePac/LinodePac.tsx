import * as React from 'react';
import scriptLoader from 'react-async-script-loader';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

import './LinodePac.css';

type ClassNames = 'root' | 'subtitle';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing.unit * 3
  },
  subtitle: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 3,
    fontSize: '1.1rem'
  }
});

class LinodePac extends React.Component<WithStyles> {
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Typography variant="h1">Oops... 404</Typography>
        <Typography className={classes.subtitle}>
          Wanna play some Tuxman to recover from this terrible experience?
        </Typography>
        <div id="linodepac" />
      </div>
    );
  }
}

const styled = withStyles(styles);

export default styled(
  scriptLoader([
    '/js/Animation.js',
    '/js/Ghost.js',
    '/js/KeyButton.js',
    '/js/keycodes.js',
    '/js/Level.js',
    '/js/Pip.js',
    '/js/Player.js',
    '/js/init.js'
  ])(LinodePac)
);
