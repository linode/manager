import Close from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Chip, { ChipProps } from 'src/components/core/Chip';
import { truncateEnd } from 'src/utilities/truncate';

type Variants = 'blue' | 'lightBlue';

export interface TagProps extends ChipProps {
  label: string;
  colorVariant: Variants;
  asSuggestion?: boolean;
  closeMenu?: any;
  component?: string;
  maxLength?: number;
}

export const Tag = (props: TagProps) => {
  const { className, label, maxLength, ...chipProps } = props;

  const history = useHistory();

  const handleClick = (e: React.MouseEvent<any>) => {
    e.preventDefault();
    e.stopPropagation();
    if (props.asSuggestion) {
      props.closeMenu();
    }
    history.push(`/search/?query=tag:${label}`);
  };

  // If maxLength is set, truncate display to that length.
  const _label = maxLength ? truncateEnd(label, maxLength) : label;

  return (
    <StyledChip
      {...props}
      label={_label}
      className={className}
      deleteIcon={
        chipProps.onDelete ? (
          <StyledDeleteButton
            data-qa-delete-tag
            title="Delete tag"
            aria-label={`Delete Tag "${label}"`}
          >
            <Close />
          </StyledDeleteButton>
        ) : undefined
      }
      onClick={handleClick}
      data-qa-tag={label}
      component="div"
      clickable
      role="button"
      aria-label={`Search for Tag "${label}"`}
    />
  );
};

const StyledChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'colorVariant',
})<TagProps>(({ theme, ...props }) => ({
  height: 30,
  fontSize: '0.875rem',
  padding: 0,
  '& .MuiChip-label': {
    borderBottomLeftRadius: '4px',
    borderRight: `1px solid ${theme.name === 'light' ? '#fff' : '#2e3238'}`,
    borderTopLeftRadius: '4px',
    color: theme.name === 'light' ? '#3a3f46' : '#9caec9',
    maxWidth: 350,
    padding: '7px 10px',
  },
  // Overrides MUI chip default styles so these appear as separate elements.
  '&:hover': {
    backgroundColor: theme.color.tagButton,
    ['& .StyledDeleteButton']: {
      color: theme.color.tagIcon,
    },
  },
  '&:focus': {
    backgroundColor: theme.color.tagButton,
    ['& .StyledDeleteButton']: {
      color: theme.color.tagIcon,
    },
  },
  // Targets first span (tag label)
  '& > span': {
    borderRadius: 3,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    padding: '7px 10px',
  },
  ...(props.colorVariant === 'blue' && {
    backgroundColor: theme.palette.primary.main,
    '& > span': {
      color: 'white',
    },
    '&:hover, &:focus': {
      backgroundColor: theme.palette.primary.main,
    },
  }),
  ...(props.colorVariant === 'lightBlue' && {
    backgroundColor: theme.color.tagButton,
    '& > span': {
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: 'white',
      },
      '&:focus': {
        backgroundColor: theme.color.tagButton,
        color: theme.color.black,
      },
    },
  }),
}));

const StyledDeleteButton = styled('button', { label: 'StyledDeleteButton' })(
  ({ theme }) => ({
    ...theme.applyLinkStyles,
    borderRadius: 0,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    height: 30,
    margin: 0,
    minWidth: 30,
    padding: theme.spacing(),
    '& svg': {
      borderRadius: 0,
      color: theme.color.tagIcon,
      height: 15,
      width: 15,
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      '& svg': {
        color: 'white',
      },
    },
    '&:focus': {
      backgroundColor: theme.bg.lightBlue1,
      color: theme.color.black,
    },
  })
);
