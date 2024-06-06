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
import { CircleProgress } from '../CircleProgress';
import { AddTag } from './AddTag';

export interface TagCellProps {
  /**
   * Disable adding or deleting tags.
   */
  disabled?: boolean;

  /**
   * An optional callback that is invoked when the tag list
   * overflows and the user clicks to view all tags.
   */
  listAllTags?: () => void;

  /**
   * Additional styles to apply to the tag list.
   */
  sx?: SxProps;

  /**
   * The list of tags to display.
   */
  tags: string[];

  /**
   * A callback that is invoked when the user updates
   * the tag list (i.e., by adding or deleting a tag).
   */
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
  const { disabled, listAllTags, sx, tags } = props;

  const [addingTag, setAddingTag] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [elRef, setElRef] = React.useState<HTMLDivElement | null>(null);

  const windowDimensions = useWindowDimensions();

  const [hasOverflow, setHasOverflow] = React.useState(false);
  React.useLayoutEffect(() => {
    setHasOverflow(!!elRef && checkOverflow(elRef));
  }, [windowDimensions, tags, elRef]);

  const handleUpdateTag = (updatedTags: string[]) => {
    setLoading(true);
    return props.updateTags(updatedTags).finally(() => {
      setLoading(false);
    });
  };

  const panelView = listAllTags == undefined;

  const AddButton = (props: { panel?: boolean }) => (
    <StyledTagButton
      buttonType="outlined"
      disabled={disabled}
      endIcon={<StyledPlusIcon disabled={disabled} />}
      onClick={() => setAddingTag(true)}
      panel={props.panel}
      title="Add a tag"
    >
      Add a tag
    </StyledTagButton>
  );

  return (
    <>
      {(addingTag || panelView) && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            height: 40,
            justifyContent: panelView ? 'flex-start' : 'flex-end',
            marginBottom: panelView ? 4 : 0,
            width: '100%',
          }}
        >
          {panelView && !addingTag && <AddButton panel />}
          {addingTag && (
            <AddTag
              addTag={(tag) => handleUpdateTag([...tags, tag])}
              existingTags={tags}
              onClose={() => setAddingTag(false)}
            />
          )}
        </div>
      )}
      {(!addingTag || panelView) && (
        <StyledGrid
          alignItems="center"
          container
          direction="row"
          sx={sx}
          wrap={panelView ? 'wrap' : 'nowrap'}
        >
          <StyledTagListDiv
            hasOverflow={hasOverflow && listAllTags != undefined}
            ref={setElRef}
            wrap={listAllTags == undefined}
          >
            {loading ? (
              <StyledCircleDiv>
                <CircleProgress size="sm" />
              </StyledCircleDiv>
            ) : null}
            {tags.map((thisTag) => (
              <StyledTag
                onDelete={
                  disabled
                    ? undefined
                    : () =>
                        handleUpdateTag(tags.filter((tag) => tag !== thisTag))
                }
                colorVariant="lightBlue"
                disabled={disabled}
                key={`tag-item-${thisTag}`}
                label={thisTag}
                loading={loading}
              />
            ))}
          </StyledTagListDiv>
          {hasOverflow && !panelView ? (
            <StyledIconButton
              aria-label="Display all tags"
              disableRipple
              onClick={() => listAllTags()}
              onKeyPress={() => listAllTags()}
              size="large"
            >
              <MoreHoriz />
            </StyledIconButton>
          ) : null}
          {!panelView && <AddButton />}
        </StyledGrid>
      )}
    </>
  );
};

const StyledGrid = styled(Grid)((props) => ({
  justifyContent: props.wrap == 'wrap' ? 'flex-start' : 'flex-end',
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
