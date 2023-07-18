import { styled } from '@mui/material/styles';
import * as React from 'react';

import DocsIcon from 'src/assets/icons/docs.svg';
import { Link } from 'src/components/Link';
import { sendHelpButtonClickEvent } from 'src/utilities/analytics';

interface Props {
  analyticsLabel?: string;
  href: string;
  label?: string;
  onClick?: () => void;
}

export const DocsLink = (props: Props) => {
  const { analyticsLabel, href, label, onClick } = props;

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
      <DocsIcon />
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
