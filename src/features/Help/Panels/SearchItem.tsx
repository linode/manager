import { compose } from 'ramda';
import * as React from 'react';

import ListItem from '@material-ui/core/ListItem';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import OpenInNew from '@material-ui/icons/OpenInNew';

import { Item } from 'src/components/EnhancedSelect';
import RenderGuard from 'src/components/RenderGuard';

type ClassNames = 'root'
| 'label'
| 'source'
| 'icon'
| 'row';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  label: {
    display: 'inline',
    color: theme.palette.text.primary,
    maxWidth: '95%',
  },
  icon: {
    display: 'inline-block',
    fontSize: '0.8em',
    position: 'relative',
    top: 5,
    marginLeft: theme.spacing.unit / 2,
    color: theme.palette.text.primary,
  },
  source: {
    marginTop: theme.spacing.unit / 2,
    fontWeight: 700,
  },
  row: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
  },
});

interface Props {
  item: Item;
  highlighted: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const searchItem: React.StatelessComponent<CombinedProps> = (props) => {
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
      <ListItem className={classes.root} component="div">
        <div className={classes.row}>
          <div className={classes.label} dangerouslySetInnerHTML={{__html: getLabel()}} />
          {!isFinal && <OpenInNew className={classes.icon} />}
        </div>
        {!isFinal && <Typography variant="caption" className={classes.source}>{source}</Typography>}
      </ListItem>
    </React.Fragment>
  );
}

const styled = withStyles(styles, { withTheme: true });

export default compose<any, any, any>(
  styled,
  RenderGuard
  )(searchItem);
