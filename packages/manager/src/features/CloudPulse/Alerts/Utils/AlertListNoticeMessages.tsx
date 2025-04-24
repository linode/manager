import { Notice, Typography } from '@linode/ui';
import React from 'react';

import type { NoticeProps } from '@linode/ui';

interface AlertListNoticeMessagesProps extends NoticeProps {
  /**
   * The error message to display, potentially containing multiple errors
   */
  errorMessage: string;
  /**
   * The separator used to split the error message into individual errors
   */
  separator?: string;
}

export const AlertListNoticeMessages = (
  props: AlertListNoticeMessagesProps
) => {
  const { errorMessage, separator, style, sx, variant } = props;
  const errorList = separator ? errorMessage.split(separator) : [errorMessage];

  if (errorList.length > 1) {
    return (
      <Notice data-alert-notice style={style} sx={sx} variant={variant}>
        {/* temporarily using `ul`, `li` tags instead of `List`, `ListItem` till we figure out the alignment issue with the icon and messages in the Notice */}
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {errorList.map((error, index) => (
            <li data-testid="alert_notice_message_list" key={index}>
              {error}
            </li>
          ))}
        </ul>
      </Notice>
    );
  }

  return (
    <Notice data-alert-notice style={style} sx={sx} variant={variant}>
      <Typography
        data-testid="alert_message_notice"
        sx={(theme) => ({
          fontFamily: theme.tokens.font.FontWeight.Extrabold,
        })}
      >
        {errorList[0]}
      </Typography>
    </Notice>
  );
};
