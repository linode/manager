import { compose } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import OpenInNew from '@material-ui/icons/OpenInNew';

import { Item } from 'src/components/EnhancedSelect';
import Grid from 'src/components/Grid';
import RenderGuard from 'src/components/RenderGuard';

type ClassNames = 'root'
| 'label'
| 'source'
| 'icon'
| 'row';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
  },
  label: {
    fontSize: '1.2em',
  },
  source: {
    fontSize: '0.em',
    margin: '0px',
    paddingTop: '0px !important',
    paddingBottom: '0px !important',
  },
  icon: {
    fontSize: '0.8em',
  },
  row: {
    paddingTop: '0px !important',
    paddingBottom: '0px !important',
  }
});

interface Props {
  item: Item;
  highlighted: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const SearchItem: React.StatelessComponent<CombinedProps> = (props) => {
  const getLabel = () => {
    if (isFinal) { 
      return item.label ? `Search for "${item.label}"` : 'Search';
    } else { return item.label}
  }

  const { classes, item } = props;
  const source = item.data ? item.data.source : '';
  const isFinal = source === 'finalLink';

  return (
    <React.Fragment>
      <Grid container className={classes.root} direction={"column"}>
        <Grid item className={classes.label}>
          <Grid container className={classes.row} direction={"row"} alignItems={"center"} justify={"flex-start"}>
            <Grid item dangerouslySetInnerHTML={{__html: getLabel()}}/>
            {!isFinal && <Grid item><OpenInNew className={classes.icon} /></Grid>}
          </Grid>
        </Grid>
        {!isFinal && <Grid item className={classes.source}>{source}</Grid>}
      </Grid>
    </React.Fragment>
  );
}

const styled = withStyles(styles, { withTheme: true });

export default compose<any, any, any>(
  styled,
  RenderGuard
  )(SearchItem);
