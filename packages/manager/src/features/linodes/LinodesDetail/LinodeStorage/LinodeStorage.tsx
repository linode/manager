import * as React from 'react';
/* -- Clanode Change -- */
// import LinodeDisks from '../LinodeAdvanced/LinodeDisks';
/* -- Clanoe Change End -- */
import LinodeVolumes from 'src/features/linodes/LinodesDetail/LinodeAdvanced/LinodeVolumes';

export const LinodeStorage: React.FC = () => {
  return (
    <>
      {/* -- Clanode Change -- */
      /* <LinodeDisks /> */
      /* -- Clanode Change End -- */}
      <LinodeVolumes />
    </>
  );
};

export default LinodeStorage;
