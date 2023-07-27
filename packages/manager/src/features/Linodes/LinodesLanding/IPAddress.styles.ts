import { styled } from '@mui/material/styles';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { isPropValid } from 'src/utilities/isPropValid';

import { IPAddressProps } from './IPAddress';

interface StyledIpAddressProps extends Partial<IPAddressProps> {
  isIpHovered?: boolean;
}

export const StyledIpLinkDiv = styled('div', { label: 'StyledIpLinkDiv' })(
  ({ theme }) => ({
    color: theme.palette.primary.main,
    display: 'inline-block',
    position: 'relative' as const,
    top: -1,
    transition: theme.transitions.create(['color']),
  })
);

export const StyledRootDiv = styled('div', {
  label: 'StyledRootDiv',
})<StyledIpAddressProps>(({ showAll, theme }) => ({
  '&:last-child': {
    marginBottom: 0,
  },
  marginBottom: theme.spacing(0.5),
  maxWidth: '100%',
  width: '100%',

  ...(!showAll
    ? {
        alignItems: 'center',
        display: 'inline-flex',
      }
    : {}),
}));

export const StyledCopyTooltip = styled(CopyTooltip, {
  label: 'StyledCopyTooltip ',
  shouldForwardProp: (prop) =>
    isPropValid(['isHovered', 'isIpHovered', 'showTooltipOnIpHover'], prop),
})<StyledIpAddressProps>(
  ({ isHovered, isIpHovered, showTooltipOnIpHover, theme }) => ({
    '& svg': {
      height: 12,
      top: 1,
      width: 12,
    },
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    marginLeft: theme.spacing(0.5),
    opacity: isHovered ? 1 : 0,
    transition: theme.transitions.create(['opacity']),
    ...(showTooltipOnIpHover && {
      opacity: isIpHovered ? 1 : 0,
    }),
  })
);

export const StyledRenderIPDiv = styled('div', {
  label: 'StyledRenderIPDiv',
  shouldForwardProp: (prop) =>
    isPropValid(['showAll', 'showTooltipOnIpHover'], prop),
})<StyledIpAddressProps>(({ showAll, theme }) => ({
  alignItems: 'center',
  display: 'flex',
  width: '100%',
  ...(showAll
    ? {
        '&:not(:last-child)': {
          marginBottom: theme.spacing(0.5),
        },
      }
    : {}),
}));
