import Hidden from '@material-ui/core/Hidden';
import MenuList from '@material-ui/core/MenuList';
import Description from '@material-ui/icons/Description';
import * as classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import Button from 'src/components/core/Button';
import IconButton from 'src/components/core/IconButton';
import Menu from 'src/components/core/Menu';
import MenuItem from 'src/components/core/MenuItem';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { BackupsCTA } from 'src/features/Backups';
import DocComponent, { Doc } from './DocComponent';

import Minimize from 'src/assets/icons/minimize.svg';

type ClassNames = 'root'
  | 'gridItem'
  | 'mobileContainer'
  | 'docsWrapper'
  | 'docsFrame'
  | 'docsHeader'
  | 'docsHeaderInitial'
  | 'toggleSidebarButton'
  | 'toggleSidebarButtonExpanded'
  | 'toggleSidebarButtonIcon'
  | 'docsIconButton'
  | 'docsIcon'
  | 'mobileMenu'
  | 'menuPaper'
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
    [theme.breakpoints.down('sm')]: {
      right: -theme.spacing.unit * 2
    }
  },
  docsWrapper: {
    marginRight: theme.spacing.unit,
    padding: theme.spacing.unit * 2
  },
  docsFrame: {
    marginTop: 0,
  },
  docsHeader: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `0 ${theme.spacing.unit * 2}px`
  },
  docsHeaderInitial: {
    justifyContent: 'flex-end',
    display: 'flex',
    paddingRight: '0 !important'
  },
  toggleSidebarButton: {
    padding: 0,
    backgroundColor: theme.color.white,
    borderBottom: `2px solid ${theme.palette.divider}`,
    justifyContent: 'flex-start',
    minWidth: 'auto',
    margin: `-2px -8px 0 0`,
    '&:hover, &:focus': {
      backgroundColor: theme.color.white,
    }
  },
  toggleSidebarButtonExpanded: {
    width: `calc(100% - ${theme.spacing.unit}px)`,
    padding: `${theme.spacing.unit / 2}px 0 !important`,
    borderRadius: 0,
    margin: 0,
  },
  toggleSidebarButtonIcon: {
    backgroundColor: theme.color.white,
    marginLeft: theme.spacing.unit * 2,
  },
  docsIconButton: {
    padding: 6,
    borderRadius: '50%',
    backgroundColor: theme.color.white,
    '&:hover': {
      backgroundColor: theme.color.white,
    }
  },
  docsIcon: {
    width: 20,
    height: 20,
  },
  hidden: {
    height: 0,
    padding: 0,
  },
  menuPaper: {
    maxWidth: 380,
    position: 'absolute',
    marginTop: theme.spacing.unit * 2,
    padding: theme.spacing.unit * 2,
    paddingTop: theme.spacing.unit,
    boxShadow: `0 0 5px ${theme.color.boxShadow}`,
  },
  mobileMenu: {
    maxHeight: 300,
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
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose = () => {
    this.setState({ anchorEl: undefined });
  }

  render() {
    const { backupsCTA, classes, docs, isExpanded, toggleSidebar } = this.props;
    const { anchorEl } = this.state

    if (docs.length === 0) {
      return null;
    }

    return (
      <React.Fragment>
        <Hidden mdDown>
          <Grid container item className={classes.root}>
            <Grid item className={classes.gridItem}>
              <Grid container className={classes.docsFrame} alignItems="center">
                <Grid item xs={12}
                  className={classNames({
                    [classes.docsHeaderInitial]: !isExpanded
                  })}>
                  {isExpanded
                  ?
                  <Button
                    type="secondary"
                    onClick={toggleSidebar}
                    className={classNames({
                      [classes.toggleSidebarButton]: true,
                      [classes.toggleSidebarButtonExpanded]: isExpanded
                    })}>
                    <div className={classes.docsHeader}>
                      <Typography
                        role="header"
                        variant="h2"
                        data-qa-sidebar-title
                      >
                        Help
                      </Typography>
                      <Minimize className={classes.toggleSidebarButtonIcon} />
                    </div>
                  </Button>
                  :
                  <Tooltip title="Linode Docs">
                    <IconButton onClick={toggleSidebar} className={classes.docsIconButton}>
                      <Description className={classes.docsIcon} />
                    </IconButton>
                  </Tooltip>
                  }
                </Grid>
              </Grid>
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
              <Grid item className={classes.gridItem}>
                <BackupsCTA />
              </Grid>
            }
          </Grid>
        </Hidden>
        <Hidden lgUp>
          <Grid container item className={classes.root}>
            <Grid item className={classes.mobileContainer}>
              <Tooltip title="Linode Docs">
                <IconButton onClick={this.handleClick} className={classes.docsIconButton}>
                  <Description className={classes.docsIcon} />
                </IconButton>
              </Tooltip>
              <Menu
                id="linode-docs"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={this.handleClose}
                getContentAnchorEl={undefined}
                PaperProps={{ square: true, className: classes.menuPaper }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
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

interface BackupCTAProps {
  backupsCTA: boolean;
}

const connected = connect((state: ApplicationState, ownProps) => ({
  backupsCTA: state.__resources.linodes.entities.filter(l => !l.backups.enabled).length > 0
}));

export default connected(styled(DocsSidebar));
