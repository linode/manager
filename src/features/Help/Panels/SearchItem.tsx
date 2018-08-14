import { compose } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import OpenInNew from '@material-ui/icons/OpenInNew';

import { Item } from 'src/components/EnhancedSelect';
import Grid from 'src/components/Grid';
import MenuItem from 'src/components/MenuItem';
import RenderGuard from 'src/components/RenderGuard';

type ClassNames = 'root'
| 'label'
| 'source';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {

  },
  label: {

  },
  source: {
    fontSize: '0.7em',
    margin: '0px',
  }
});

interface Props {
  item: Item;
  index: number;
  highlighted: boolean;
}


type CombinedProps = Props & WithStyles<ClassNames>;

const SearchItem: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes, highlighted, item, index } = props;
  const source = item.data ? item.data.source : '';

  return (
    <MenuItem selected={highlighted} >
    <Grid container direction={"column"} key={index}>
      <Grid item className={classes.label}>
        <Grid container direction={"row"}>
          <Grid item>{item.label}</Grid>
          {source !== 'finalLink' && <Grid item><OpenInNew /></Grid>}
        </Grid>
      </Grid>
      {source !== 'finalLink' && <Grid item className={classes.source}>{source}</Grid>}
    </Grid>
    </MenuItem>
  );
}

const styled = withStyles(styles, { withTheme: true });

export default compose<any, any, any>(
  styled,
  RenderGuard
  )(SearchItem);
