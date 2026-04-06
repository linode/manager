import * as React from 'react';

import { Typography } from '../Typography';

import type { SxProps, Theme } from '@mui/material/styles';

interface H1HeaderProps {
  className?: string;
  dataQaEl?: string;
  renderAsSecondary?: boolean;
  sx?: SxProps<Theme>;
  title: string;
}
// Accessibility Feature:
// The role of this component is to implement focus to the main content when navigating the application
// Since it is a one page APP, we need to help users focus on the main content when switching views
// It should serve as the only source for all H1s
export const H1Header = (props: H1HeaderProps) => {
  const h1Header = React.useRef<HTMLDivElement>(null);
  const { className, dataQaEl, renderAsSecondary, sx, title } = props;

  return (
    <Typography
      className={className}
      component={renderAsSecondary ? 'h2' : 'h1'}
      data-qa-header={dataQaEl ? dataQaEl : ''}
      ref={renderAsSecondary ? null : h1Header} // If we're rendering as an h2, we want to remove the autofocus functionality
      sx={{
        '&:focus': {
          outline: 'none',
        },
        ...sx,
      }}
      tabIndex={0}
      variant="h1"
    >
      {title}
    </Typography>
  );
};
