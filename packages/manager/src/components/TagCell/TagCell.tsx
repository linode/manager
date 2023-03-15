import MoreHoriz from '@mui/icons-material/MoreHoriz';
import classNames from 'classnames';
import * as React from 'react';
import Plus from 'src/assets/icons/plusSign.svg';
import IconButton from 'src/components/core/IconButton';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Grid from 'src/components/Grid';
import Tag from 'src/components/Tag';
import CircleProgress from '../CircleProgress';
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
    '& .MuiChip-root:last-child': {
      marginRight: 4,
    },
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
  addTagButton: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: 3,
    backgroundColor: theme.color.tagButton,
    border: 'none',
    color: theme.textColors.linkActiveLight,
    cursor: 'pointer',
    fontFamily: theme.font.normal,
    fontSize: 14,
    fontWeight: 'bold',
    height: 30,
    paddingLeft: 10,
    paddingRight: 10,
    whiteSpace: 'nowrap',
    '& svg': {
      color: theme.color.tagIcon,
      marginLeft: 10,
      height: 10,
      width: 10,
    },
  },
  progress: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: 2,
  },
  loading: {
    opacity: 0.4,
  },
}));

interface Props {
  tags: string[];
  updateTags: (tags: string[]) => Promise<any>;
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

export const TagCell: React.FC<Props> = (props) => {
  const classes = useStyles();

  const { updateTags, tags } = props;

  const [hasOverflow, setOverflow] = React.useState<boolean>(false);
  const [addingTag, setAddingTag] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const overflowRef = React.useCallback(
    (node) => {
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

  const handleAddTag = async (tag: string) => {
    await updateTags([...tags, tag]);
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setLoading(true);
    updateTags(tags.filter((tag) => tag !== tagToDelete)).finally(() =>
      setLoading(false)
    );
  };

  return (
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
      {loading ? (
        <div className={classes.progress}>
          <CircleProgress mini />
        </div>
      ) : null}
      {addingTag ? (
        <AddTag
          tags={tags}
          onClose={() => setAddingTag(false)}
          addTag={handleAddTag}
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
            {tags.map((thisTag) => (
              <Tag
                key={`tag-item-${thisTag}`}
                colorVariant="lightBlue"
                label={thisTag}
                className={classNames({ [classes.loading]: loading })}
                onDelete={() => handleDeleteTag(thisTag)}
              />
            ))}
          </div>

          {hasOverflow ? (
            <Grid item className="py0">
              <IconButton
                onKeyPress={() => props.listAllTags(tags)}
                onClick={() => props.listAllTags(tags)}
                className={classes.button}
                disableRipple
                aria-label="Display all tags"
                size="large"
              >
                <MoreHoriz />
              </IconButton>
            </Grid>
          ) : null}
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
