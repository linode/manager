import { keyframes } from '@linode/ui';

// Streaming indicator dot — pulsing ring shown while a response is in progress.
// Uses Content.Icon.Recommendation (#12a594) to match the completion checkmark.
export const pulse = keyframes`
  0%   { box-shadow: 0 0 0 0   hsla(173, 80%, 36%, 0.6); }
  70%  { box-shadow: 0 0 0 6px hsla(173, 80%, 36%, 0); }
  100% { box-shadow: 0 0 0 0   hsla(173, 80%, 36%, 0); }
`;
