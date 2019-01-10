import Hidden from '@material-ui/core/Hidden';
import MenuList from '@material-ui/core/MenuList';
import HelpOutline from '@material-ui/icons/HelpOutline';
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp';
import * as classNames from 'classnames';
import * as React from 'react';
import Button from 'src/components/core/Button';
import Menu from 'src/components/core/Menu';
import MenuItem from 'src/components/core/MenuItem';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import withBackupCTA, { BackupCTAProps } from 'src/containers/withBackupCTA.container';
import { BackupsCTA } from 'src/features/Backups';
import DocComponent, { Doc } from './DocComponent';

type ClassNames = 'root'
  | 'gridItem'
  | 'mobileContainer'
  | 'docsWrapper'
  | 'docsIconButton'
  | 'buttonLabel'
  | 'docsIconButtonExpanded'
  | 'docsIconButtonCTA'
  | 'withDocsCollapsed'
  | 'docsIcon'
  | 'mobileMenu'
  | 'menuPaper'
  | 'arrow'
  | 'arrowExpanded'
  | 'hidden';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  gridItem: {
    width: '100%',
  },
  mobileContainer: {
    position: 'relative',
    top: theme.spacing.unit,
    right: -theme.spacing.unit,
    [theme.breakpoints.down('md')]: {
      width: '100vw',
      top: 0,
      right: 0
    }
  },
  docsWrapper: {
    marginRight: theme.spacing.unit,
    padding: theme.spacing.unit * 2,
    transform: `translateY(-${theme.spacing.unit * 4}px)`,
    marginLeft: 41
  },
  docsIconButton: {
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
    backgroundColor: theme.color.white,
    transform: 'rotate(-90deg) translate(-66px, 32px)',
    '&:hover, &:focus': {
      backgroundColor: theme.color.white,
    },
    '&:hover': {
      '& $buttonLabel': {
        color: theme.palette.primary.main
      }
    },
    [theme.breakpoints.down('md')]: {
      boxShadow: `0 0 5px ${theme.color.boxShadow}`,
      transform: 'none',
      left: 0,
      right: 0
    }
  },
  docsIconButtonExpanded: {
    left: -91
  },
  docsIconButtonCTA: {
    position: 'absolute',
    right: 'calc(21.2% - 28px)',
    [theme.breakpoints.up('xl')]: {
      right: 'calc(21.2% - 40px)',
    },
  },
  buttonLabel: {
    color: theme.palette.text.primary,
  },
  docsIcon: {
    width: 20,
    height: 20,
    marginRight: theme.spacing.unit
  },
  arrow: {
    marginLeft: theme.spacing.unit,
    transition: theme.transitions.create('transform')
  },
  arrowExpanded: {
    transform: 'rotate(180deg)'
  },
  hidden: {
    height: 0,
    padding: 0,
  },
  menuPaper: {
    maxWidth: 380,
    position: 'absolute',
    padding: theme.spacing.unit * 2,
    paddingTop: theme.spacing.unit,
    boxShadow: `0 0 5px ${theme.color.boxShadow}`,
    marginTop: -30,
    overflow: 'auto'
  },
  mobileMenu: {
    maxHeight: 300,
  },
  withDocsCollapsed: {
    marginTop: -theme.spacing.unit * 3
  }
});

interface Props {
  docs: Doc[];
  isSticky?: boolean;
  toggleSidebar?: any;
  isExpanded?: boolean;
}

interface State {
  anchorEl?: HTMLElement;
}

type CombinedProps = Props & BackupCTAProps & WithStyles<ClassNames>;

const styled = withStyles(styles);

class DocsSidebar extends React.Component<CombinedProps, State>  {
  state = {
    anchorEl: undefined,
  };

  handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (this.state.anchorEl === undefined) {
      this.setState({
        anchorEl: event.currentTarget
      });
    }
    else {
      this.setState({
        anchorEl: undefined
      });
    }
  }

  handleClose = () => {
    this.setState({ anchorEl: undefined });
  }

  render() {
    const { backupsCTA, classes, docs, isExpanded, toggleSidebar } = this.props;
    const { anchorEl } = this.state;

    if (docs.length === 0) {
      return null;
    }

    return (
      <React.Fragment>
        <Hidden mdDown>
          <Grid container item className={classes.root}>
            <Grid item className={classes.gridItem}>
              <Button onClick={toggleSidebar} className={classNames({
                [classes.docsIconButton]: true,
                [classes.docsIconButtonExpanded]: isExpanded,
                [classes.docsIconButtonCTA]: !isExpanded && backupsCTA
              })}>
                <HelpOutline className={classes.docsIcon} />
                <Typography className={classes.buttonLabel}>View Help</Typography>
                <KeyboardArrowUp className={classNames({
                  [classes.arrow]: true,
                  [classes.arrowExpanded]: isExpanded
                })} />
              </Button>
              {isExpanded &&
                <Paper className={classes.docsWrapper}>
                  <Typography
                    role="header"
                    variant="h2"
                    data-qa-sidebar-title
                  >
                    Linode Docs
                  </Typography>
                  <MenuList>
                    {docs.map((doc, idx) => <DocComponent key={idx} {...doc} />)}
                  </MenuList>
                </Paper>
              }
            </Grid>
            {backupsCTA &&
              <Grid item className={classNames({
                [classes.gridItem]: true,
                [classes.withDocsCollapsed]: !isExpanded && backupsCTA
              })}>
                <BackupsCTA />
              </Grid>
            }
          </Grid>
        </Hidden>
        <Hidden lgUp>
          <Grid container item className={classes.root}>
            <Grid item className={classes.mobileContainer}>
              <Button onClick={this.handleClick} className={classNames({
                [classes.docsIconButton]: true,
              })}>
                <HelpOutline className={classes.docsIcon} />
                <Typography className={classes.buttonLabel}>View Help</Typography>
                <KeyboardArrowUp className={classNames({
                  [classes.arrow]: true,
                  [classes.arrowExpanded]: isExpanded
                })} />
              </Button>
              <Menu
                id="linode-docs"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={this.handleClose}
                getContentAnchorEl={undefined}
                PaperProps={{ square: true, className: classes.menuPaper }}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                className={classes.mobileMenu}
              >
                <MenuItem key="placeholder" aria-hidden className={classes.hidden} />
                {docs.map((doc, idx) => <DocComponent key={idx} {...doc} />)}
              </Menu>
            </Grid>
          </Grid>
        </Hidden>
      </React.Fragment>
    );
  }
}

export default withBackupCTA(styled(DocsSidebar));
