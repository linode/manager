import { CloseIcon } from '@linode/ui';
import { truncateEnd } from '@linode/utilities';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { StyledChip, StyledDeleteButton } from './Tag.styles';

import type { ChipProps } from '@linode/ui';

type Variants = 'blue' | 'lightBlue';

export interface TagProps extends ChipProps {
  /**
   * Callback fired when the delete icon is clicked.
   */
  closeMenu?: any;
  /**
   * The variant to use.
   */
  colorVariant: Variants;
  /**
   * The component used for the root node. Either a string representation of an HTML element or a component.
   */
  component?: React.ElementType;
  /**
   * The content of the label.
   */
  label: string;
  /**
   * The maximum length of the tag label. If the label exceeds this length, it will be truncated.
   * Must be greater than 4.
   */
  maxLength?: number;
}

/**
 * This component is an abstraction of the Chip component.
 * It is used to display deletable tags in the Linode Manager.
 * It contains two elements:
 * - a label, linking to its corresponding tag search result page
 * - an optional delete icon
 */
export const Tag = (props: TagProps) => {
  const {
    className,
    closeMenu,
    component = 'div',
    label,
    maxLength,
    ...chipProps
  } = props;

  const history = useHistory();

  const handleClick = (e: React.MouseEvent<any>) => {
    e.preventDefault();
    e.stopPropagation();
    if (closeMenu) {
      closeMenu();
    }
    history.push(`/search?query=tag:${label}`);
  };

  // If maxLength is set, truncate display to that length.
  const _label = maxLength ? truncateEnd(label, maxLength) : label;

  return (
    <StyledChip
      {...props}
      aria-label={`Search for Tag '${label}'`}
      className={className}
      clickable
      component={component}
      data-qa-tag={label}
      deleteIcon={
        chipProps.onDelete ? (
          <StyledDeleteButton
            aria-label={`Delete Tag '${label}'`}
            data-qa-delete-tag
            title="Delete tag"
          >
            <CloseIcon />
          </StyledDeleteButton>
        ) : undefined
      }
      label={_label}
      onClick={handleClick}
      role="button"
    />
  );
};
