import * as React from 'react';
import copy from 'copy-to-clipboard';
import FileCopy from 'src/assets/icons/copy.svg';
import ToolTip from 'src/components/core/Tooltip';
import { isPropValid } from 'src/utilities/isPropValid';
import { styled } from '@mui/material/styles';

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
   * Callback to be executed when the icon is clicked.
   */
  onClickCallback?: () => void;
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
  const { text, className, copyableText, onClickCallback } = props;

  const handleIconClick = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
    copy(text);
    if (onClickCallback) {
      onClickCallback();
    }
  };

  return (
    <ToolTip title={copied ? 'Copied!' : 'Copy'} placement="top" data-qa-copied>
      <StyledCopyTooltipButton
        aria-label={`Copy ${text} to clipboard`}
        name={text}
        type="button"
        onClick={handleIconClick}
        className={className}
        data-qa-copy-btn
        {...props}
      >
        {copyableText ? text : <FileCopy />}
      </StyledCopyTooltipButton>
    </ToolTip>
  );
};

const StyledCopyTooltipButton = styled('button', {
  label: 'StyledCopyTooltipButton',
  shouldForwardProp: (prop) => isPropValid(['copyableText', 'text'], prop),
})<Omit<CopyTooltipProps, 'text'>>(({ theme, ...props }) => ({
  position: 'relative',
  padding: 4,
  backgroundColor: 'transparent',
  transition: theme.transitions.create(['background-color']),
  borderRadius: 4,
  border: 'none',
  cursor: 'pointer',
  color: theme.color.grey1,
  '& svg': {
    transition: theme.transitions.create(['color']),
    color: theme.color.grey1,
    margin: 0,
    position: 'relative',
    width: 20,
    height: 20,
  },
  '& svg:hover': {
    color: theme.palette.primary.main,
  },
  ...(props.copyableText && {
    padding: 0,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    font: 'inherit',
    color: theme.palette.text.primary,
  }),
}));
