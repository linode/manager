import MoreHoriz from '@material-ui/icons/MoreHoriz';
import * as classNames from 'classnames';
import * as React from 'react';
import Plus from 'src/assets/icons/plusSign.svg';
import IconButton from 'src/components/core/IconButton';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';
import Tag from 'src/components/Tag/Tag_CMR';
import AddTag from './AddTag';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
    overflow: 'hidden'
  },
  menuItem: {
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
  },
  addTag: {
    marginRight: theme.spacing(),
    cursor: 'pointer'
  },
  tagList: {
    overflow: 'scroll',
    whiteSpace: 'nowrap',
    position: 'relative',
    display: 'flex',
    flexWrap: 'nowrap'
  },
  displayAllOuter: {
    position: 'relative',
    '&:before': {
      content: '""',
      width: 50,
      height: '100%',
      position: 'absolute',
      left: -50,
      top: 0,
      background: 'linear-gradient(to right, transparent, #fff 100%)'
    }
  },
  button: {
    padding: 0
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
  const { addTag, tags, width } = props;
  const [hasOverflow, setOverflow] = React.useState<boolean>(false);
  const [addingTag, setAddingTag] = React.useState<boolean>(false);
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
    <TableCell className={classes.root}>
      <Grid container direction="row" alignItems="center" wrap="nowrap">
        {addingTag ? (
          <Grid item xs={12}>
            <AddTag
              tags={tags}
              onClose={() => setAddingTag(false)}
              addTag={addTag}
            />
          </Grid>
        ) : (
          <>
            <Grid
              item
              className={classNames({
                [classes.addTag]: true,
                [classes.menuItem]: true
              })}
              onClick={() => setAddingTag(true)}
            >
              <Plus />
            </Grid>
            <div
              ref={overflowRef}
              style={{ width: `${width - 100}px` }}
              className={classNames({
                [classes.tagList]: true
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

            {hasOverflow && (
              <Grid item className={classes.displayAllOuter}>
                <IconButton
                  onKeyPress={() => props.listAllTags(tags)}
                  onClick={() => props.listAllTags(tags)}
                  className={classes.button}
                  disableRipple
                  aria-label="Display all tags"
                >
                  <MoreHoriz />
                </IconButton>
              </Grid>
            )}
          </>
        )}
      </Grid>
    </TableCell>
  );
};

export default TagCell;
