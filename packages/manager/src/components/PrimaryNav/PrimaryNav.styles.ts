import { Accordion, Box, Divider, omittedProps } from '@linode/ui';
import { Chip, styled } from '@mui/material';

import AkamaiLogo from 'src/assets/logo/akamai-logo.svg';
import { Link } from 'src/components/Link';
import { SIDEBAR_WIDTH } from 'src/components/PrimaryNav/constants';

export const StyledAkamaiLogo = styled(AkamaiLogo, {
  label: 'StyledAkamaiLogo',
})(({ theme }) => ({
  'path, polygon': {
    fill: theme.tokens.color.Neutrals.White,
  },
}));

export const StyledDivider = styled(Divider, {
  label: 'StyledDivider',
})(({ theme }) => ({
  borderColor: theme.tokens.border.Normal,
  margin: 0,
}));

export const StyledActiveLink = styled(Link, {
  label: 'StyledActiveLink',
  shouldForwardProp: omittedProps(['isActiveLink', 'isCollapsed']),
})<{ isActiveLink: boolean; isCollapsed: boolean }>(({ theme, ...props }) => ({
  ...(!props.isActiveLink && {
    '&:hover': {
      '.primaryNavLink': {
        color: theme.tokens.color.Neutrals['White'],
      },
      backgroundColor: theme.tokens.color.Neutrals[100],
    },
  }),
  '&:hover, &:focus': {
    textDecoration: 'none',
  },
  alignItems: 'center',
  cursor: 'pointer',
  display: 'flex',
  font: theme.tokens.typography.Body.Semibold,
  height: 32,
  minWidth: SIDEBAR_WIDTH,
  padding: `8px 8px 8px 48px`,
  position: 'relative',
  ...(props.isActiveLink && {
    backgroundColor: theme.tokens.color.Neutrals[100],
  }),
}));

export const StyledPrimaryLinkBox = styled(Box, {
  label: 'StyledPrimaryLinkBox',
  shouldForwardProp: omittedProps(['isCollapsed', 'isActiveLink']),
})<{ isActiveLink: boolean; isCollapsed: boolean }>(({ theme, ...props }) => ({
  alignItems: 'center',
  color: props.isActiveLink
    ? theme.tokens.color.Brand[60]
    : theme.tokens.color.Neutrals['White'],
  display: 'flex',
  font: theme.tokens.typography.Label.Semibold.S,
  transition: theme.transitions.create(['color', 'opacity']),
  width: '100%',
  ...(props.isActiveLink && {
    font: theme.tokens.typography.Body.Bold,
  }),
  ...(props.isCollapsed && {
    opacity: 0,
  }),
}));

export const StyledAccordion = styled(Accordion, {
  label: 'StyledAccordion',
  shouldForwardProp: omittedProps(['isCollapsed', 'isActiveProductFamily']),
})<{ isActiveProductFamily: boolean; isCollapsed: boolean }>(
  ({ theme, ...props }) => ({
    '& h3': {
      '& .productFamilyName': {
        color: theme.tokens.color.Neutrals['White'],
        fontFamily: theme.tokens.font.FontFamily.Brand,
        fontSize: theme.tokens.font.FontSize.Xxxs,
        // eslint-disable-next-line
        fontWeight: theme.tokens.font.FontWeight.Extrabold,
        letterSpacing: theme.tokens.typography.Heading.OverlineLetterSpacing,
        lineHeight: theme.tokens.font.LineHeight.Xxxs,
        paddingLeft: theme.tokens.spacing.S12,
        paddingRight: theme.tokens.spacing.S12,
        textTransform: 'uppercase',
        transition: theme.transitions.create(['opacity']),
        ...(props.isCollapsed && {
          opacity: 0,
        }),
      },
      // product family icon
      '& svg': {
        color: props.isActiveProductFamily
          ? theme.tokens.color.Brand[60]
          : theme.tokens.color.Neutrals['White'],
        height: 24,
        transition: theme.transitions.create(['color']),
        width: 24,
      },
      alignItems: 'center',
      display: 'flex',
      font: theme.tokens.typography.Label.Bold.S,
    },
    '.MuiAccordionDetails-root': {
      padding: 0,
    },
    '.MuiAccordionSummary-content': {
      margin: 0,
      padding: 0,
    },
    '.MuiAccordionSummary-expandIconWrapper svg': {
      color: theme.tokens.color.Neutrals['White'],
      height: 16,
      width: 16,
    },
    '.MuiAccordionSummary-root': {
      transition: 'none',
    },
    '.MuiButtonBase-root, MuiAccordionSummary-root': {
      '&:hover': {
        backgroundColor: theme.tokens.color.Neutrals[100],
      },
      '.Mui-expanded': {
        alignItems: 'center',
        maxHeight: '48px',
        minHeight: '48px',
      },
      backgroundColor: theme.tokens.color.Neutrals[90],
      maxHeight: '48px',
      minHeight: '48px',
      paddingLeft: theme.tokens.spacing.S12,
      paddingRight: theme.tokens.spacing.S8,
      svg: {
        fill: theme.tokens.color.Neutrals['White'],
        stroke: 'transparent',
      },
    },
    // Spacing between the accordion and the next accordion
    '.MuiCollapse-entered .MuiAccordionDetails-root': {
      marginBottom: theme.tokens.spacing.S8,
    },
    backgroundColor: theme.tokens.color.Neutrals[90],
  })
);

export const StyledChip = styled(Chip, {
  label: 'styledChip',
  shouldForwardProp: omittedProps(['isActiveLink']),
})<{ isActiveLink: boolean }>(({ theme, ...props }) => ({
  backgroundColor: props.isActiveLink
    ? theme.tokens.sideNavigation.SelectedMenuItem.Label.Background
    : theme.tokens.sideNavigation.DefaultMenuItem.Label.Background,
  border: !props.isActiveLink
    ? `1px solid ${theme.tokens.sideNavigation.DefaultMenuItem.Label.Border}`
    : 'none',
  borderRadius: '2px',
  color: props.isActiveLink
    ? theme.tokens.sideNavigation.SelectedMenuItem.Label.Text
    : theme.tokens.sideNavigation.DefaultMenuItem.Label.Text,
  marginRight: '12px',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  width: '30px',
}));
