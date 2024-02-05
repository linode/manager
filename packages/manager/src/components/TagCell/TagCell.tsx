import MoreHoriz from '@mui/icons-material/MoreHoriz';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import * as React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { IconButton } from 'src/components/IconButton';
import { Tag } from 'src/components/Tag/Tag';
import { useMutationObserver } from 'src/hooks/useMutationObserver';
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

const TagCell = (props: TagCellProps) => {
  const { sx, tags, updateTags } = props;

  const [addingTag, setAddingTag] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [elRef, setElRef] = React.useState<HTMLDivElement | null>(null);

  // In production, a parent element sometimes is briefly
  // set to display: none, breaking overflow detection.
  // On mount, find the parent and listen for changes.
  const renderParent = React.useMemo(() => {
    let parent: HTMLElement | null = elRef;
    while (parent != null && parent.style.display != 'none') {
      parent = parent.parentElement;
    }
    return parent;
  }, [elRef]);

  const windowDimensions = useWindowDimensions();
  const lastMutations = useMutationObserver(renderParent, { attributes: true });

  // Dependencies are not used explicitly for overflow detection but
  // changes in these values may indicate the overflow state has changed.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const hasOverflow = React.useMemo(() => !!elRef && checkOverflow(elRef), [
    windowDimensions,
    lastMutations,
    tags,
    elRef,
  ]);

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
      alignItems="center"
      container
      direction="row"
      sx={sx}
      wrap="nowrap"
    >
      {loading ? (
        <StyledCircleDiv>
          <CircleProgress mini />
        </StyledCircleDiv>
      ) : null}
      {addingTag ? (
        <AddTag
          addTag={handleAddTag}
          inDetailsContext
          onClose={() => setAddingTag(false)}
          tags={tags}
        />
      ) : (
        <>
          <StyledTagListDiv hasOverflow={hasOverflow} ref={setElRef}>
            {tags.map((thisTag) => (
              <StyledTag
                colorVariant="lightBlue"
                key={`tag-item-${thisTag}`}
                label={thisTag}
                loading={loading}
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
