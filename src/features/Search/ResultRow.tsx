import { pathOr } from 'ramda';
import * as React from 'react';
import { compose, withHandlers } from 'recompose';

import ListItem from 'src/components/core/ListItem';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import Tag from 'src/components/Tag';

import { iconMap } from './utils';

type ClassNames = 'root'
| 'description'
| 'label'
| 'icon'
| 'resultBody'
| 'rowContent'
| 'tableCell'
| 'tag';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  '@keyframes dash': {
    to: {
      'stroke-dashoffset': 0,
    },
  },
  root: {
    paddingTop: '0 !important',
    paddingBottom: '0 !important',
    width: '100%',
    cursor: 'pointer',
    '&:focus': {
      outline: '1px dotted #999',
    },  
    '&:hover': {
      // uncomment the below after https://github.com/linode/manager/pull/4124 is merged
      // ...theme.animateCircleIcon,
    },
  },
  description: {
  },
  label: {
    wordBreak: 'break-all',
  },
  icon: {
    width: 40,
    height: 40,
    '& .circle': {
      fill: theme.bg.offWhiteDT,
    },
    '& .outerCircle': {
      stroke: theme.bg.main,
    },
  },
  resultBody: {
    width: '100%',
  },
  rowContent: {
    background: theme.bg.white,
    width: '100%',
    padding: 10,
    borderTop: `2px solid ${theme.palette.divider}`,
  },
  tableCell: {
  },
  tag: {
    margin: theme.spacing.unit / 2,
  },
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
          <Grid item xs={12}>
            <Grid
              container
              direction="row"
              alignItems="center"
              justify="space-between"
            >
              <Grid item>
                <Grid container direction="column"  justify="space-around">
                  <Grid item className={`${classes.label} py0`}>
                    <Typography variant="subheading">{result.label}</Typography>
                  </Grid>
                  <Grid item className={`${classes.description} py0`}>
                    <Typography variant="body1">{result.data.description}</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                {result.data.tags.map((tag: string, idx: number) =>
                  <Tag key={idx} label={tag} colorVariant={"blue"} className={classes.tag} data-qa-tag-item />
                )}
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
