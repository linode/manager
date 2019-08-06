import * as React from 'react';
import ExpansionPanel from 'src/components/ExpansionPanel';
import useFlags from 'src/hooks/useFlags';

interface Props {
  promotions: Linode.ActivePromotions[];
}

export type CombinedProps = Props;

export const PromotionsPanel: React.FC<Props> = props => {
  const flags = useFlags();
  if (!flags.promos) {
    return null;
  }
  return (
    <ExpansionPanel heading={'Promotions & Credits'}>Yo there</ExpansionPanel>
  );
};

export default PromotionsPanel;
