import { compose } from 'ramda';
import * as React from 'react';

import ListItem from '@material-ui/core/ListItem';
import { StyleRulesCallback, Theme, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import OpenInNew from '@material-ui/icons/OpenInNew';

type ClassNames = 'root'
| 'label'
| 'source'
| 'icon'
| 'row';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
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

const searchItem: React.StatelessComponent = (props:any) => {
  const getLabel = () => {
    if (isFinal) { 
      return label ? `Search for "${label}"` : 'Search';
    } else { return label; }
  }

  const { classes, label } = props;
  const source = 'No source' // data ? data.source : '';
  const isFinal = false; // source === 'finalLink';

  return (
    <ListItem className={classes.root} component="div" {...props.innerProps}>
      <div className={classes.row}>
        <div className={classes.label} dangerouslySetInnerHTML={{__html: getLabel()}} />
        {!isFinal && <OpenInNew className={classes.icon} />}
      </div>
      {!isFinal && <Typography variant="caption" className={classes.source}>{source}</Typography>}
    </ListItem>
  );
}

const styled = withStyles(styles, { withTheme: true });

export default searchItem; compose<any, any>(
  styled,
  )(searchItem);
