import { Spacing } from '@akamai/cds-tokens';
import { Button, styled } from '@linode/ui';

export const StyledButton = styled(Button, { label: 'StyledButton' })(() => ({
  marginTop: Spacing.S16,
  alignSelf: 'flex-end',
}));
