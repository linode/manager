namespace Linode {
  export interface LinodeType {
    id: string;
    disk: number;
    class: LinodeTypeClass;
    price: PriceObject;
    successor: string | null;
    label: string;
    addons: {
      backups: { price: PriceObject };
    };
    network_out: number;
    memory: number;
    transfer: number;
    vcpus: number;
  }

  type LinodeTypeClass = 'nanode' | 'standard' | 'highmem';
}
