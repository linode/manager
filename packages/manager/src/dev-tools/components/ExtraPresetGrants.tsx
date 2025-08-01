import type { Grants } from '@linode/api-v4';

interface ExtraPresetGrantsProps {
  customGrantsData: Grants | null | undefined;
  handlers: string[];
  onFormChange?: (data: Grants | null | undefined) => void;
  onTogglePreset: (
    e: React.ChangeEvent<HTMLInputElement>,
    presetId: string
  ) => void;
}
