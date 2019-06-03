import * as React from 'react';
import { compose } from 'recompose';
import Arrow from 'src/assets/icons/diagonalArrow.svg';
import ListItem from 'src/components/core/ListItem';
import { WithStyles } from '@material-ui/core/styles';
import {
  createStyles,
  Theme,
  withStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { Item } from 'src/components/EnhancedSelect';
import RenderGuard from 'src/components/RenderGuard';

type ClassNames = 'root' | 'label' | 'source' | 'icon' | 'row';

const styles = (theme: Theme) =>
  createStyles({
  root: {
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  label: {
    display: 'inline',
    color: theme.palette.text.primary,
    maxWidth: '95%'
  },
  icon: {
    display: 'inline-block',
    width: 12,
    height: 12,
    position: 'relative',
    top: 5,
    marginLeft: theme.spacing(1) / 2,
    color: theme.palette.primary.main
  },
  source: {
    marginTop: theme.spacing(1) / 2,
    color: theme.color.headline
  },
  row: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between'
  }
});

interface Props {
  item: Item;
  highlighted: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const searchItem: React.StatelessComponent<CombinedProps> = props => {
  const getLabel = () => {
    if (isFinal) {
      return item.label ? `Search for "${item.label}"` : 'Search';
    } else {
      return item.label;
    }
  };

  const { classes, item } = props;
  const source = item.data ? item.data.source : '';
  const isFinal = source === 'finalLink';

  return (
    <React.Fragment>
      <ListItem
        className={classes.root}
        component="div"
        data-qa-search-result={source}
      >
        <div className={classes.row}>
          <div
            className={classes.label}
            dangerouslySetInnerHTML={{ __html: getLabel() }}
          />
          {!isFinal && <Arrow className={classes.icon} />}
        </div>
        {!isFinal && (
          <Typography className={classes.source}>{source}</Typography>
        )}
      </ListItem>
    </React.Fragment>
  );
};

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  styled,
  RenderGuard
)(searchItem);
