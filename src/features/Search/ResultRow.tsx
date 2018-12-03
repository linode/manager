import { pathOr } from 'ramda';
import * as React from 'react';
import { compose, withHandlers } from 'recompose';

import ListItem from 'src/components/core/ListItem';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import Tags from 'src/components/Tags';
import LinodeStatusIndicator from 'src/features/linodes/LinodesLanding/LinodeStatusIndicator';


import { iconMap } from './utils';

type ClassNames = 'root'
| 'description'
| 'label'
| 'icon'
| 'labelRow'
| 'resultBody'
| 'rowContent'
| 'status'
| 'tableCell'
| 'tag'
| 'link';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  transition: theme.transitions.create(['background-color']),
  root: {
    paddingTop: '0 !important',
    paddingBottom: '0 !important',
    width: '100%',
    cursor: 'pointer',
    '&:hover': {
      '& $rowContent': {
        background: theme.bg.tableHeader,
        '&:before': {
          backgroundColor: theme.palette.primary.main,
        }
      }
    },
  },
  description: {
  },
  label: {
    wordBreak: 'break-all',
  },
  icon: {
    position: 'relative',
    top: 1,
    width: 40,
    height: 40,
    marginLeft: 5,
    '& .circle': {
      fill: theme.bg.offWhiteDT,
    },
    '& .outerCircle': {
      stroke: theme.bg.main,
    },
  },
  labelRow: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
  },
  resultBody: {
    width: '100%',
  },
  rowContent: {
    position: 'relative',
    background: theme.bg.white,
    width: '100%',
    padding: 10,
    borderTop: `2px solid ${theme.palette.divider}`,
    transition: 'background-color 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    '&:before': {
      content: "''",
      position: 'absolute',
      top: 0,
      left: 0,
      width: '0.01%',
      height: '100%',
      backgroundColor: 'transparent',
      transition: theme.transitions.create(['background-color']),
      paddingLeft: 5,
    },
  },
  status: {
    marginLeft: theme.spacing.unit / 2,
  },
  tableCell: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 8px !important',
  },
  tag: {
    margin: theme.spacing.unit / 2,
  },
  link: {
    display: 'block',
  }
});

interface HandlerProps {
  handleClick: () => void;
}
interface Props {
  result: Item;
  redirect: (path: string) => void;
}

type CombinedProps = Props & HandlerProps & WithStyles<ClassNames>;

export const ResultRow: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, handleClick, result } = props;
  const icon = pathOr<string>('default', ['data','icon'], result);
  const Icon = iconMap[icon];
  return (
    <ListItem
      disableGutters
      component="li"
      className={classes.root}
      onClick={handleClick}
    >
      <Paper className={classes.rowContent}>
        <Grid container direction="row" alignItems="center" wrap="nowrap">
          <Grid item className={classes.tableCell}>
            <Icon className={classes.icon} />
          </Grid>
          <Grid item xs={12} className={classes.tableCell}>
            <Grid
              container
              direction="row"
              alignItems="center"
            >
              <Grid item className={classes.label}>
                <a href="javascript:;" onClick={handleClick} className={classes.link} title={result.label}>
                  <div className={classes.labelRow}>
                    <Typography variant="subheading">{result.label}</Typography>
                    <div className={classes.status} >
                      {result.data.status && <LinodeStatusIndicator status={result.data.status} />}
                    </div>
                  </div>
                  <Typography variant="body1">{result.data.description}</Typography>
                </a>
              </Grid>
              {result.data.region &&
                <Grid item>
                  {result.data.region}
                </Grid>
              }
              <Grid item>
                <Tags tags={result.data.tags} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </ListItem>
  );
};

const styled = withStyles(styles);

const handlers = withHandlers({
  handleClick: (props: Props) => () =>
    props.redirect(pathOr('/', ['result', 'data', 'path'], props))
});

// For testing handler methods
export const RowWithHandlers = handlers(ResultRow);

const enhanced = compose<CombinedProps, Props>(
  styled,
  handlers,
)(ResultRow);

export default enhanced;
