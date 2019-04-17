import HelpOutline from '@material-ui/icons/HelpOutline';
import * as classNames from 'classnames';
import * as React from 'react';
import Hidden from 'src/components/core/Hidden';
import IconButton from 'src/components/core/IconButton';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import DocComponent, { Doc } from './DocComponent';

type ClassNames =
  | 'root'
  | 'gridItem'
  | 'title'
  | 'mobileActive'
  | 'toggleButton';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    [theme.breakpoints.up('md')]: {
      marginTop: theme.spacing.unit * 3
    },
    [theme.breakpoints.down('sm')]: {
      position: 'fixed !important',
      right: 0,
      width: '90%',
      bottom: 24,
      display: 'flex',
      flexWrap: 'nowrap',
      justifyContent: 'flex-end'
    }
  },
  title: {
    fontSize: '1.2rem'
  },
  gridItem: {
    [theme.breakpoints.down('sm')]: {
      position: 'relative',
      right: 56,
      backgroundColor: theme.bg.white,
      boxShadow: `0 0 5px ${theme.color.boxShadow}`,
      display: 'none',
      width: '100%'
    }
  },
  mobileActive: {
    display: 'block'
  },
  toggleButton: {
    position: 'absolute',
    bottom: 0,
    right: 10
  }
});

interface Props {
  docs: Doc[];
}

interface State {
  open: Boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const styled = withStyles(styles);

class DocsSidebar extends React.Component<CombinedProps, State> {
  state = {
    open: false
  };

  toggleHelp = () => {
    this.setState({
      open: !this.state.open
    });
  };

  render() {
    const { classes, docs } = this.props;
    const { open } = this.state;

    if (docs.length === 0) {
      return null;
    }

    return (
      <Grid
        container
        item
        className={classNames({
          [classes.root]: true
        })}
      >
        <Grid
          item
          className={classNames({
            [classes.gridItem]: true,
            [classes.mobileActive]: open
          })}
        >
          <Typography
            variant="h3"
            className={classes.title}
            data-qa-sidebar-title
          >
            Linode Docs
          </Typography>
          {docs.map((doc, idx) => (
            <DocComponent key={idx} {...doc} />
          ))}
        </Grid>
        <Hidden mdUp>
          <IconButton
            onClick={this.toggleHelp}
            className={classes.toggleButton}
          >
            <HelpOutline />
          </IconButton>
        </Hidden>
      </Grid>
    );
  }
}

export default styled(DocsSidebar);
