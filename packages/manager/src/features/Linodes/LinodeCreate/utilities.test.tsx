import {
  LinodeConfigInterfaceFactory,
  createLinodeRequestFactory,
} from 'src/factories';
import {
  linodeInterfaceFactoryPublic,
  linodeInterfaceFactoryVPC,
  linodeInterfaceFactoryVlan,
} from 'src/factories/linodeInterface';
import { base64UserData, userData } from 'src/utilities/metadata.test';

import {
  getInterfacesPayload,
  getIsLegacyInterfaceArray,
  getIsValidLinodeLabelCharacter,
  getLinodeCreatePayload,
  getLinodeLabelFromLabelParts,
  getTabIndex,
} from './utilities';

import type { LinodeCreateFormValues } from './utilities';

describe('getTabIndex', () => {
  it('should return 0 when there is no value specifying the tab', () => {
    expect(getTabIndex(undefined)).toBe(0);
  });
  it('should return 0 when the value is not a valid tab', () => {
    // @ts-expect-error We are intentionally passing an invalid value.
    expect(getTabIndex('fake tab')).toBe(0);
  });
  it('should return the correct index when the value is a valid tab', () => {
    expect(getTabIndex('Images')).toBe(3);
  });
});

describe('getLinodeCreatePayload', () => {
  it('should return a basic payload', () => {
    const values = createLinodeRequestFactory.build() as LinodeCreateFormValues;

    expect(getLinodeCreatePayload(values, false)).toEqual(values);
  });

  it('should base64 encode metadata', () => {
    const values = createLinodeRequestFactory.build({
      metadata: { user_data: userData },
    }) as LinodeCreateFormValues;

    expect(getLinodeCreatePayload(values, false)).toEqual({
      ...values,
      metadata: { user_data: base64UserData },
    });
  });

  it('should remove placement_group from the payload if no id exists', () => {
    const values = createLinodeRequestFactory.build({
      placement_group: {},
    }) as LinodeCreateFormValues;

    expect(getLinodeCreatePayload(values, false)).toEqual({
      ...values,
      placement_group: undefined,
    });
  });
});

describe('getInterfacesPayload', () => {
  it('should return undefined when there is no vpc or vlan', () => {
    expect(
      getInterfacesPayload(
        [
          {
            ipam_address: '',
            label: '',
            purpose: 'vpc',
          },
          {
            ipam_address: '',
            label: '',
            purpose: 'vlan',
          },
          {
            ipam_address: '',
            label: '',
            purpose: 'public',
          },
        ],
        false
      )
    ).toStrictEqual(undefined);
  });

  it('should return a public interface and a VLAN interface when a VLAN is selected', () => {
    expect(
      getInterfacesPayload(
        [
          {
            ipam_address: '',
            label: '',
            purpose: 'vpc',
          },
          {
            ipam_address: '',
            label: 'my-vlan',
            purpose: 'vlan',
          },
          {
            ipam_address: '',
            label: '',
            purpose: 'public',
          },
        ],
        false
      )
    ).toStrictEqual([
      {
        ipam_address: '',
        label: '',
        purpose: 'public',
      },
      {
        ipam_address: '',
        label: 'my-vlan',
        purpose: 'vlan',
      },
    ]);
  });

  it('should return a public interface and a VLAN interface when a VLAN is selected with a private IP', () => {
    expect(
      getInterfacesPayload(
        [
          {
            ipam_address: '',
            label: '',
            purpose: 'vpc',
          },
          {
            ipam_address: '',
            label: 'my-vlan',
            purpose: 'vlan',
          },
          {
            ipam_address: '',
            label: '',
            purpose: 'public',
          },
        ],
        true
      )
    ).toStrictEqual([
      {
        ipam_address: '',
        label: '',
        purpose: 'public',
      },
      {
        ipam_address: '',
        label: 'my-vlan',
        purpose: 'vlan',
      },
    ]);
  });

  it('should return a VPC interface if only a VPC is selected', () => {
    expect(
      getInterfacesPayload(
        [
          {
            ipam_address: '',
            label: '',
            // Confirms VPC interface passed in is returned as expected - VPC interfaces should be marked as primary if they exist
            primary: true,
            purpose: 'vpc',
            vpc_id: 5,
          },
          {
            ipam_address: '',
            label: '',
            purpose: 'vlan',
          },
          {
            ipam_address: '',
            label: '',
            purpose: 'public',
          },
        ],
        false
      )
    ).toStrictEqual([
      {
        ipam_address: '',
        label: '',
        primary: true,
        purpose: 'vpc',
        vpc_id: 5,
      },
    ]);
  });

  it('should return a VPC interface and a public interface if a VPC is selected and Private IP is enabled', () => {
    expect(
      getInterfacesPayload(
        [
          {
            ipam_address: '',
            label: '',
            primary: true,
            purpose: 'vpc',
            vpc_id: 5,
          },
          {
            ipam_address: '',
            label: '',
            purpose: 'vlan',
          },
          {
            ipam_address: '',
            label: '',
            purpose: 'public',
          },
        ],
        true
      )
    ).toStrictEqual([
      {
        ipam_address: '',
        label: '',
        primary: true,
        purpose: 'vpc',
        vpc_id: 5,
      },
      {
        ipam_address: '',
        label: '',
        purpose: 'public',
      },
    ]);
  });

  it('should return a VPC interface and a VLAN interface when both are specified (no private IP)', () => {
    expect(
      getInterfacesPayload(
        [
          {
            ipam_address: '',
            label: '',
            primary: true,
            purpose: 'vpc',
            vpc_id: 5,
          },
          {
            ipam_address: '',
            label: 'my-vlan',
            purpose: 'vlan',
          },
          {
            ipam_address: '',
            label: '',
            purpose: 'public',
          },
        ],
        false
      )
    ).toStrictEqual([
      {
        ipam_address: '',
        label: '',
        primary: true,
        purpose: 'vpc',
        vpc_id: 5,
      },
      {
        ipam_address: '',
        label: 'my-vlan',
        purpose: 'vlan',
      },
    ]);
  });

  it('should return a VPC, VLAN, and Public interface if a VPC is selcted, a VLAN is selected, and Private IP is enabled', () => {
    expect(
      getInterfacesPayload(
        [
          {
            ipam_address: '',
            label: '',
            primary: true,
            purpose: 'vpc',
            vpc_id: 5,
          },
          {
            ipam_address: '',
            label: 'my-vlan',
            purpose: 'vlan',
          },
          {
            ipam_address: '',
            label: '',
            purpose: 'public',
          },
        ],
        true
      )
    ).toStrictEqual([
      {
        ipam_address: '',
        label: '',
        primary: true,
        purpose: 'vpc',
        vpc_id: 5,
      },
      {
        ipam_address: '',
        label: 'my-vlan',
        purpose: 'vlan',
      },
      {
        ipam_address: '',
        label: '',
        purpose: 'public',
      },
    ]);
  });
});

describe('getIsLegacyInterfaceArray', () => {
  it('determines the given interfaces are legacy', () => {
    const legacyInterfaces = LinodeConfigInterfaceFactory.buildList(3);
    expect(getIsLegacyInterfaceArray(legacyInterfaces)).toBe(true);
    expect(getIsLegacyInterfaceArray(undefined)).toBe(true);
    expect(getIsLegacyInterfaceArray([])).toBe(true);
  });

  it('returns false if the given interfaces are new Linode Interfaces', () => {
    const linodeInterfacesVlan = linodeInterfaceFactoryVlan.buildList(3);
    expect(getIsLegacyInterfaceArray(linodeInterfacesVlan)).toBe(false);

    const linodeInterfacesVPC = linodeInterfaceFactoryVPC.buildList(3);
    expect(getIsLegacyInterfaceArray(linodeInterfacesVPC)).toBe(false);

    const linodeInterfacesPublic = linodeInterfaceFactoryPublic.buildList(3);
    expect(getIsLegacyInterfaceArray(linodeInterfacesPublic)).toBe(false);
  });
});

describe('getLinodeLabelFromLabelParts', () => {
  it('should join items', () => {
    expect(getLinodeLabelFromLabelParts(['my-linode', 'us-east'])).toBe(
      'my-linode-us-east'
    );
  });
  it('should not include special characters in the generated label', () => {
    expect(getLinodeLabelFromLabelParts(['redis&app', 'us-east'])).toBe(
      'redisapp-us-east'
    );
  });
  it('should replace spaces with a -', () => {
    expect(getLinodeLabelFromLabelParts(['banks test'])).toBe('banks-test');
  });
  it('should not generate consecutive - _ or .', () => {
    expect(getLinodeLabelFromLabelParts(['banks - test', 'us-east'])).toBe(
      'banks-test-us-east'
    );
  });
  it('should ensure the generated label is less than 64 characters', () => {
    const linodeLabel = 'a'.repeat(64);
    const region = 'us-east';

    expect(getLinodeLabelFromLabelParts([linodeLabel, region])).toBe(
      'a'.repeat(31) + '-us-east'
    );
  });
});

describe('getIsValidLinodeLabelCharacter', () => {
  it('should allow a-z characters', () => {
    expect(getIsValidLinodeLabelCharacter('a')).toBe(true);
    expect(getIsValidLinodeLabelCharacter('z')).toBe(true);
  });
  it('should allow A-Z characters', () => {
    expect(getIsValidLinodeLabelCharacter('A')).toBe(true);
    expect(getIsValidLinodeLabelCharacter('Z')).toBe(true);
  });
  it('should allow 0-9 characters', () => {
    expect(getIsValidLinodeLabelCharacter('0')).toBe(true);
    expect(getIsValidLinodeLabelCharacter('9')).toBe(true);
  });
  it('should not allow special characters', () => {
    expect(getIsValidLinodeLabelCharacter('&')).toBe(false);
    expect(getIsValidLinodeLabelCharacter('!')).toBe(false);
    expect(getIsValidLinodeLabelCharacter(' ')).toBe(false);
  });
});
