// example declaration file - remove these and add your own custom typings

// memory extension samples
interface CreepMemory {
  role: string;
  target: string;
  room: string;
  working: boolean;
  job: string;
}

interface Memory {
  uuid: number;
  log: any;
}

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any;
    Profiler: Profiler;
  }
}

declare const __REVISION__: string;
