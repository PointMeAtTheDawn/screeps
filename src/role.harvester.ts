import { log } from "./lib/logger/log";

export function run(creep: Creep): void {

  if (creep.memory.working === false) {
    if (creep.store.getFreeCapacity() === 0) {
      creep.memory.working = true;
      _work(creep);
    } else {
      _moveToHarvest(creep);
    }
  } else {
    if (creep.store.getUsedCapacity() === 0) {
      creep.memory.working = false;
      _moveToHarvest(creep);
    } else {
      _work(creep);
    }
  }
}

function _work(creep: Creep) {
  const spawn = creep.room.find<Spawn>(FIND_MY_SPAWNS)[0];
  if (spawn.store.getFreeCapacity(RESOURCE_ENERGY) !== 0) {
    _moveToDropEnergy(creep, spawn);
    return;
  }
  const extensions = creep.room.find<FIND_MY_STRUCTURES>(FIND_MY_STRUCTURES).filter(s => {return s.structureType === STRUCTURE_EXTENSION}) as StructureExtension[];
  const extensionsToFill = extensions.filter(e => e.store.getFreeCapacity(RESOURCE_ENERGY) !== 0);
  if (extensionsToFill.length > 0) {
    _moveToDropEnergy(creep, creep.pos.findClosestByPath(extensionsToFill));
    return;
  }

  const containers = creep.room.find<FIND_STRUCTURES>(FIND_STRUCTURES).filter(s => {return s.structureType === STRUCTURE_CONTAINER}) as StructureContainer[];
  const containersToFill = containers.filter(e => e.store.getFreeCapacity(RESOURCE_ENERGY) !== 0);
  if (containersToFill.length > 0) {
    _moveToDropEnergy(creep, creep.pos.findClosestByPath(containersToFill));
    return;
  }
  const towers = creep.room.find(FIND_MY_STRUCTURES).filter(s => s.structureType === STRUCTURE_TOWER);
  const tower = creep.pos.findClosestByRange(towers);
  if (tower) {
    creep.moveTo(tower);
  }
}

function _tryHarvest(creep: Creep, target: Source): number {
  return creep.harvest(target);
}

function _moveToHarvest(creep: Creep): void {
  const spawn = creep.room.find<Spawn>(FIND_MY_SPAWNS)[0];
  const close = spawn.pos.findClosestByRange<FIND_SOURCES_ACTIVE>(FIND_SOURCES_ACTIVE);
  const far = creep.room.find<FIND_SOURCES_ACTIVE>(FIND_SOURCES_ACTIVE).filter(s => s !== close)[0];
  if (far != null) {
    if (_tryHarvest(creep, far) === ERR_NOT_IN_RANGE) {
      creep.moveTo(far.pos);
    }
  }
}

function _tryEnergyDropOff(creep: Creep, target: Spawn | Structure): number {
  return creep.transfer(target, RESOURCE_ENERGY);
}

function _moveToDropEnergy(creep: Creep, target?: Spawn | Structure | null): void {
  if (target) {
    if (_tryEnergyDropOff(creep, target) === ERR_NOT_IN_RANGE) {
      creep.moveTo(target.pos);
    }
  }
}
