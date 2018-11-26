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
  root: {
    paddingTop: '0 !important',
    paddingBottom: '0 !important',
    width: '100%',
    cursor: 'pointer',
  },
  description: {
  },
  label: {
    fontSize: 17,
    color: theme.color.blueDTwhite
  },
  icon: {

  },
  resultBody: {
    width: '100%',
  },
  rowContent: {
    background: theme.bg.white,
    width: '100%',
    padding: theme.spacing.unit,
    borderBottom: '1px solid ' + `${theme.color.border3}`,
  },
  tableCell: {
    borderRight: '1px solid ' + `${theme.color.border3}`,
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
          <Grid item className={classes.tableCell} xs={"auto"}>
            <Icon className={classes.icon} />
          </Grid>
          <Grid item xs={11}>
            <Grid
              container
              direction="row"
              alignItems="center"
              justify="space-between"
            >
              <Grid item>
                <Grid container direction="column"  justify="space-around">
                  <Grid item className={`${classes.label} py0`}>{result.label}</Grid>
                  <Grid item className={`${classes.description} py0`}>
                    <Typography variant="caption">{result.data.description}</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                {result.data.tags.map((tag: string, idx: number) =>
                  <Tag key={idx} label={tag} colorVariant={"blue"} className={classes.tag} />
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

const enhanced = compose<CombinedProps, Props>(
  styled,
  withHandlers({
    handleClick: (props: Props) => () =>
      props.redirect(pathOr('/', ['result', 'data', 'path'], props))
  }),
)(ResultRow)

export default enhanced;
