import * as Config from "config";
import * as harvester from "./role.harvester";
import * as builder from "./role.builder";
import { log } from "./lib/logger/log";
import { profileRecord } from "./lib/Profiler";
import { bodies } from "./creepBodies";

export let creeps: Creep[];
export let creepCount: number = 0;
export let harvesters: Creep[] = [];
export let builders: Creep[] = [];

export function run(room: Room): void {
  profileRecord("_loadCreeps", true);
  _loadCreeps(room);
  +profileRecord("_loadCreeps", false);

  if (Game.time % 100 === 0) {
    log.debug(`Harvesters ${harvesters.length}, Builders ${builders.length}`);
    log.debug(`Progress ${room.controller?.progress}`);
  }


  profileRecord("_buildMissingCreeps", true);
  _buildMissingCreeps(room);
  profileRecord("_buildMissingCreeps", false);

  _.each(creeps, (creep: Creep) => {
    if (creep.memory.role === "harvester") {
      profileRecord("harvester.run", true);
      harvester.run(creep);
      profileRecord("harvester.run", false);
    }
    if (creep.memory.role === "builder" || creep.memory.role === "upgrader") {
      profileRecord("builder.run", true);
      builder.run(creep);
      profileRecord("builder.run", false);
    }
  });
}

function _loadCreeps(room: Room) {
  creeps = room.find<FIND_MY_CREEPS>(FIND_MY_CREEPS);
  creepCount = _.size(creeps);
  harvesters = _.filter(creeps, creep => creep.memory.role === "harvester");
  builders = _.filter(creeps, creep => creep.memory.role === "builder" || creep.memory.role === "upgrader");
}

function _buildMissingCreeps(room: Room) {
  let bodyParts: BodyPartConstant[];

  const spawns: Spawn[] = room.find<Spawn>(FIND_MY_SPAWNS, {
    filter: (spawn: Spawn) => {
      return spawn.spawning === null;
    }
  });

  if (harvesters.length < 4) {
    if (harvesters.length < 2) {
      bodyParts = _buildCreep("harvester", 300);
    } else {
      bodyParts = _buildCreep("harvester", room.energyCapacityAvailable);
    }

    _.each(spawns, (spawn: Spawn) => {
      _spawnCreep(spawn, bodyParts, "harvester");
    });
    return;
  }

  let toBuild: number = 2;
  if (room.find(FIND_CONSTRUCTION_SITES).length > 0) {
    toBuild = 3;
  }

  if (builders.length < toBuild) {
    bodyParts = _buildCreep("builder", room.energyCapacityAvailable);
    _.each(spawns, (spawn: Spawn) => {
      _spawnCreep(spawn, bodyParts, "builder");
    });
    return;
  }

}

function _buildCreep(role: string, capacity: number): BodyPartConstant[] {
  return bodies[capacity];
}

function _spawnCreep(spawn: Spawn, bodyParts: BodyPartConstant[], role: string) {
  const uuid: number = Memory.uuid;
  let status: number | string = spawn.spawnCreep(bodyParts, "unused", { dryRun: true });

  const properties: { [key: string]: any } = {
    memory: { role,
    working: false },
    room: spawn.room.name
  };

  status = _.isString(status) ? OK : status;
  if (status === OK) {
    Memory.uuid = uuid + 1;
    const creepName: string = spawn.room.name + " - " + role + uuid;

    log.info("Started creating new creep: " + creepName);
    if (Config.ENABLE_DEBUG_MODE) {
      log.info("Body: " + bodyParts);
    }

    status = spawn.spawnCreep(bodyParts, creepName, properties);

    return _.isString(status) ? OK : status;
  } else {
    if (Config.ENABLE_DEBUG_MODE && status !== ERR_NOT_ENOUGH_ENERGY) {
      log.info("Failed creating new creep: " + status);
    }

    return status;
  }
}
