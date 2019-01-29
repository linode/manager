import * as CSS from 'csstype';

declare module 'csstype' {
  interface Properties<TLength = string | 0>
    extends CSS.StandardProperties<TLength>,
      CSS.VendorProperties<TLength>,
      CSS.ObsoleteProperties<TLength>,
      CSS.SvgProperties<TLength> {
    position?: any;
  }
}
