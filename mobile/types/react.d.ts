// React type declarations
declare module 'react' {
  export interface ComponentType<P = {}> {
    (props: P, context?: any): React.ReactElement<any, any> | null;
    propTypes?: any;
    contextTypes?: any;
    defaultProps?: Partial<P>;
    displayName?: string;
  }

  export interface ReactElement<P = any, T extends string | ComponentType<any> = string | ComponentType<any>> {
    type: T;
    props: P;
    key: React.Key | null;
  }

  export interface ReactNode {
    // Empty interface to represent React children
  }

  export type Key = string | number;

  export function createElement<P>(
    type: ComponentType<P> | string,
    props?: P,
    ...children: ReactNode[]
  ): ReactElement<P>;

  export interface Component<P = {}, S = {}> {
    props: Readonly<P>;
    state: Readonly<S>;
    render(): ReactElement | null;
  }

  export class Component<P = {}, S = {}> implements Component<P, S> {
    constructor(props: P);
  }

  export default React;
}

declare namespace React {
  type ReactElement<P = any, T extends string | ComponentType<any> = string | ComponentType<any>> = {
    type: T;
    props: P;
    key: Key | null;
  };

  type ReactNode = ReactElement | string | number | boolean | null | undefined | ReactNode[];
  type Key = string | number;
  type ComponentType<P = {}> = (props: P) => ReactElement | null;
}

export = React;
export as namespace React;
