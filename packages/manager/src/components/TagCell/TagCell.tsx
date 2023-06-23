import MoreHoriz from '@mui/icons-material/MoreHoriz';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import * as React from 'react';
import Plus from 'src/assets/icons/plusSign.svg';
import { CircleProgress } from 'src/components/CircleProgress';
import { IconButton } from 'src/components/IconButton';
import { Tag } from 'src/components/Tag/Tag';
import { isPropValid } from 'src/utilities/isPropValid';
import { AddTag } from './AddTag';

interface TagCellProps {
  tags: string[];
  updateTags: (tags: string[]) => Promise<any>;
  listAllTags: (tags: string[]) => void;
  sx?: SxProps;
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

const TagCell = (props: TagCellProps) => {
  const { sx, tags, updateTags } = props;

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
    <StyledGrid
      container
      direction="row"
      alignItems="center"
      wrap="nowrap"
      sx={sx}
    >
      {loading ? (
        <StyledCircleDiv>
          <CircleProgress mini />
        </StyledCircleDiv>
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
          <StyledTagListDiv ref={overflowRef} hasOverflow={hasOverflow}>
            {tags.map((thisTag) => (
              <StyledTag
                key={`tag-item-${thisTag}`}
                colorVariant="lightBlue"
                label={thisTag}
                onDelete={() => handleDeleteTag(thisTag)}
                loading={loading}
              />
            ))}
          </StyledTagListDiv>
          {hasOverflow ? (
            <StyledIconButton
              onKeyPress={() => props.listAllTags(tags)}
              onClick={() => props.listAllTags(tags)}
              disableRipple
              aria-label="Display all tags"
              size="large"
            >
              <MoreHoriz />
            </StyledIconButton>
          ) : null}
          <StyledAddTagButton
            title="Add a tag"
            onClick={() => setAddingTag(true)}
          >
            Add a tag
            <Plus />
          </StyledAddTagButton>
        </>
      )}
    </StyledGrid>
  );
};

export { TagCell };

const StyledGrid = styled(Grid)({
  justifyContent: 'flex-end',
  minHeight: 40,
  position: 'relative',
});

const StyledCircleDiv = styled('div')({
  alignItems: 'center',
  display: 'flex',
  height: '100%',
  justifyContent: 'center',
  position: 'absolute',
  width: '100%',
  zIndex: 2,
});

const StyledTagListDiv = styled('div', {
  shouldForwardProp: (prop) => isPropValid(['hasOverflow'], prop),
})<{
  hasOverflow: boolean;
}>(({ ...props }) => ({
  '& .MuiChip-root:last-child': {
    marginRight: 4,
  },
  display: 'flex',
  flexWrap: 'nowrap',
  overflow: 'hidden',
  position: 'relative',
  whiteSpace: 'nowrap',
  ...(props.hasOverflow && {
    maskImage: `linear-gradient(to right, rgba(0, 0, 0, 1.0) 75%, transparent)`,
  }),
}));

const StyledTag = styled(Tag, {
  shouldForwardProp: (prop) => isPropValid(['loading'], prop),
})<{
  loading: boolean;
}>(({ ...props }) => ({
  ...(props.loading && {
    opacity: 0.4,
  }),
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: '#ffff',
  },
  backgroundColor: theme.color.tagButton,
  borderRadius: 0,
  color: theme.color.tagIcon,
  height: 30,
  marginLeft: theme.spacing(0.5),
  marginRight: theme.spacing(0.5),
  padding: 0,
  [theme.breakpoints.down('lg')]: {
    marginLeft: 0,
  },
  width: '40px',
}));

const StyledAddTagButton = styled('button')(({ theme }) => ({
  '& svg': {
    color: theme.color.tagIcon,
    height: 10,
    marginLeft: 10,
    width: 10,
  },
  alignItems: 'center',
  backgroundColor: theme.color.tagButton,
  border: 'none',
  borderRadius: 3,
  color: theme.textColors.linkActiveLight,
  cursor: 'pointer',
  display: 'flex',
  fontFamily: theme.font.normal,
  fontSize: 14,
  fontWeight: 'bold',
  height: 30,
  paddingLeft: 10,
  paddingRight: 10,
  whiteSpace: 'nowrap',
}));
