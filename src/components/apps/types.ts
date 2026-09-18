import type { AppId } from '@/content/eras';

/** What every app component receives from the window it runs in. */
export interface AppProps {
  appId: AppId;
}
