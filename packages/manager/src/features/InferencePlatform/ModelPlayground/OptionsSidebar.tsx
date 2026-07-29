import { Box, Checkbox, FormControlLabel, Typography } from '@linode/ui';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Collapse from '@mui/material/Collapse';
import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

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
  const advancedButtonRef = useRef<HTMLButtonElement | null>(null);

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
      sx={(theme) => ({
        bgcolor:
          theme.palette.mode === 'light' ? theme.bg.white : theme.bg.offWhite,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        overflowX: 'hidden',
        overflowY: 'auto',
        p: 2,
        width: 280,
      })}
    >
      <Typography variant="h3">Controls</Typography>
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
      <FormControlLabel
        control={
          <Checkbox
            checked={settings.stream}
            onChange={() => onSettingsChange({ stream: !settings.stream })}
          />
        }
        label="Stream response"
        sx={{ mt: 1 }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={settings.enableThinking}
              onChange={() =>
                onSettingsChange({ enableThinking: !settings.enableThinking })
              }
            />
          }
          label="Enable thinking"
        />
        <Collapse in={settings.enableThinking}>
          <Box sx={{ pt: 2 }}>
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
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box
          aria-controls="advanced-options-panel"
          aria-expanded={showAdvanced}
          component="button"
          onClick={() => setShowAdvanced((prev) => !prev)}
          ref={advancedButtonRef}
          sx={(theme) => ({
            alignItems: 'center',
            background: 'none',
            border: 'none',
            color: theme.tokens.component.Button.Link.Default.Text,
            cursor: 'pointer',
            display: 'flex',
            gap: 0.5,
            padding: '8px 0 0',
            width: '100%',
            '&:hover': {
              color: theme.tokens.component.Button.Link.Hover.Text,
            },
          })}
        >
          <Typography
            sx={(theme) => ({ fontFamily: theme.font.bold })}
            variant="body2"
          >
            Advanced Options
          </Typography>
          <KeyboardArrowDown
            sx={{
              fontSize: 18,
              transform: showAdvanced ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          />
        </Box>
        <Collapse
          id="advanced-options-panel"
          in={showAdvanced}
          timeout={{ enter: 0, exit: 350 }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
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
