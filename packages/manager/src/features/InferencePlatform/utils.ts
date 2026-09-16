import { useAccount } from '@linode/queries';
import { isFeatureEnabledV2 } from '@linode/utilities';

import Gemma from 'src/features/InferencePlatform/assets/icons/models/gemma.svg';
import Nemotron from 'src/features/InferencePlatform/assets/icons/models/nemotron.svg';
import Deepseek from 'src/features/InferencePlatform/assets/icons/providers/deepseek.svg';
import Google from 'src/features/InferencePlatform/assets/icons/providers/google.svg';
import Meta from 'src/features/InferencePlatform/assets/icons/providers/meta.svg';
import Moonshot from 'src/features/InferencePlatform/assets/icons/providers/moonshot.svg';
import Nvidia from 'src/features/InferencePlatform/assets/icons/providers/nvidia.svg';
import OpenAI from 'src/features/InferencePlatform/assets/icons/providers/openai.svg';
import Qwen from 'src/features/InferencePlatform/assets/icons/providers/qwen.svg';
import Zhipu from 'src/features/InferencePlatform/assets/icons/providers/zhipu.svg';
import { useFlags } from 'src/hooks/useFlags';

import type { Theme } from '@mui/material/styles';

export const providerIcon = (
  providerLogo: string
): null | React.FC<React.SVGProps<SVGSVGElement>> => {
  switch (providerLogo.toLowerCase()) {
    case 'alibaba':
    case 'qwen':
      return Qwen;

    case 'deepseek':
      return Deepseek;

    case 'google':
      return Google;

    case 'meta':
      return Meta;

    case 'moonshot':
    case 'moonshot ai':
      return Moonshot;

    case 'nvidia':
      return Nvidia;

    case 'openai':
      return OpenAI;

    case 'zhipuai':
      return Zhipu;

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
            : 'hsl(242, 95.87%, 73.02%)',
        '--color-b':
          cmTheme.palette.mode === 'dark'
            ? 'hsl(255, 78.67%, 78.88%)'
            : 'hsl(242, 89.87%, 72.02%)',
      };

    case 'deepseek':
      return {
        '--color-a':
          cmTheme.palette.mode === 'light'
            ? 'hsl(210, 100%, 55.88%)'
            : 'hsl(220, 100%, 65%)',
      };

    case 'google':
      return {};

    case 'moonshot':
    case 'moonshot ai':
      return {
        '--color-a':
          cmTheme.palette.mode === 'light'
            ? 'hsl(0, 100%, 0%)'
            : 'hsl(120, 100%, 100%)',
      };

    case 'nvidia':
      return {
        '--color-a': 'hsl(85.8, 74.3%, 41.2%)',
      };

    case 'openai':
      return {
        '--open-ai-light': 'hsl(255, 0%, 95%)',
        '--open-ai-dark': 'hsl(255, 0%, 0%)',
      };

    case 'zhipuai':
      return {
        '--color-a':
          cmTheme.palette.mode === 'light'
            ? 'hsl(210, 0%, 0%)'
            : 'hsl(210, 0%, 0.1%)',
        '--color-b':
          cmTheme.palette.mode === 'light'
            ? 'hsl(210.1, 0%, 100%)'
            : 'hsl(210.1, 0%, 99.99%)',
      };

    default:
      return {};
  }
};

export const modelIcon = (
  modelLogo: string
): null | React.FC<React.SVGProps<SVGSVGElement>> => {
  switch (modelLogo) {
    case 'deepseek':
      return Deepseek;

    case 'gemma4':
      return Gemma;

    case 'glm5':
      return Zhipu;

    case 'metaLlama':
      return Meta;

    case 'moonshot':
      return Moonshot;

    case 'nemotron':
      return Nemotron;

    case 'openai':
      return OpenAI;

    case 'qwen':
      return Qwen;

    default:
      return Google;
  }
};

export const modelIconStyles = (modelLogo: string, cmTheme: Theme): object => {
  switch (modelLogo) {
    case 'deepseek':
      return {
        '--color-a':
          cmTheme.palette.mode === 'light'
            ? 'hsl(210, 100%, 55.88%)'
            : 'hsl(220, 100%, 65%)',
      };

    case 'gemma4':
      return {
        '--color-a':
          cmTheme.palette.mode === 'light'
            ? 'hsl(226.5, 100%, 48.3%)'
            : 'hsl(226.5, 100%, 74.3%)',
        '--color-b':
          cmTheme.palette.mode === 'light'
            ? 'hsl(210.1, 100%, 61%)'
            : 'hsl(210.1, 100%, 77%)',
        '--color-c':
          cmTheme.palette.mode === 'light'
            ? 'hsl(224.6, 100%, 74.7%)'
            : 'hsl(224.6, 100%, 96%)',
      };

    case 'glm5':
      return {
        '--color-a':
          cmTheme.palette.mode === 'light'
            ? 'hsl(226.5, 0%, 0%)'
            : 'hsl(226.5, 0%, 0.1%)',
        '--color-b':
          cmTheme.palette.mode === 'light'
            ? 'hsl(210.1, 0%, 100%)'
            : 'hsl(210.1, 0%, 99.99%)',
      };

    case 'metaLlama':
      return {
        '--color-a':
          cmTheme.palette.mode === 'light'
            ? 'hsla(226.5, 0%, 0%, 0)'
            : 'hsla(226.5, 0%, 0%, 0.01)',
        '--color-b':
          cmTheme.palette.mode === 'light'
            ? 'hsl(210.1, 0%, 35%)'
            : 'hsl(210.1, 0%, 80%)',
      };

    case 'moonshot':
      return {
        '--color-a':
          cmTheme.palette.mode === 'light'
            ? 'hsl(210, 0%, 0%)'
            : 'hsl(210, 0%, 100%)',
      };

    case 'nemotron':
      return {
        '--color-a':
          cmTheme.palette.mode === 'light'
            ? 'hsl(226.5, 0%, 0%)'
            : 'hsl(226.5, 0%, 100%)',
      };

    case 'openai':
      return {
        '--open-ai-light': 'hsl(255, 0%, 95%)',
        '--open-ai-dark': 'hsl(255, 0%, 0%)',
      };

    case 'qwen':
    case 'qwen3':
      return {
        '--color-a':
          cmTheme.palette.mode === 'light'
            ? 'hsl(255, 78.67%, 55.88%)'
            : 'hsl(242, 95.87%, 71.02%)',
        '--color-b':
          cmTheme.palette.mode === 'light'
            ? 'hsl(255, 78.67%, 78.88%)'
            : 'hsl(242, 89.87%, 85.02%)',
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

  const isInferencePlatformEnabled = isFeatureEnabledV2(
    'AI Inference',
    Boolean(flags.inferencePlatform),
    account?.capabilities ?? []
  );

  return { isInferencePlatformEnabled };
};
