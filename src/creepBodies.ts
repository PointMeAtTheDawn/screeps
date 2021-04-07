export let bodies: CreepBodies = {
    300: [WORK, WORK, CARRY, MOVE],
    350: [WORK, WORK, CARRY, CARRY, MOVE],
    400: [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
    450: [WORK, WORK, WORK, CARRY, MOVE, MOVE],
    500: [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE],
    550: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE]
}

interface CreepBodies {
    [capacity: number] : BodyPartConstant[]
}
