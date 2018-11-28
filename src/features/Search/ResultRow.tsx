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
| 'tag'
| 'link';

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
    '&:hover': {
      // uncomment the below after https://github.com/linode/manager/pull/4124 is merged
      // ...theme.animateCircleIcon,
      '& $rowContent': {
        background: theme.bg.tableHeader,
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
    transition: 'background-color 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
  },
  tableCell: {
    display: 'flex',
    alignItems: 'center',
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
            <Grid item xs={12}>
              <Grid
                container
                direction="row"
                alignItems="center"
                justify="space-between"
              >
                <Grid item className={classes.label}>
                  <a href="javascript:;" onClick={handleClick} className={classes.link} title={result.label}>
                    <Typography variant="subheading">{result.label}</Typography>
                    <Typography variant="body1">{result.data.description}</Typography>
                  </a>
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
