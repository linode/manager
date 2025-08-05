import { extraMockPresets } from 'src/mocks/presets';

import type { Grants } from '@linode/api-v4';

const grantsPreset = extraMockPresets.find((p) => p.id === 'grants:custom');

interface ExtraPresetGrantsProps {
  customGrantsData: Grants | null | undefined;
  handlers: string[];
  onFormChange?: (data: Grants | null | undefined) => void;
  onTogglePreset: (
    e: React.ChangeEvent<HTMLInputElement>,
    presetId: string
  ) => void;
}
