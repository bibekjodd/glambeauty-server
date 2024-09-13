import { EnvType } from '@/config/env.config';

export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvType {
      //
    }
  }
}
