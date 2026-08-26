import { Button, Checkbox } from '@akamai/cds-components/react';
import { ChevronDown } from '@akamai/cds-icons/react';
import { useTheme } from '@linode/ui';
import Collapse from '@mui/material/Collapse';
import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Box, Typography } from '../components';
import { EffortControl } from './EffortControl';
import { ModelPlaygroundOptionsContext } from './ModelPlaygroundContext';
import { SeedControl } from './SeedControl';
import { SliderControl } from './SliderControl';
import { StopSequencesControl } from './StopSequencesControl';

import type { PlaygroundSettings } from './types';

type SliderField = keyof Pick<
  PlaygroundSettings,
  | 'frequency_penalty'
  | 'max_tokens'
  | 'min_p'
  | 'presence_penalty'
  | 'temperature'
  | 'top_k'
  | 'top_p'
>;

interface SliderConfig {
  field: SliderField;
  label: string;
  max: number;
  min: number;
  step: number;
  tooltip: string;
}

const VISIBLE_SLIDERS: SliderConfig[] = [
  {
    field: 'temperature',
    label: 'Temperature',
    max: 2,
    min: 0,
    step: 0.1,
    tooltip:
      'Controls randomness. Lower values make output more focused and deterministic. Higher values make it more creative and varied.',
  },
  {
    field: 'max_tokens',
    label: 'Max Output Tokens',
    max: 16384,
    min: 1,
    step: 1,
    tooltip:
      "The maximum length of the model's response, in tokens. Generation stops once this limit is reached.",
  },
  {
    field: 'top_p',
    label: 'Top P',
    max: 1,
    min: 0,
    step: 0.01,
    tooltip:
      'Nucleus sampling. The model only considers the most likely tokens whose probabilities sum to this value. Lower values narrow the choices.',
  },
];

const ADVANCED_SLIDERS: SliderConfig[] = [
  {
    field: 'top_k',
    label: 'Top K',
    max: 100,
    min: 0,
    step: 1,
    tooltip:
      'Limits sampling to the K most likely next tokens at each step. Lower values make output more focused.',
  },
  {
    field: 'min_p',
    label: 'Min P',
    max: 1,
    min: 0,
    step: 0.01,
    tooltip:
      'Sets the minimum probability a token needs (relative to the most likely token) to be considered. Filters out unlikely options.',
  },
  {
    field: 'presence_penalty',
    label: 'Presence Penalty',
    max: 2,
    min: 0,
    step: 0.1,
    tooltip:
      'Discourages reusing any token that has already appeared, nudging the model towards new topics.',
  },
  {
    field: 'frequency_penalty',
    label: 'Frequency Penalty',
    max: 2,
    min: 0,
    step: 0.1,
    tooltip:
      "Reduces repetition by penalizing tokens in proportion to how often they've already appeared.",
  },
];

interface SliderRowProps {
  config: SliderConfig;
  onSettingsChange: (patch: Partial<PlaygroundSettings>) => void;
  value: PlaygroundSettings[SliderField];
}

const SliderRow = memo(
  ({ config, onSettingsChange, value }: SliderRowProps) => {
    const { field, label, max, min, step, tooltip } = config;

    const handleChange = useCallback(
      (newValue: number) => {
        onSettingsChange({ [field]: newValue } as Partial<PlaygroundSettings>);
      },
      [field, onSettingsChange]
    );

    return (
      <SliderControl
        label={label}
        max={max}
        min={min}
        onChange={handleChange}
        step={step}
        tooltip={tooltip}
        value={value}
      />
    );
  }
);

export const OptionsSidebar = () => {
  const { onSettingsChange, settings } = useContext(
    ModelPlaygroundOptionsContext
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const advancedButtonRef = useRef<null | React.ComponentRef<typeof Button>>(
    null
  );
  const theme = useTheme();

  useEffect(() => {
    if (!showAdvanced) return;
    const frame = requestAnimationFrame(() => {
      advancedButtonRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [showAdvanced]);

  return (
    <Box
      style={{
        backgroundColor:
          theme.palette.mode === 'light' ? theme.bg.white : theme.bg.offWhite,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        overflowX: 'hidden',
        overflowY: 'auto',
        padding: '16px',
        width: 280,
      }}
    >
      <Typography
        component="h3"
        style={{ font: 'var(--token-alias-typography-heading-s)' }}
      >
        Controls
      </Typography>
      {VISIBLE_SLIDERS.map((config) => (
        <SliderRow
          config={config}
          key={config.field}
          onSettingsChange={onSettingsChange}
          value={settings[config.field]}
        />
      ))}
      <StopSequencesControl
        onChange={(value) => onSettingsChange({ stop: value })}
        value={settings.stop}
      />
      <Box style={{ marginTop: '8px' }}>
        <Checkbox
          checked={settings.stream}
          onChange={() => onSettingsChange({ stream: !settings.stream })}
        >
          Stream response
        </Checkbox>
      </Box>
      <Box
        style={{ display: 'flex', flexDirection: 'column', marginTop: '8px' }}
      >
        <Checkbox
          checked={settings.enableThinking}
          onChange={() =>
            onSettingsChange({ enableThinking: !settings.enableThinking })
          }
        >
          Enable thinking
        </Checkbox>
        <Collapse in={settings.enableThinking}>
          <Box style={{ paddingTop: '32px' }}>
            <EffortControl
              label="Thinking Effort"
              onChange={(value) =>
                onSettingsChange({ reasoning_effort: value })
              }
              tooltip="How much internal reasoning the model does before answering. Higher effort improves quality on complex tasks but increases response time and cost."
              value={settings.reasoning_effort}
            />
          </Box>
        </Collapse>
      </Box>
      <Box style={{ display: 'flex', flexDirection: 'column' }}>
        <Box>
          <Button
            aria-controls="advanced-options-panel"
            aria-expanded={showAdvanced}
            onClick={() => setShowAdvanced((prev) => !prev)}
            ref={advancedButtonRef}
            style={{ padding: '8px 0 0' }}
            variant="link"
          >
            <Typography style={{ font: theme.font.bold, fontSize: '0.875rem' }}>
              Advanced Options
            </Typography>
            <ChevronDown
              height={18}
              style={{
                transform: showAdvanced ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
              width={18}
            />
          </Button>
        </Box>
        <Collapse
          id="advanced-options-panel"
          in={showAdvanced}
          timeout={{ enter: 0, exit: 350 }}
        >
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              paddingTop: '16px',
            }}
          >
            {ADVANCED_SLIDERS.map((config) => (
              <SliderRow
                config={config}
                key={config.field}
                onSettingsChange={onSettingsChange}
                value={settings[config.field]}
              />
            ))}
            <SeedControl
              onChange={(value) => onSettingsChange({ seed: value })}
              value={settings.seed}
            />
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};
