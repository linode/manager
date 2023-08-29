import Close from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import { omit } from 'lodash';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { Chip, ChipProps } from 'src/components/Chip';
import { truncateEnd } from 'src/utilities/truncate';

type Variants = 'blue' | 'lightBlue';

export interface TagProps extends ChipProps {
  asSuggestion?: boolean;
  closeMenu?: any;
  colorVariant: Variants;
  component?: React.ElementType;
  label: string;
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

  const tagProps = omit(props, ['asSuggestion', 'closeMenu']);

  return (
    <StyledChip
      {...tagProps}
      deleteIcon={
        chipProps.onDelete ? (
          <StyledDeleteButton
            aria-label={`Delete Tag "${label}"`}
            data-qa-delete-tag
            title="Delete tag"
          >
            <Close />
          </StyledDeleteButton>
        ) : undefined
      }
      aria-label={`Search for Tag "${label}"`}
      className={className}
      clickable
      component="div"
      data-qa-tag={label}
      label={_label}
      onClick={handleClick}
      role="button"
    />
  );
};

const StyledChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'colorVariant',
})<TagProps>(({ theme, ...props }) => ({
  '& .MuiChip-label': {
    '&:hover': {
      borderBottomRightRadius: props.onDelete && 0,
      borderTopRightRadius: props.onDelete && 0,
    },
    borderRadius: 4,
    color: theme.name === 'light' ? '#3a3f46' : '#9caec9',
    maxWidth: 350,
    padding: '7px 10px',
  },
  // Targets first span (tag label)
  '& > span': {
    borderBottomRightRadius: 0,
    borderRadius: 3,
    borderTopRightRadius: 0,
    padding: '7px 10px',
  },
  '&:focus': {
    ['& .StyledDeleteButton']: {
      color: theme.color.tagIcon,
    },
    backgroundColor: theme.color.tagButton,
  },
  // Overrides MUI chip default styles so these appear as separate elements.
  '&:hover': {
    ['& .StyledDeleteButton']: {
      color: theme.color.tagIcon,
    },
    backgroundColor: theme.color.tagButton,
  },
  fontSize: '0.875rem',
  height: 30,
  padding: 0,
  ...(props.colorVariant === 'blue' && {
    '& > span': {
      color: 'white',
    },
    '&:hover, &:focus': {
      backgroundColor: theme.palette.primary.main,
    },
    backgroundColor: theme.palette.primary.main,
  }),
  ...(props.colorVariant === 'lightBlue' && {
    '& > span': {
      '&:focus': {
        backgroundColor: theme.color.tagButton,
        color: theme.color.black,
      },
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: 'white',
      },
    },
    backgroundColor: theme.color.tagButton,
  }),
}));

const StyledDeleteButton = styled('button', { label: 'StyledDeleteButton' })(
  ({ theme }) => ({
    ...theme.applyLinkStyles,
    '& svg': {
      borderRadius: 0,
      color: theme.color.tagIcon,
      height: 15,
      width: 15,
    },
    '&:focus': {
      backgroundColor: theme.bg.lightBlue1,
      color: theme.color.black,
    },
    '&:hover': {
      '& svg': {
        color: 'white',
      },
      backgroundColor: theme.palette.primary.main,
      color: 'white',
    },
    borderBottomRightRadius: 3,
    borderLeft: `1px solid ${theme.name === 'light' ? '#fff' : '#2e3238'}`,
    borderRadius: 0,
    borderTopRightRadius: 3,
    height: 30,
    margin: 0,
    minWidth: 30,
    padding: theme.spacing(),
  })
);
