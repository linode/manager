import * as classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { StickyProps } from 'react-sticky';
import Button from 'src/components/core/Button';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { BackupsCTA } from 'src/features/Backups';
import DocComponent, { Doc } from './DocComponent';

import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';

type ClassNames = 'root'
  | 'gridItem'
  | 'docsWrapper'
  | 'docsHeader'
  | 'docsHeaderInitial'
  | 'toggleSidebarButton'
  | 'toggleSidebarButtonExpanded'
  | 'toggleSidebarButtonIcon'
  | 'toggleSidebarButtonText';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    [theme.breakpoints.down('md')]: {
      position: 'relative !important',
      left: `${theme.spacing.unit}px !important`,
      width: '100%',
      paddingTop: theme.spacing.unit * 3,
    },
  },
  gridItem: {
    width: '100%',
  },
  docsWrapper: {
    marginRight: theme.spacing.unit,
    padding: theme.spacing.unit * 2
  },
  docsHeader: {
    marginTop: 0,
  },
  docsHeaderInitial: {
    justifyContent: 'flex-end',
    display: 'flex',
    marginRight: theme.spacing.unit,
  },
  toggleSidebarButton: {
    padding: `${theme.spacing.unit}px 0`,
    backgroundColor: theme.color.white,
    borderBottom: `2px solid ${theme.palette.divider}`,
    justifyContent: 'flex-start',
    '&:focus': {
      backgroundColor: theme.color.white,
    }
  },
  toggleSidebarButtonExpanded: {
    width: `calc(100% - ${theme.spacing.unit}px)`,
  },
  toggleSidebarButtonIcon: {
    marginLeft: theme.spacing.unit,
  },
  toggleSidebarButtonText: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit * 2,
  },
});

interface Props {
  docs: Doc[];
  isSticky?: boolean;
  toggleSidebar?: any;
  isExpanded?: boolean;
}

type CombinedProps = Props & BackupCTAProps & StickyProps & WithStyles<ClassNames>;

const styled = withStyles(styles);

const DocsSidebar: React.StatelessComponent<CombinedProps> = (props) =>  {
  const { backupsCTA, classes, docs, style, isSticky, isExpanded } = props;

  if (docs.length === 0) {
    return null;
  }

  let stickyStyles;
  if (isSticky) {
    stickyStyles = {
      ...style,
      paddingTop: 24,
    };
  }

  return (
    <Grid container item style={stickyStyles} className={classes.root}>
      <Grid item className={classes.gridItem}>
        <Grid container className={classes.docsHeader} alignItems="center">
          <Grid item xs={12}
            className={classNames({
              [classes.docsHeaderInitial]: !isExpanded
            })}>
            <Button
              type="secondary"
              onClick={props.toggleSidebar}
              className={classNames({
                [classes.toggleSidebarButton]: true,
                [classes.toggleSidebarButtonExpanded]: isExpanded
              })}>
              {isExpanded
                ?
                <KeyboardArrowRight className={classes.toggleSidebarButtonIcon} />
                :
                <KeyboardArrowLeft className={classes.toggleSidebarButtonIcon} />
              }
              <Typography
                role="header"
                variant="h2"
                data-qa-sidebar-title
                className={classes.toggleSidebarButtonText}
              >
                Help
              </Typography>
            </Button>
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
            {docs.map((doc, idx) => <DocComponent key={idx} {...doc} />)}
          </Paper>
        }
      </Grid>
      {backupsCTA &&
        <Grid item className={classes.gridItem}>
          <BackupsCTA />
        </Grid>
      }
    </Grid>
  );
}

interface BackupCTAProps {
  backupsCTA: boolean;
}

const connected = connect((state: ApplicationState, ownProps) => ({
  backupsCTA: state.__resources.linodes.entities.filter(l => !l.backups.enabled).length > 0
}));

export default connected(styled(DocsSidebar));
