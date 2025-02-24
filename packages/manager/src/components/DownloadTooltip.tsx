import { Tooltip, Typography } from '@linode/ui';
import { downloadFile } from '@linode/utilities';
import * as React from 'react';

import FileDownload from 'src/assets/icons/download.svg';
import { StyledIconButton } from 'src/components/CopyTooltip/CopyTooltip';

interface Props {
  /**
   * Optional styles to be applied to the underlying button
   */
  className?: string;
  /**
   * Optional text to show beside the download icon
   */
  displayText?: string;
  /**
   * The filename of the downloaded file. `.txt` is automatically appended.
   */
  fileName: string;
  /**
   * Optional callback function that is called when the download button is clicked
   */
  onClickCallback?: () => void;
  /**
   * The text to be downloaded.
   * It is also used in the `name` and `aria-label` of the underlying button.
   */
  text: string;
}

export const DownloadTooltip = (props: Props) => {
  const { className, displayText, fileName, onClickCallback, text } = props;

  const handleIconClick = () => {
    downloadFile(`${fileName}.txt`, text);
    if (onClickCallback) {
      onClickCallback();
    }
  };

  return (
    <Tooltip data-qa-copied placement="top" title="Download">
      <StyledIconButton
        aria-label={`Download ${text}`}
        className={className}
        name={text}
        onClick={handleIconClick}
        type="button"
      >
        <FileDownload />
        {displayText && <Typography>{displayText}</Typography>}
      </StyledIconButton>
    </Tooltip>
  );
};
