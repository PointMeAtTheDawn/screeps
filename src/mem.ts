import { log } from "./lib/logger/log";
export const MemoryVersion = 1;

export const enum CreepRoles {
  ROLE_UNASSIGNED = 0,
  ROLE_ALL,
  ROLE_BUILDER,
  ROLE_MINER
}

export function roleToString(job: CreepRoles): string {
  switch (job) {
    case CreepRoles.ROLE_BUILDER:
      return "ROLE_BUILDER";
    case CreepRoles.ROLE_MINER:
      return "ROLE_MINER";
    default:
      return "unknown role";
  }
}

export interface GameMemory {
  memVersion: number | undefined;
  uuid: number;
  log: any;
  //Profiler: Profiler;

  creeps: {
    [name: string]: any;
  };

  flags: {
    [name: string]: any;
  };

  rooms: {
    [name: string]: RoomMemory;
  };

  spawns: {
    [name: string]: any;
  };
}

export interface MyCreepMemory {
  name: string;
  role: CreepRoles;
  roleString: string;
  job: string;
}

export function cm(creep: Creep): MyCreepMemory {
  return (creep.memory as unknown) as MyCreepMemory;
}

export function m(): GameMemory {
  return (Memory as any) as GameMemory;
}

export function l(cmLog: MyCreepMemory): string {
  return `${cmLog.name}: `;
}
