import { styled } from '@mui/material/styles';
import * as React from 'react';

import DocsIcon from 'src/assets/icons/docs.svg';
import { Link } from 'src/components/Link';
import { sendHelpButtonClickEvent } from 'src/utilities/analytics';

export interface DocsLinkProps {
  /** The label to use for analytics purposes */
  analyticsLabel?: string;
  /** The URL to link to */
  href: string;
  /**
   * The clickable text of the link
   * @default Docs
   * */
  label?: string;
  /** A callback function when the link is clicked */
  onClick?: () => void;
  /*  */
  icon?: JSX.Element;
}

/**
 * - The Docs link breaks the pattern of an external link with the position and size of the icon.
 * - The Docs link is usually featured on create flows in the top right corner of the page, next to the create button.
 * - Consider displaying the title of a key guide or product document as the link instead of the generic “Docs”.
 */
export const DocsLink = (props: DocsLinkProps) => {
  const { analyticsLabel, href, label, onClick, icon } = props;

  return (
    <StyledDocsLink
      onClick={() => {
        if (onClick === undefined) {
          sendHelpButtonClickEvent(href, analyticsLabel);
        } else {
          onClick();
        }
      }}
      className="docsButton"
      to={href}
    >
      {icon ?? <DocsIcon />}
      {label ?? 'Docs'}
    </StyledDocsLink>
  );
};

const StyledDocsLink = styled(Link, {
  label: 'StyledDocsLink',
})(({ theme }) => ({
  '& svg': {
    marginRight: theme.spacing(),
  },
  '&:hover': {
    color: theme.textColors.linkActiveLight,
    textDecoration: 'underline',
  },
  alignItems: 'center',
  display: 'flex',
  fontFamily: theme.font.normal,
  fontSize: '.875rem',
  lineHeight: 'normal',
  margin: 0,
  minWidth: 'auto',
}));
