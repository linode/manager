import {
  Button,
  Checkbox,
  LoadingSpinner,
  Tooltip,
} from '@akamai/cds-components/react';
import { ChevronDown, InfoOutline } from '@akamai/cds-icons/react';
import { useTheme } from '@linode/ui';
import Collapse from '@mui/material/Collapse';
import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Box, Typography } from '../components';
import { EffortControl } from './EffortControl';
import {
  ModelPlaygroundModelContext,
  ModelPlaygroundOptionsContext,
} from './ModelPlaygroundContext';
import { SeedControl } from './SeedControl';
import { SliderControl } from './SliderControl';
import { StopSequencesControl } from './StopSequencesControl';
import { isSupportedNumericParameter } from './utils';

import type { PlaygroundSettings, SupportedNumericParameter } from './types';
import type { InferenceParameterDef } from '@linode/api-v4';

// API parameter names that have a dedicated control rather than a generic slider/checkbox.
const SPECIAL_PARAMETER_NAMES = new Set([
  'enable_thinking',
  'seed',
  'stop',
  'stream',
]);

// Parameters shown above the "Advanced Options" collapse, in display order.
const PRIMARY_NUMERIC_PARAMETERS: Array<keyof PlaygroundSettings> = [
  'temperature',
  'max_tokens',
  'top_p',
];

const NUMERIC_STEP_BY_TYPE: Record<'integer' | 'number', number> = {
  integer: 1,
  number: 0.01,
};

const NUMERIC_PARAMETER_DESCRIPTIONS_FALLBACK: Partial<
  Record<SupportedNumericParameter, string>
> = {
  frequency_penalty:
    "Reduces repetition by penalizing tokens in proportion to how often they've already appeared.",
  max_tokens:
    "The maximum length of the model's response, in tokens. Generation stops once this limit is reached.",
  min_p:
    'Sets the minimum probability a token needs (relative to the most likely token) to be considered. Filters out unlikely options.',
  presence_penalty:
    'Discourages reusing any token that has already appeared, nudging the model towards new topics.',
  temperature:
    'Controls randomness. Lower values make output more focused and deterministic. Higher values make it more creative and varied.',
  top_k:
    'Limits sampling to the K most likely next tokens at each step. Lower values make output more focused.',
  top_p:
    'Nucleus sampling. The model only considers the most likely tokens whose probabilities sum to this value. Lower values narrow the choices.',
};

interface SliderConfig {
  field: SupportedNumericParameter;
  label: string;
  max: number | undefined;
  min: number | undefined;
  step: number;
  tooltip?: string;
}

const toSliderConfig = (
  name: SupportedNumericParameter,
  definition: InferenceParameterDef,
  maxTokensMaximum?: number
): SliderConfig => {
  const step =
    NUMERIC_STEP_BY_TYPE[definition.type as 'integer' | 'number'] ?? 0.01;
  const precision = definition.type === 'integer' ? 0 : 2;
  const adjustExclusiveBound = (bound: number, direction: -1 | 1) =>
    Number((bound + direction * step).toFixed(precision));
  const min =
    definition.minimum ??
    (definition.exclusiveMinimum === undefined
      ? undefined
      : adjustExclusiveBound(definition.exclusiveMinimum, 1));
  const max =
    (name === 'max_tokens' ? maxTokensMaximum : undefined) ??
    definition.maximum ??
    (definition.exclusiveMaximum === undefined
      ? undefined
      : adjustExclusiveBound(definition.exclusiveMaximum, -1));

  return {
    field: name,
    label: definition.label ?? name,
    max,
    min,
    step,
    tooltip:
      definition.description ?? NUMERIC_PARAMETER_DESCRIPTIONS_FALLBACK[name],
  };
};

interface SliderRowProps {
  config: SliderConfig;
  onSettingsChange: (patch: Partial<PlaygroundSettings>) => void;
  value: PlaygroundSettings[keyof PlaygroundSettings];
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
        value={value as number | undefined}
      />
    );
  }
);

const ParameterCheckboxLabel = ({
  description,
  label,
}: {
  description?: string;
  label: string;
}) => (
  <Box style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
    <span>{label}</span>
    {description && (
      <Tooltip tooltipText={description}>
        <span style={{ alignItems: 'center', display: 'flex' }}>
          <InfoOutline height={16} width={16} />
        </span>
      </Tooltip>
    )}
  </Box>
);

export const OptionsSidebar = () => {
  const { onSettingsChange, settings } = useContext(
    ModelPlaygroundOptionsContext
  );
  const { isModelDetailsError, isModelDetailsLoading, modelDetails } =
    useContext(ModelPlaygroundModelContext);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const advancedButtonRef = useRef<null | React.ComponentRef<typeof Button>>(
    null
  );
  const theme = useTheme();

  const parameters = useMemo(
    () => modelDetails?.inference_parameters ?? {},
    [modelDetails]
  );

  const numericConfigs = useMemo(
    () =>
      Object.entries(parameters)
        .filter(
          ([name, definition]) =>
            !SPECIAL_PARAMETER_NAMES.has(name) &&
            Boolean(definition) &&
            typeof definition === 'object' &&
            isSupportedNumericParameter(name) &&
            (definition.type === 'integer' || definition.type === 'number')
        )
        .map(([name, definition]) =>
          toSliderConfig(
            name as SupportedNumericParameter,
            definition,
            modelDetails?.parameters?.max_output_tokens
          )
        ),
    [modelDetails?.parameters?.max_output_tokens, parameters]
  );

  const visibleConfigs = useMemo(
    () =>
      PRIMARY_NUMERIC_PARAMETERS.map((field) =>
        numericConfigs.find((config) => config.field === field)
      ).filter((config): config is SliderConfig => Boolean(config)),
    [numericConfigs]
  );

  const advancedNumericConfigs = useMemo(
    () =>
      numericConfigs.filter(
        (config) => !PRIMARY_NUMERIC_PARAMETERS.includes(config.field)
      ),
    [numericConfigs]
  );

  const hasStop = Boolean(parameters.stop);
  const hasStream = Boolean(parameters.stream);
  const hasEnableThinking = Boolean(parameters.enable_thinking);
  const hasSeed = Boolean(parameters.seed);
  const reasoningEffortOptions = Array.isArray(
    parameters.reasoning_effort?.enum
  )
    ? parameters.reasoning_effort.enum.filter(
        (value): value is string => typeof value === 'string'
      )
    : [];
  const hasReasoningEffort = reasoningEffortOptions.length > 0;
  const hasAdvancedOptions = advancedNumericConfigs.length > 0 || hasSeed;
  const hasControls =
    visibleConfigs.length > 0 ||
    hasStop ||
    hasStream ||
    hasEnableThinking ||
    hasReasoningEffort ||
    hasAdvancedOptions;

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
      {isModelDetailsLoading ? (
        <Box
          style={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'center',
            padding: '32px',
          }}
        >
          <LoadingSpinner />
        </Box>
      ) : isModelDetailsError ? (
        <Typography style={{ fontSize: '0.875rem' }}>
          Unable to load this model&apos;s options. Model defaults will be used.
        </Typography>
      ) : modelDetails && !hasControls ? (
        <Typography style={{ fontSize: '0.875rem' }}>
          No controls available for the selected model.
        </Typography>
      ) : (
        <>
          {visibleConfigs.map((config) => (
            <SliderRow
              config={config}
              key={config.field}
              onSettingsChange={onSettingsChange}
              value={settings[config.field]}
            />
          ))}
          {hasStop && (
            <StopSequencesControl
              label={parameters.stop?.label}
              onChange={(value) => onSettingsChange({ stop: value })}
              tooltip={parameters.stop?.description}
              value={settings.stop}
            />
          )}
          {hasStream && (
            <Box style={{ marginTop: '8px' }}>
              <Checkbox
                checked={settings.stream}
                onChange={() => onSettingsChange({ stream: !settings.stream })}
              >
                <ParameterCheckboxLabel
                  description={parameters.stream?.description}
                  label={parameters.stream?.label ?? 'Stream response'}
                />
              </Checkbox>
            </Box>
          )}
          {hasEnableThinking && (
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: '8px',
              }}
            >
              <Checkbox
                checked={settings.enableThinking}
                onChange={() =>
                  onSettingsChange({
                    enableThinking: !settings.enableThinking,
                  })
                }
              >
                <ParameterCheckboxLabel
                  description={parameters.enable_thinking?.description}
                  label={parameters.enable_thinking?.label ?? 'Enable thinking'}
                />
              </Checkbox>
              <Collapse
                in={settings.enableThinking && hasReasoningEffort}
                timeout={0}
              >
                <Box style={{ paddingTop: '32px' }}>
                  <EffortControl
                    label={
                      parameters.reasoning_effort?.label ?? 'Thinking Effort'
                    }
                    onChange={(value) =>
                      onSettingsChange({ reasoning_effort: value })
                    }
                    options={reasoningEffortOptions}
                    tooltip={
                      parameters.reasoning_effort?.description ??
                      'How much internal reasoning the model does before answering. Higher effort improves quality on complex tasks but increases response time and cost.'
                    }
                    value={settings.reasoning_effort}
                  />
                </Box>
              </Collapse>
            </Box>
          )}
          {!hasEnableThinking && hasReasoningEffort && (
            <EffortControl
              label={parameters.reasoning_effort?.label ?? 'Thinking Effort'}
              onChange={(value) =>
                onSettingsChange({ reasoning_effort: value })
              }
              options={reasoningEffortOptions}
              tooltip={
                parameters.reasoning_effort?.description ??
                'How much internal reasoning the model does before answering. Higher effort improves quality on complex tasks but increases response time and cost.'
              }
              value={settings.reasoning_effort}
            />
          )}
          {hasAdvancedOptions && (
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
                  <Typography
                    style={{ font: theme.font.bold, fontSize: '0.875rem' }}
                  >
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
                  {advancedNumericConfigs.map((config) => (
                    <SliderRow
                      config={config}
                      key={config.field}
                      onSettingsChange={onSettingsChange}
                      value={settings[config.field]}
                    />
                  ))}
                  {hasSeed && (
                    <SeedControl
                      label={parameters.seed?.label}
                      onChange={(value) => onSettingsChange({ seed: value })}
                      tooltip={parameters.seed?.description}
                      value={settings.seed}
                    />
                  )}
                </Box>
              </Collapse>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};
