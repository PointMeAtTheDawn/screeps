import { log } from "./lib/logger/log";

export function run(creep: Creep): void {
  const spawn = creep.room.find<Spawn>(FIND_MY_SPAWNS)[0];
  const source = creep.pos.findClosestByRange<FIND_SOURCES_ACTIVE>(FIND_SOURCES_ACTIVE);

  if (creep.memory.working === false) {
    if (creep.store.getFreeCapacity() === 0) {
      creep.memory.working = true;
      _work(creep, spawn);
    } else {
      _moveToHarvest(creep, source);
    }
  } else {
    if (creep.store.getUsedCapacity() === 0) {
      creep.memory.working = false;
      _moveToHarvest(creep, source);
    } else {
      _work(creep, spawn);
    }
  }
}

function _work(creep: Creep, spawn: Spawn) {
  if (_upgradeIfLow(creep)) {creep.memory.job = "UL";return}
  if (_repairIfLow(creep)) {creep.memory.job = "R";return}
  if (_buildThings(creep))  {creep.memory.job = "B";return}
  _upgradeController(creep); {creep.memory.job = "U";return}
}

function _upgradeIfLow(creep: Creep): boolean {
  if (!creep.room.controller || creep.room.controller.ticksToDowngrade > 7000) {
    return false;
  }

  if (_tryUpgrade(creep, creep.room.controller) === 0) {
    return true;
  }

  if (creep.room.controller.ticksToDowngrade < 100) {
    _moveToUpgrade(creep, creep.room.controller);
    return true;
  }

  return false;
}

type Repairable =
  | StructureRoad
  | StructureContainer
  | StructureRampart;

function _repairIfLow(creep: Creep): boolean {
  let repairables = creep.room.find<FIND_STRUCTURES>(FIND_STRUCTURES).filter(s => s.structureType === STRUCTURE_ROAD || s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_RAMPART) as Repairable[];
  repairables = repairables.filter(r => r.hits/r.hitsMax < _getRepairRatio());
  if (repairables.length > 0) {
    const toRepair = creep.pos.findClosestByPath(repairables);
    if (toRepair) {
      _moveToRepair(creep, toRepair);
      return true;
    }
  }
  return false;
}

function _getRepairRatio(): number {
  let rem = Game.time % 10000;
  if (0 < rem && rem < 100 ) {
    return .9
  }
  return .1;
}

function _buildThings(creep: Creep): boolean {
  const sites = creep.room.find<FIND_CONSTRUCTION_SITES>(FIND_CONSTRUCTION_SITES);

  if (sites.length > 0) {
    const toBuild = creep.pos.findClosestByPath(sites);
    if (toBuild) {
      _moveToBuild(creep, toBuild);
      return true;
    }
  }
  return false;
}

function _upgradeController(creep: Creep): boolean {
  if (creep.room.controller) {
    if (_tryUpgrade(creep, creep.room.controller) === 0) {
      return true;
    }
    _moveToUpgrade(creep, creep.room.controller);
    return true;
  }
  return false;
}

function _tryBuild(creep: Creep, target: ConstructionSite): number {
  return creep.build(target);
}

function _moveToBuild(creep: Creep, target: ConstructionSite): void {
  if (_tryBuild(creep, target) === ERR_NOT_IN_RANGE) {
    creep.moveTo(target.pos);
  }
}

function _tryRepair(creep: Creep, target: Repairable): number {
  return creep.repair(target);
}

function _moveToRepair(creep: Creep, target: Repairable): void {
  if (_tryRepair(creep, target) === ERR_NOT_IN_RANGE) {
    creep.moveTo(target.pos);
  }
}

function _tryUpgrade(creep: Creep, target: StructureController): number {
  return creep.upgradeController(target);
}

function _moveToUpgrade(creep: Creep, target: StructureController): void {
  if (_tryUpgrade(creep, target) === ERR_NOT_IN_RANGE) {
    creep.moveTo(target.pos);
  }
}

function _tryHarvest(creep: Creep, target: Source): number {
  return creep.harvest(target);
}

function _moveToHarvest(creep: Creep, target?: Source | null): void {
  if (!target) return;
  if (_tryHarvest(creep, target) === ERR_NOT_IN_RANGE) {
    creep.moveTo(target.pos);
  }
}
