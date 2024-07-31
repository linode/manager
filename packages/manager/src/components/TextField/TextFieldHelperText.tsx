import * as React from 'react';

import { Box } from 'src/components/Box';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';

import type { BoxProps } from 'src/components/Box';

export interface LinkItem {
  /**
   * Callback function to be called when the link is clicked.
   */
  onClick?: () => void;
  /**
   * The text to be displayed as the link.
   */
  text: string;
  /**
   * The URL to which the link points.
   */
  to: string;
}

export interface TextFieldHelperTextOwnProps {
  /**
   * An array of content items. Each item can be a string or a LinkItem.
   */
  content: (LinkItem | string)[];
}

export type TextFieldHelperTextProps = TextFieldHelperTextOwnProps &
  Omit<BoxProps, keyof TextFieldHelperTextOwnProps>;

export const TextFieldHelperText = ({
  content,
  ...rest
}: TextFieldHelperTextProps) => {
  return (
    <Box {...rest}>
      <Typography variant="body1">
        {content.map((item, index) => {
          if (typeof item === 'string') {
            return <React.Fragment key={index}>{item}</React.Fragment>;
          } else {
            return (
              <Link key={index} onClick={item.onClick} to={item.to}>
                {item.text}
              </Link>
            );
          }
        })}
      </Typography>
    </Box>
  );
};
