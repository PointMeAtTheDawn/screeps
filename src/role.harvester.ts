import { log } from "./lib/logger/log";

export function run(creep: Creep): void {
  const spawn = creep.room.find<Spawn>(FIND_MY_SPAWNS)[0];
  const close = spawn.pos.findClosestByRange<FIND_SOURCES_ACTIVE>(FIND_SOURCES_ACTIVE);
  const far = creep.room.find<FIND_SOURCES_ACTIVE>(FIND_SOURCES_ACTIVE).filter(s => s !== close)[0];

  if (creep.store.getFreeCapacity() === 0) {
    if (spawn.store.getFreeCapacity(RESOURCE_ENERGY) !== 0) {
      _moveToDropEnergy(creep, spawn);
    } else {
      const structures = creep.room.find(FIND_MY_STRUCTURES);
      const extensions = creep.room.find(FIND_MY_STRUCTURES).filter(s => {return s.structureType === STRUCTURE_EXTENSION}) as StructureExtension[];
      const extensionsToFill = extensions.filter(e => e.store.getFreeCapacity(RESOURCE_ENERGY) !== 0);
      if (extensionsToFill.length > 0) {
        _moveToDropEnergy(creep, extensionsToFill[0]);
      }
    }
    return;
  } else {
    if (far != null) {
      _moveToHarvest(creep, far);
    }
  }
}

function _tryHarvest(creep: Creep, target: Source): number {
  return creep.harvest(target);
}

function _moveToHarvest(creep: Creep, target: Source): void {
  if (_tryHarvest(creep, target) === ERR_NOT_IN_RANGE) {
    creep.moveTo(target.pos);
  }
}

function _tryEnergyDropOff(creep: Creep, target: Spawn | Structure): number {
  return creep.transfer(target, RESOURCE_ENERGY);
}

function _moveToDropEnergy(creep: Creep, target: Spawn | Structure): void {
  if (_tryEnergyDropOff(creep, target) === ERR_NOT_IN_RANGE) {
    creep.moveTo(target.pos);
  }
}
