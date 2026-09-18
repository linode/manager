import { Button } from '@akamai/cds-components/react';
import { ChevronDown } from '@akamai/cds-icons/react';
import Collapse from '@mui/material/Collapse';
import React, { useEffect, useState } from 'react';

import { Box } from '../../components/Box/Box';
import { Paper } from '../../components/Paper/Paper';
import { Stack } from '../../components/Stack/Stack';
import { Typography } from '../../components/Typography/Typography';
import styles from './InferenceParameters.module.css';

import type { Model } from '../../ModelLibrary/modelLibrary.types';
import type { InferenceParameterDef } from '@linode/api-v4';

interface InferenceParametersProps {
  model?: Model;
}

/** Number of parameters shown before the rest collapse behind "More". */
const VISIBLE_COUNT = 3;

const formatDefault = (value: InferenceParameterDef['default']): string => {
  if (value === undefined || value === null) return '—';
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
  return String(value);
};

const formatRange = (def: InferenceParameterDef): string | undefined => {
  const minimum =
    def.minimum !== undefined
      ? `≥ ${def.minimum}`
      : def.exclusiveMinimum !== undefined
        ? `> ${def.exclusiveMinimum}`
        : undefined;

  const maximum =
    def.maximum !== undefined
      ? `≤ ${def.maximum}`
      : def.exclusiveMaximum !== undefined
        ? `< ${def.exclusiveMaximum}`
        : undefined;
  return [minimum, maximum].filter(Boolean).join(', ') || undefined;
};

/**
 * Inference Parameters
 *
 * Lists the tunable inference (hyper)parameters the model accepts — e.g.
 * Temperature, Max Output Tokens, Top P — driven by the model detail
 * endpoint's `inference_parameters` map. Each row shows the parameter's
 * default, accepted range/type, and a short description.
 */
export const InferenceParameters = ({ model }: InferenceParametersProps) => {
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    setShowMore(false);
  }, [model?.id]);

  const parameters = model?.inferenceParameters
    ? Object.entries(model.inferenceParameters)
    : [];

  if (parameters.length === 0) {
    return null;
  }

  const primary = parameters.slice(0, VISIBLE_COUNT);
  const rest = parameters.slice(VISIBLE_COUNT);

  const renderParameter = (
    [key, def]: [string, InferenceParameterDef],
    index: number
  ) => {
    const range = formatRange(def);
    const rowClass =
      index % 2 === 1 ? `${styles.row} ${styles.rowAlt}` : styles.row;

    return (
      <Stack className={rowClass} key={key} spacing={4}>
        <Stack alignItems="center" direction="row" spacing={8}>
          <Typography className={styles.label} component="span">
            {def.label || key}
          </Typography>
          <Box className={styles.leader} component="span" />
          <Typography className={styles.value} component="span">
            {formatDefault(def.default)}
          </Typography>
        </Stack>

        <Stack
          className={styles.meta}
          direction="row"
          flexWrap="wrap"
          spacing={8}
        >
          <Box className={styles.metaChip} component="span">
            {def.type}
          </Box>
          {range && (
            <Box className={styles.metaChip} component="span">
              {range}
            </Box>
          )}
          {def.enum && def.enum.length > 0 && (
            <Box className={styles.metaChip} component="span">
              Options: {def.enum.map(String).join(', ')}
            </Box>
          )}
        </Stack>

        {def.description && (
          <Typography className={styles.description} component="span">
            {def.description}
          </Typography>
        )}
      </Stack>
    );
  };

  return (
    <Paper className={styles.paper}>
      <Typography className={styles.title} component="h3">
        Inference Parameters
      </Typography>

      <Stack spacing={0}>{primary.map(renderParameter)}</Stack>

      {rest.length > 0 && (
        <Button
          aria-controls="inference-parameters-more"
          aria-expanded={showMore}
          onClick={() => setShowMore((prev) => !prev)}
          style={{ padding: '8px 16px 0' }}
          variant="link"
        >
          <Typography className={styles.moreLabel} component="span">
            More
          </Typography>
          <ChevronDown
            height={18}
            style={{
              transform: showMore ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
            width={18}
          />
        </Button>
      )}

      {rest.length > 0 && (
        <Collapse id="inference-parameters-more" in={showMore}>
          <Stack spacing={0}>
            {rest.map((entry, i) => renderParameter(entry, i + VISIBLE_COUNT))}
          </Stack>
        </Collapse>
      )}
    </Paper>
  );
};
