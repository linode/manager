// FIXME checkout https://mui.com/components/use-media-query/#migrating-from-withwidth
const withWidth = () => (WrappedComponent) => (props) => <WrappedComponent {...props} width="xs" />;

/* tslint:disable-next-line:no-empty-interface */
export interface WithWidth extends _WithWidth {}

export default withWidth;
