import { IideProxyImpl } from './libs/types/ideProxyImpl';

declare module 'ide' {
  export let ideProxyImpl: IideProxyImpl;
}
