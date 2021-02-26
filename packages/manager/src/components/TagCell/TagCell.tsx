import MoreHoriz from '@material-ui/icons/MoreHoriz';
import * as classNames from 'classnames';
import * as React from 'react';
import Plus from 'src/assets/icons/plusSign.svg';
import IconButton from 'src/components/core/IconButton';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import Tag from 'src/components/Tag/Tag_CMR';
import AddTag from './AddTag';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    minHeight: 40,
    position: 'relative',
  },
  rootDetails: {
    justifyContent: 'flex-end',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.tagButton,
    width: '30px',
    height: '30px',
    '& svg': {
      color: theme.color.tagIcon,
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      '& svg': {
        color: 'white',
      },
    },
  },
  addTag: {
    cursor: 'pointer',
    marginRight: theme.spacing(),
  },
  tagList: {
    display: 'flex',
    flexWrap: 'nowrap',
    overflow: 'hidden',
    position: 'relative',
    whiteSpace: 'nowrap',
  },
  tagListOverflow: {
    maskImage: `linear-gradient(to right, rgba(0, 0, 0, 1.0) 75%, transparent)`,
  },
  button: {
    backgroundColor: theme.color.tagButton,
    borderRadius: 0,
    color: theme.color.tagIcon,
    height: 30,
    marginLeft: theme.spacing(),
    padding: 0,
    width: '40px',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: '#ffff',
    },
  },
  tagInput: {
    overflow: 'visible !important',
  },
  addTagButton: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: 3,
    backgroundColor: theme.color.tagButton,
    border: 'none',
    color: theme.cmrTextColors.linkActiveLight,
    cursor: 'pointer',
    fontFamily: theme.font.normal,
    fontSize: 14,
    fontWeight: 'bold',
    padding: '7px 10px',
    whiteSpace: 'nowrap',
    '& svg': {
      color: theme.color.tagIcon,
      marginLeft: 10,
      height: 10,
      width: 10,
    },
  },
}));

interface Props {
  className?: string;
  breakpoint?: number;
  tags: string[];
  width: number; // Required so we can fade out after a certain point
  addTag: (newTag: string) => void;
  deleteTag: (tagToDelete: string) => void;
  listAllTags: (tags: string[]) => void;
  inTableContext?: boolean;
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
  const classes = useStyles();

  const { addTag, className, tags, width, inTableContext } = props;

  const [hasOverflow, setOverflow] = React.useState<boolean>(false);
  const [addingTag, setAddingTag] = React.useState<boolean>(false);
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

  return inTableContext ? (
    <TableCell
      className={`${classes.root} ${className}`}
      style={{
        overflow: addingTag ? 'visible' : 'hidden',
        minWidth: width,
      }}
    >
      <Grid container direction="row" alignItems="center" wrap="nowrap">
        {addingTag ? (
          <AddTag
            tags={tags}
            onClose={() => setAddingTag(false)}
            addTag={addTag}
            fixedMenu
          />
        ) : (
          <>
            <Grid
              item
              className={classNames({
                [classes.addTag]: true,
                [classes.menuItem]: true,
              })}
              onClick={() => setAddingTag(true)}
            >
              <Plus />
            </Grid>
            <div
              ref={overflowRef}
              style={{ width: `${width - 100}px` }}
              className={classNames({
                [classes.tagList]: true,
                [classes.tagListOverflow]: hasOverflow,
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
              <IconButton
                onKeyPress={() => props.listAllTags(tags)}
                onClick={() => props.listAllTags(tags)}
                className={classes.button}
                disableRipple
                aria-label="Display all tags"
              >
                <MoreHoriz />
              </IconButton>
            )}
          </>
        )}
      </Grid>
    </TableCell>
  ) : (
    <Grid
      className={classNames({
        [classes.root]: true,
        [classes.rootDetails]: true,
      })}
      container
      direction="row"
      alignItems="center"
      wrap="nowrap"
    >
      {addingTag ? (
        <AddTag
          tags={tags}
          onClose={() => setAddingTag(false)}
          addTag={addTag}
          inDetailsContext
        />
      ) : (
        <>
          <div
            ref={overflowRef}
            className={classNames({
              [classes.tagList]: true,
              [classes.tagListOverflow]: hasOverflow,
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
            <Grid item className="py0">
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
          <button
            className={classes.addTagButton}
            title="Add a tag"
            onClick={() => setAddingTag(true)}
          >
            Add a tag
            <Plus />
          </button>
        </>
      )}
    </Grid>
  );
};

export default TagCell;
