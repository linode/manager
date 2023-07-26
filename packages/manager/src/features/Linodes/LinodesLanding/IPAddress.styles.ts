import { styled } from '@mui/material/styles';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { IPAddressProps } from './IPAddress';
import { isPropValid } from 'src/utilities/isPropValid';

type StyledIPAddressProps = Pick<IPAddressProps, 'showAll' | 'showCopyOnHover'>;

export const StyledIPLinkDiv = styled('div', { label: 'StyledIPLinkDiv' })(
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
})<StyledIPAddressProps>(({ theme, showAll }) => ({
  '&:hover': {
    '& $hide': {
      opacity: 1,
    },
  },
  '&:last-child': {
    marginBottom: 0,
  },
  marginBottom: theme.spacing(0.5),
  maxWidth: '100%',
  width: '100%',

  ...(!showAll
    ? {
        display: 'inline-flex',
        alignItems: 'center',
      }
    : {}),
}));

export const StyledCopyTooltip = styled(CopyTooltip, {
  label: 'StyledCopyTooltip ',
  shouldForwardProp: (prop) => isPropValid(['showCopyOnHover'], prop),
})<StyledIPAddressProps>(({ theme, showCopyOnHover }) => ({
  '& svg': {
    height: 12,
    top: 1,
    width: 12,
  },
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  marginLeft: theme.spacing(0.5),

  ...(showCopyOnHover
    ? {
        '&:focus': {
          opacity: 1,
        },
        [theme.breakpoints.up('md')]: {
          // Hide until the component is hovered,
          // when props.showCopyOnHover is true (only on desktop)
          opacity: 0,
        },
        transition: theme.transitions.create(['opacity']),
      }
    : {}),
}));

export const StyledRenderIPDiv = styled('div', {
  label: 'StyledRenderIPDiv',
  shouldForwardProp: (prop) => isPropValid(['showAll'], prop),
})<StyledIPAddressProps>(({ theme, showAll }) => ({
  alignItems: 'flex-start',
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
