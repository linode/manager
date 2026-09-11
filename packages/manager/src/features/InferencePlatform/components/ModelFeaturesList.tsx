import React from 'react';

import { ModelFeatureChip } from './ModelFeatureChip';
import styles from './ModelFeaturesList.module.css';

import type { Model } from '../ModelLibrary/modelLibrary.types';

interface ModelFeaturesListProps {
  /** Show input modality chips. */
  inputMode?: boolean;
  model?: Model;
  /** Show output modality chips. */
  outputMode?: boolean;
  /** Show provider chip. */
  provider?: boolean;
  /** Show use-case tag chips. */
  useCase?: boolean;
}

/**
 * Renders a horizontal list of ModelFeatureChips for a given model.
 * Chip colours are defined by each chip's type in ModelFeatureChip.
 * Order: provider → useCase → inputMode → outputMode.
 */
export const ModelFeaturesList = ({
  inputMode = true,
  model,
  outputMode = true,
  provider = true,
  useCase = true,
}: ModelFeaturesListProps) => {
  if (!model) return null;

  return (
    <div className={styles.list}>
      {provider && model.providerName && (
        <ModelFeatureChip
          key={`provider-${model.providerName}`}
          label={model.providerName}
          type="provider"
        />
      )}

      {useCase &&
        model.useCaseTags.map((tag) => (
          <ModelFeatureChip
            key={`useCase-${tag.label}`}
            label={tag.label}
            type="useCaseTags"
          />
        ))}

      {inputMode &&
        model.inputModes.map((mode) => (
          <ModelFeatureChip
            key={`input-${mode.label}`}
            label={mode.label}
            type="inputModes"
          />
        ))}

      {outputMode &&
        model.outputModes.map((mode) => (
          <ModelFeatureChip
            key={`output-${mode.label}`}
            label={mode.label}
            type="outputModes"
          />
        ))}
    </div>
  );
};
