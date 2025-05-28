import {
  CircleProgress,
  IconButton,
  omittedProps,
  StyledPlusIcon,
  StyledTagButton,
} from '@linode/ui';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Tag } from 'src/components/Tag/Tag';
import { useWindowDimensions } from 'src/hooks/useWindowDimensions';

import { AddTag } from './AddTag';
import { TagDrawer } from './TagDrawer';

import type { SxProps, Theme } from '@mui/material/styles';

export interface TagCellProps {
  /**
   * Disable adding or deleting tags.
   */
  disabled?: boolean;

  /**
   * An optional label to display in the overflow drawer header.
   */
  entityLabel?: string;

  /**
   * Additional styles to apply to the tag list.
   */
  sx?: SxProps<Theme>;

  /**
   * The list of tags to display.
   */
  tags: string[];

  /**
   * A callback that is invoked when the user updates
   * the tag list (i.e., by adding or deleting a tag).
   */
  updateTags: (tags: string[]) => Promise<any>;

  /**
   * Determines whether to allow tags to wrap in a panel or
   * to overflow inline into a drawer.
   */
  view: 'inline' | 'panel';
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
  const { disabled, sx, tags, updateTags, view } = props;

  const [addingTag, setAddingTag] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const [elRef, setElRef] = React.useState<HTMLDivElement | null>(null);

  const windowDimensions = useWindowDimensions();

  const [hasOverflow, setHasOverflow] = React.useState(false);
  React.useLayoutEffect(() => {
    setHasOverflow(!!elRef && tags.length > 0 && checkOverflow(elRef));
  }, [windowDimensions, tags, elRef]);

  const handleUpdateTag = (updatedTags: string[]) => {
    setLoading(true);
    return updateTags(updatedTags).finally(() => {
      setLoading(false);
    });
  };

  const AddButton = (props: { panel?: boolean }) => (
    <StyledTagButton
      buttonType="outlined"
      disabled={disabled}
      endIcon={<StyledPlusIcon disabled={disabled} />}
      onClick={() => setAddingTag(true)}
      panel={props.panel}
      title="Add a tag"
      tooltipText={`${
        disabled
          ? 'You must be an unrestricted User in order to add or modify tags on Linodes.'
          : ''
      }`}
    >
      Add a tag
    </StyledTagButton>
  );

  return (
    <>
      {(addingTag || view === 'panel') && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            height: 40,
            justifyContent: view === 'panel' ? 'flex-start' : 'flex-end',
            marginBottom: view === 'panel' ? 4 : 0,
            width: '100%',
          }}
        >
          {view === 'panel' && !addingTag && <AddButton panel />}
          {addingTag && (
            <AddTag
              addTag={(tag) => handleUpdateTag([...tags, tag])}
              existingTags={tags}
              onClose={() => setAddingTag(false)}
            />
          )}
        </div>
      )}
      {(!addingTag || view === 'panel') && (
        <StyledGrid
          alignItems="center"
          container
          direction="row"
          sx={sx}
          wrap={view === 'panel' ? 'wrap' : 'nowrap'}
        >
          <StyledTagListDiv
            hasOverflow={hasOverflow && view === 'inline'}
            ref={setElRef}
            wrap={view === 'panel'}
          >
            {loading ? (
              <StyledCircleDiv>
                <CircleProgress size="sm" />
              </StyledCircleDiv>
            ) : null}
            {tags.map((thisTag) => (
              <StyledTag
                colorVariant="lightBlue"
                disabled={disabled}
                key={`tag-item-${thisTag}`}
                label={thisTag}
                loading={loading}
                onDelete={
                  disabled
                    ? undefined
                    : () =>
                        handleUpdateTag(tags.filter((tag) => tag !== thisTag))
                }
              />
            ))}
          </StyledTagListDiv>
          {hasOverflow && view === 'inline' ? (
            <StyledIconButton
              aria-label="Display all tags"
              disableRipple
              onClick={() => setDrawerOpen(true)}
              onKeyDown={() => setDrawerOpen(true)}
              size="large"
            >
              <MoreHoriz />
            </StyledIconButton>
          ) : null}
          {view === 'inline' && <AddButton />}
        </StyledGrid>
      )}
      {view === 'inline' && (
        <TagDrawer
          {...props}
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
        />
      )}
    </>
  );
};

const StyledGrid = styled(Grid)((props) => ({
  justifyContent: props.wrap === 'wrap' ? 'flex-start' : 'flex-end',
  minHeight: 40,
  position: 'relative',
}));

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
  shouldForwardProp: omittedProps(['hasOverflow', 'wrap']),
})<{
  hasOverflow: boolean;
  wrap: boolean;
}>(({ ...props }) => ({
  '& .MuiChip-root:last-child': {
    marginRight: 4,
  },
  display: 'flex',
  flexWrap: props.wrap ? 'wrap' : 'nowrap',
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
    color: theme.tokens.color.Neutrals.White,
  },
  backgroundColor: theme.color.tagButtonBg,
  borderRadius: theme.tokens.alias.Radius.Default,
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
