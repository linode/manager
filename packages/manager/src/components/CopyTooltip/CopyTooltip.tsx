import { styled } from '@mui/material/styles';
import copy from 'copy-to-clipboard';
import * as React from 'react';

import FileCopy from 'src/assets/icons/copy.svg';
import { Tooltip, TooltipProps } from 'src/components/Tooltip';
import { omittedProps } from 'src/utilities/omittedProps';

export interface CopyTooltipProps {
  /**
   * Additional classes to be applied to the root element.
   */
  className?: string;
  /**
   * If true, the text will be displayed in the tooltip.
   * @default false
   */
  copyableText?: boolean;
  /**
   * If true, the copy button will be disabled and there will be no tooltip.
   * @default false
   */
  disabled?: boolean;
  /**
   * Callback to be executed when the icon is clicked.
   */
  onClickCallback?: () => void;
  /**
   * The placement of the tooltip.
   */
  placement?: TooltipProps['placement'];
  /**
   * The text to be copied to the clipboard.
   */
  text: string;
}

/**
 *
 * Content that is to be copied should be displayed before (to the left of) the clipboard icon.<br />
 * If horizontal space is limited, truncate the content.
 */

export const CopyTooltip = (props: CopyTooltipProps) => {
  const [copied, setCopied] = React.useState<boolean>(false);
  const {
    className,
    copyableText,
    disabled,
    onClickCallback,
    placement,
    text,
  } = props;

  const handleIconClick = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
    copy(text);
    if (onClickCallback) {
      onClickCallback();
    }
  };

  const CopyButton = (
    <StyledCopyButton
      aria-label={`Copy ${text} to clipboard`}
      className={className}
      data-qa-copy-btn
      name={text}
      onClick={handleIconClick}
      type="button"
      {...props}
    >
      {copyableText ? text : <FileCopy />}
    </StyledCopyButton>
  );

  if (disabled) {
    return CopyButton;
  }

  return (
    <Tooltip
      className="copy-tooltip"
      data-qa-copied
      placement={placement ?? 'top'}
      title={copied ? 'Copied!' : 'Copy'}
    >
      {CopyButton}
    </Tooltip>
  );
};

const StyledCopyButton = styled('button', {
  label: 'StyledCopyButton',
  shouldForwardProp: omittedProps(['copyableText', 'text']),
})<Omit<CopyTooltipProps, 'text'>>(({ theme, ...props }) => ({
  '& svg': {
    color: theme.color.grey1,
    height: 20,
    margin: 0,
    position: 'relative',
    transition: theme.transitions.create(['color']),
    width: 20,
  },
  '& svg:hover': {
    color: theme.palette.primary.main,
  },
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: 4,
  color: theme.color.grey1,
  cursor: 'pointer',
  padding: 4,
  position: 'relative',
  transition: theme.transitions.create(['background-color']),
  ...(props.copyableText && {
    backgroundColor: 'transparent',
    border: 'none',
    color: theme.palette.text.primary,
    cursor: 'pointer',
    font: 'inherit',
    padding: 0,
  }),
  ...(props.disabled && {
    color:
      theme.palette.mode === 'dark'
        ? theme.color.grey6
        : theme.color.disabledText,
    cursor: 'default',
  }),
}));
