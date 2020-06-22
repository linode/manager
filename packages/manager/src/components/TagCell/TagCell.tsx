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
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexWrap: 'nowrap'
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
  width: number; // Required so we can fade out after a certain point
  addTag: (newTag: string) => void;
  deleteTag: (tagToDelete: string) => void;
  listAllTags: (tags: string[]) => void;
}

// https://stackoverflow.com/questions/143815/determine-if-an-html-elements-content-overflows
const checkOverflow = (el: any) => {
  const curOverflow = el.style.overflow;

  if (!curOverflow || curOverflow === 'visible') {
    el.style.overflow = 'hidden';
  }

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
    <TableCell className={classes.root} style={{ width: `${width}px` }}>
      <Grid container direction="row" alignItems="center" wrap="nowrap">
        <Grid item className={classes.addTag}>
          <Plus />
        </Grid>
        <Grid item>
          <div
            ref={overflowRef}
            style={{ width: `${width - 100}px` }}
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
                onDelete={() => props.deleteTag(thisTag)}
              />
            ))}
          </div>
        </Grid>
        {hasOverflow && (
          <Grid item>
            <div
              className={classes.menu}
              role="button"
              tabIndex={0}
              onKeyPress={() => props.listAllTags(tags)}
              onClick={() => props.listAllTags(tags)}
            >
              <MoreHoriz />
            </div>
          </Grid>
        )}
      </Grid>
    </TableCell>
  );
};

export default TagCell;
