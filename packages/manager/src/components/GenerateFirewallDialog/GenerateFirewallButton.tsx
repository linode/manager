import { useQueryClient } from '@tanstack/react-query';
import React from 'react';

import { useCreateFirewall } from 'src/queries/firewalls';
import { firewallQueries } from 'src/queries/firewalls';

import { Button } from '../Button/Button';

import type { ButtonProps } from '../Button/Button';
import type { DialogState } from './GenerateFirewallDialog';
import type {
  CreateFirewallPayload,
  Firewall,
  FirewallTemplate,
} from '@linode/api-v4';
import type { QueryClient } from '@tanstack/react-query';

export const GenerateButton = (
  props: ButtonProps & {
    onFirewallGenerated?: (firewall: Firewall) => void;
    setDialogState: (state: DialogState) => void;
  }
) => {
  const { onFirewallGenerated, setDialogState } = props;
  const queryClient = useQueryClient();
  const { mutateAsync: createFirewall } = useCreateFirewall();
  const onClick = () =>
    createFirewallFromTemplate({
      createFirewall,
      queryClient,
      updateProgress: (progress: number) =>
        setDialogState({ progress, step: 'progress' }),
    })
      .then((firewall) => {
        onFirewallGenerated?.(firewall);
        setDialogState({
          firewall,
          step: 'success',
        });
      })
      .catch((error) =>
        setDialogState({
          error: error?.[0]?.reason ?? error,
          step: 'error',
        })
      );

  return <Button onClick={onClick} {...props} />;
};

const createFirewallFromTemplate = async (handlers: {
  createFirewall: (firewall: CreateFirewallPayload) => Promise<Firewall>;
  queryClient: QueryClient;
  updateProgress: (progress: number | undefined) => void;
}): Promise<Firewall> => {
  const { createFirewall, queryClient, updateProgress } = handlers;
  updateProgress(0);

  // Get firewall template
  const template = await getFirewallTemplate(queryClient);
  updateProgress(30);

  // Determine new firewall name
  const firewallLabel = await getUniqueFirewallLabel(queryClient, template);
  updateProgress(80);

  // Create new firewall
  return await createFirewall({ label: firewallLabel, rules: template.rules });
};

const getFirewallTemplate = async (queryClient: QueryClient) => {
  const templates = await queryClient.fetchQuery(firewallQueries.templates);
  if (templates.length < 1) {
    throw Error('No firewall templates are available.');
  }
  return templates[0];
};

const getUniqueFirewallLabel = async (
  queryClient: QueryClient,
  template: FirewallTemplate
) => {
  const firewalls = await queryClient.fetchQuery(
    firewallQueries.firewalls._ctx.all
  );
  let iterator = 1;
  const firewallLabelExists = (firewall: Firewall) =>
    firewall.label === firewallLabelFromSlug(template.slug, iterator);
  while (firewalls.some(firewallLabelExists)) {
    iterator++;
  }

  return firewallLabelFromSlug(template.slug, iterator);
};

const firewallLabelFromSlug = (slug: string, iterator: number) => {
  const iteratorSuffix = `-${iterator}`;
  return slug.substring(0, 32 - iteratorSuffix.length) + iteratorSuffix;
};
