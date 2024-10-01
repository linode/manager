import React, { useMemo, useState } from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { Typography } from 'src/components/Typography';
import { LD_DX_TOOLS_METRICS_KEYS } from 'src/constants';
import { generateGoLinodeSnippet } from 'src/utilities/codesnippets/generate-goSDKSnippet';
import { generatePythonLinodeSnippet } from 'src/utilities/codesnippets/generate-pythonSDKSnippet';

import { CodeBlock } from './CodeBlock/CodeBlock';
import { GoSDKResources } from './GoSDKResources';
import { PythonSDKResources } from './PythonSDKResources';

import type { OptionType } from './IntegrationsTabPanel';
import type { CreateLinodeRequest } from '@linode/api-v4/lib/linodes';

export interface SDKTabPanelProps {
  payLoad: CreateLinodeRequest;
  title: string;
}

const sdkOptions: OptionType[] = [
  { label: 'Go (linodego)', value: 'go' },
  { label: 'Python (linode_api4-python)', value: 'python' },
];

export const SDKTabPanel = ({ payLoad, title }: SDKTabPanelProps) => {
  const [selectedSDK, setSelectedSDK] = useState<OptionType | undefined>();

  const linodegoSnippet = useMemo(() => generateGoLinodeSnippet(payLoad), [
    payLoad,
  ]);

  const pythonLinodeSnippet = useMemo(
    () => generatePythonLinodeSnippet(payLoad),
    [payLoad]
  );

  const handleSDKChange = (option: OptionType) => {
    setSelectedSDK(option);
  };

  return (
    <SafeTabPanel index={3}>
      <Typography variant="body1">
        Linode developed and supported libraries give you programmatic access to
        the Linode platform, allowing you to automate tasks through a
        fully-documented REST API.
      </Typography>
      <Autocomplete
        disableClearable
        label="Software Developer Kits (SDK)"
        onChange={(_, option) => handleSDKChange(option)}
        options={sdkOptions}
        placeholder="Select An SDK"
        value={selectedSDK}
      />
      {selectedSDK && (
        <>
          {selectedSDK.value === 'go' ? (
            <GoSDKResources />
          ) : (
            <PythonSDKResources />
          )}
          <CodeBlock
            command={
              selectedSDK.value === 'go' ? linodegoSnippet : pythonLinodeSnippet
            }
            ldTrackingKey={
              selectedSDK.value === 'go'
                ? LD_DX_TOOLS_METRICS_KEYS.SDK_GO_CODE_SNIPPET
                : LD_DX_TOOLS_METRICS_KEYS.SDK_PYTHON_CODE_SNIPPET
            }
            commandType={title}
            language={'bash'}
          />
        </>
      )}
    </SafeTabPanel>
  );
};
