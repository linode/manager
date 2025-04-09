import { omittedProps, Tooltip, VisibilityTooltip } from '@linode/ui';
import { styled } from '@mui/material/styles';
import copy from 'copy-to-clipboard';
import * as React from 'react';

import FileCopy from 'src/assets/icons/copy.svg';
import { createMaskedText } from 'src/utilities/createMaskedText';

import type { MaskableTextLength } from '../MaskableText/MaskableText';
import type { TooltipProps } from '@linode/ui';

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
   * If true, the component is in controlled mode for text masking, meaning the parent component handles the visibility toggle.
   * @default false
   */
  isMaskingControlled?: boolean;
  /**
   * If true, the text will be masked with dots when displayed. It will still be copyable.
   * @default false
   */
  masked?: boolean;
  /**
   * Callback to be executed when the icon is clicked.
   */

  /**
   * Optionally specifies the length of the masked text to depending on data type (e.g. 'ipv4', 'ipv6', 'plaintext'); if not provided, will use a default length.
   */
  maskedTextLength?: MaskableTextLength | number;
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
  const {
    className,
    copyableText,
    disabled,
    isMaskingControlled,
    masked,
    maskedTextLength,
    onClickCallback,
    placement,
    text,
  } = props;

  const [copied, setCopied] = React.useState<boolean>(false);
  const [isTextMaskedInternally, setIsTextMaskedInternally] =
    React.useState(masked);

  // Use the parent component's state for text masking if in controlled mode; otherwise use the internal state.
  const isTextMasked = isMaskingControlled ? masked : isTextMaskedInternally;

  const displayText = isTextMasked
    ? createMaskedText(text, maskedTextLength)
    : text;

  const handleIconClick = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
    copy(text);
    if (onClickCallback) {
      onClickCallback();
    }
  };

  const CopyButton = (
    <StyledIconButton
      aria-label={`Copy ${text} to clipboard`}
      className={className}
      data-qa-copy-btn
      name={text}
      onClick={handleIconClick}
      type="button"
      {...props}
    >
      {copyableText ? displayText : <FileCopy />}
    </StyledIconButton>
  );

  if (disabled) {
    return CopyButton;
  }

  return (
    <>
      <Tooltip
        className="copy-tooltip"
        data-qa-copied
        disableInteractive
        placement={placement ?? 'top'}
        title={copied ? 'Copied!' : 'Copy'}
      >
        {CopyButton}
      </Tooltip>
      {masked && !isMaskingControlled && (
        <VisibilityTooltip
          handleClick={() => setIsTextMaskedInternally(!isTextMaskedInternally)}
          isVisible={!isTextMasked}
        />
      )}
    </>
  );
};

export const StyledIconButton = styled('button', {
  label: 'StyledIconButton',
  shouldForwardProp: omittedProps([
    'copyableText',
    'text',
    'onClickCallback',
    'masked',
    'maskedTextLength',
    'isMaskingControlled',
  ]),
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
