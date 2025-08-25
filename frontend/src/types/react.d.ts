/// <reference types="react" />

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'react' {
  import * as React from 'react'
  
  export = React
  export as namespace React
  
  export type FC<P = {}> = React.FunctionComponent<P>
  export interface FunctionComponent<P = {}> {
    (props: P, context?: any): React.ReactElement<any, any> | null
    displayName?: string
  }
} 