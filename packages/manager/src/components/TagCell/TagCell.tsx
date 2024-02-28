import MoreHoriz from '@mui/icons-material/MoreHoriz';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { SxProps } from '@mui/system';
import * as React from 'react';

import { IconButton } from 'src/components/IconButton';
import { Tag } from 'src/components/Tag/Tag';
import { useWindowDimensions } from 'src/hooks/useWindowDimensions';
import { omittedProps } from 'src/utilities/omittedProps';

import { StyledPlusIcon, StyledTagButton } from '../Button/StyledTagButton';
import { AddTag } from './AddTag';

interface TagCellProps {
  listAllTags: (tags: string[]) => void;
  sx?: SxProps;
  tags: string[];
  updateTags: (tags: string[]) => Promise<any>;
}

// https://stackoverflow.com/questions/143815/determine-if-an-html-elements-content-overflows
const checkOverflow = (el: HTMLElement) => {
  const curOverflow = el.style.overflow;

  if (!curOverflow || curOverflow === 'visible') {
    el.style.overflow = 'hidden';
  }

  const isOverflowing = el.clientWidth < el.scrollWidth;

  el.style.overflow = curOverflow;

  return isOverflowing;
};

export const TagCell = (props: TagCellProps) => {
  const { sx, tags, updateTags } = props;

  const [addingTag, setAddingTag] = React.useState<boolean>(false);
  const [deletingTags, setDeletingTags] = React.useState(
    () => new Set<string>()
  );
  const [elRef, setElRef] = React.useState<HTMLDivElement | null>(null);

  const windowDimensions = useWindowDimensions();

  const [hasOverflow, setHasOverflow] = React.useState(false);
  React.useLayoutEffect(() => {
    setHasOverflow(!!elRef && checkOverflow(elRef));
  }, [windowDimensions, tags, elRef]);

  const handleAddTag = async (tag: string) => {
    await updateTags([...tags, tag]);
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setDeletingTags(new Set(deletingTags.add(tagToDelete)));
    updateTags(tags.filter((tag) => tag !== tagToDelete)).finally(() => {
      deletingTags.delete(tagToDelete);
      setDeletingTags(new Set(deletingTags));
    });
  };

  return (
    <StyledGrid
      alignItems="center"
      container
      direction="row"
      sx={sx}
      wrap="nowrap"
    >
      {addingTag ? (
        <AddTag
          addTag={handleAddTag}
          existingTags={tags}
          onClose={() => setAddingTag(false)}
        />
      ) : (
        <>
          <StyledTagListDiv hasOverflow={hasOverflow} ref={setElRef}>
            {tags.map((thisTag) => (
              <StyledTag
                colorVariant="lightBlue"
                key={`tag-item-${thisTag}`}
                label={thisTag}
                loading={deletingTags.has(thisTag)}
                onDelete={() => handleDeleteTag(thisTag)}
              />
            ))}
          </StyledTagListDiv>
          {hasOverflow ? (
            <StyledIconButton
              aria-label="Display all tags"
              disableRipple
              onClick={() => props.listAllTags(tags)}
              onKeyPress={() => props.listAllTags(tags)}
              size="large"
            >
              <MoreHoriz />
            </StyledIconButton>
          ) : null}
          <StyledTagButton
            buttonType="outlined"
            endIcon={<StyledPlusIcon />}
            onClick={() => setAddingTag(true)}
            title="Add a tag"
          >
            Add a tag
          </StyledTagButton>
        </>
      )}
    </StyledGrid>
  );
};

const StyledGrid = styled(Grid)({
  justifyContent: 'flex-end',
  minHeight: 40,
  position: 'relative',
});

const StyledTagListDiv = styled('div', {
  shouldForwardProp: omittedProps(['hasOverflow']),
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
  shouldForwardProp: omittedProps(['loading']),
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
