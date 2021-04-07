export function run(creep: Creep): void {
  const close = creep.pos.findClosestByRange<FIND_SOURCES_ACTIVE>(FIND_SOURCES_ACTIVE);
  const sites = creep.room.find<FIND_CONSTRUCTION_SITES>(FIND_CONSTRUCTION_SITES);

  if (close != null && creep.store.getFreeCapacity() !== 0 && _tryHarvest(creep, close) === 0) {return}
  if (sites.length > 0 && creep.store.getUsedCapacity(RESOURCE_ENERGY) !== 0 && _tryBuild(creep, sites[0]) === 0) {return}

  if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0 && close != null) {
    _moveToHarvest(creep, close);
    return;
  }

  if (creep.room.controller && creep.room.controller.ticksToDowngrade < 100) {
    _moveToUpgrade(creep, creep.room.controller);
    return;
  }

  if (sites.length > 0) {
    _moveToBuild(creep, sites[0]);
    return;
  }

  if (creep.room.controller) {
    _moveToUpgrade(creep, creep.room.controller);
  }
}

function _tryBuild(creep: Creep, target: ConstructionSite): number {
  return creep.build(target);
}

function _moveToBuild(creep: Creep, target: ConstructionSite): void {
  if (_tryBuild(creep, target) === ERR_NOT_IN_RANGE) {
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

function _moveToHarvest(creep: Creep, target: Source): void {
  if (_tryHarvest(creep, target) === ERR_NOT_IN_RANGE) {
    creep.moveTo(target.pos);
  }
}
