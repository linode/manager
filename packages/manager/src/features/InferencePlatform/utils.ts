import { useAccount } from '@linode/queries';
import { isFeatureEnabled } from '@linode/utilities';

import Google from 'src/assets/icons/ai/providers/google.svg';
import Moonshot from 'src/assets/icons/ai/providers/moonshot.svg';
import OpenAI from 'src/assets/icons/ai/providers/openai.svg';
import Qwen from 'src/assets/icons/ai/providers/qwen.svg';
import { useFlags } from 'src/hooks/useFlags';

import type { Theme } from '@mui/material/styles';


export const providerIcon = (
  providerLogo: string
): null | React.FC<React.SVGProps<SVGSVGElement>> => {
  switch (providerLogo.toLowerCase()) {
    case 'alibaba':
    case 'qwen':
      return Qwen;

    case 'google':
      return Google;

    case 'moonshot':
    case 'moonshot ai':
      return Moonshot;

    case 'openai':
      return OpenAI;

    default:
      return Google;
  }
};

export const providerIconStyles = (
  providerLogo: string,
  cmTheme: Theme
): object => {
  switch (providerLogo.toLowerCase()) {
    case 'alibaba':
    case 'qwen':
      return {
        '--color-a':
          cmTheme.palette.mode === 'light'
            ? 'hsl(255, 78.67%, 55.88%)'
            : 'hsl(242, 89.87%, 72.02%)',
        '--color-b':
          cmTheme.palette.mode === 'dark'
            ? 'hsl(255, 78.67%, 78.88%)'
            : 'hsl(242, 89.87%, 98.02%)',
      };

    case 'google':
      return {};

    case 'openai':
      return {
        '--open-ai-light': 'hsl(255, 0%, 95%)',
        '--open-ai-dark': 'hsl(255, 0%, 0%)',
      };

    default:
      return {};
  }
};

export const useIsInferencePlatformEnabled = (): {
  isInferencePlatformEnabled: boolean;
} => {
  const { data: account } = useAccount();
  const flags = useFlags();

  if (!flags) {
    return { isInferencePlatformEnabled: false };
  }

  // TODO: Switch to isFeatureEnabledV2 (AND logic) once the 'AI' capability
  // is available in the API. Currently using OR logic for development.
  const isInferencePlatformEnabled = isFeatureEnabled(
    'AI',
    Boolean(flags.inferencePlatform),
    account?.capabilities ?? []
  );

  return { isInferencePlatformEnabled };
};
