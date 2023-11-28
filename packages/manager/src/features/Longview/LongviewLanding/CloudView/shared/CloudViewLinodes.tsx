import * as React from 'react';
import { useLinodesQuery } from 'src/queries/linodes/linodes';
import { Linode } from '@linode/api-v4';
import { LinodeSelect } from 'src/features/Linodes/LinodeSelect/LinodeSelect';

interface ICloudViewLinode {
  handleLinodeChange: (linodeId: number | undefined, isLoading: boolean,
    isError: boolean) => void;
}

export const CloudViewLinodes = React.memo((props: ICloudViewLinode) => {

  const { data: linodes, isLoading, isError } = useLinodesQuery();

  const linodesList: Linode[] | undefined = linodes?.data;

  const [selectedLinodeId, setLinodeId] = React.useState<number>();
 
  React.useEffect(() => {
    linodesList?.length ? 
    handleChange(linodesList[0]) : 
    props.handleLinodeChange(undefined, isLoading, isError);
  },[linodesList]);

  const handleChange = (linode: Linode ) => {
      setLinodeId(linode?.id);
      const selectedLinode: number | undefined = linode?.id;
      props.handleLinodeChange(selectedLinode, isLoading, isError);
  }

  return (
    <LinodeSelect
      onSelectionChange={handleChange}
      clearable={false}
      value={selectedLinodeId ?? null}
    />
  );
});

