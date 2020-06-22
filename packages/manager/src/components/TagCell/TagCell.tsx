import * as classnames from 'classnames';
import * as React from 'react';
import Plus from 'src/assets/icons/plusSign.svg';
import MoreHoriz from '@material-ui/icons/MoreHoriz';

import { makeStyles, Theme } from 'src/components/core/styles';
import TableCell from 'src/components/TableCell';
import Tag from 'src/components/Tag/Tag_CMR';
import Grid from 'src/components/Grid'; // Have to use the MUI variant to get around ref issues

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    overflow: 'hidden',
    height: '40px',
    position: 'relative'
  },
  addTag: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '30px',
    height: '30px',
    marginRight: theme.spacing(),
    backgroundColor: theme.bg.lightBlue,
    '& svg': {
      color: theme.palette.primary.main
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      '& svg': {
        color: 'white'
      }
    }
  },
  tagList: {
    position: 'relative',
    height: '50px',
    width: '100%'
  },
  tagListOverflow: {
    '&:before': {
      content: '""',
      width: '100%',
      height: '100%',
      position: 'absolute',
      left: 0,
      top: 0,
      background: `linear-gradient(to right, transparent 300px, white)`
    }
  },
  menu: {
    position: 'absolute',
    right: 5,
    top: 5,
    width: '30px',
    height: '30px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.bg.lightBlue,
    '& svg': {
      color: theme.palette.primary.main
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      '& svg': {
        color: 'white'
      }
    }
  }
}));

interface Props {
  tags: string[];
  width: string; // Required so we can fade out after a certain point
  addTag: (newTag: string) => void;
}

// https://stackoverflow.com/questions/143815/determine-if-an-html-elements-content-overflows
const checkOverflow = (el: any) => {
  const curOverflow = el.style.overflow;

  if (!curOverflow || curOverflow === 'visible') {
    el.style.overflow = 'hidden';
  }

  console.table({ cw: el.clientWidth, sw: el.scrollWidth });

  const isOverflowing = el.clientWidth < el.scrollWidth;

  el.style.overflow = curOverflow;

  return isOverflowing;
};

export type CombinedProps = Props;

export const TagCell: React.FC<Props> = props => {
  const { tags, width } = props;
  const [hasOverflow, setOverflow] = React.useState<boolean>(false);
  const classes = useStyles();
  const overflowRef = React.useCallback(
    node => {
      if (node !== null) {
        setOverflow(checkOverflow(node));
      }
    },
    // The function doesn't care about tags directly,
    // but if the tags list changes we want to check to see if
    // the overflow state has changed.
    // eslint-disable-next-line
    [tags]
  );

  return (
    <TableCell className={classes.root} style={{ width }}>
      <div ref={overflowRef}>
        <Grid container direction="row" alignItems="center" wrap="nowrap">
          <Grid item className={classes.addTag}>
            <Plus />
          </Grid>
          <Grid container wrap="nowrap" direction="row">
            <Grid
              item
              className={classnames({
                [classes.tagList]: true,
                [classes.tagListOverflow]: hasOverflow
              })}
            >
              {tags.map(thisTag => (
                <Tag
                  key={`tag-item-${thisTag}`}
                  colorVariant="lightBlue"
                  label={thisTag}
                  onDelete={() => null}
                />
              ))}
            </Grid>
          </Grid>
        </Grid>
      </div>
      {hasOverflow && (
        <div className={classes.menu}>
          <MoreHoriz />
        </div>
      )}
    </TableCell>
  );
};

export default TagCell;
