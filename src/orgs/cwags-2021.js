import { buildFollowers } from '../core/rules.js';
import { equipmentPlacementConflicts } from '../core/geometry.js';

const signs = {
  "S1": {
    "id": "S1",
    "name": "Right Turn",
    "category": "turn",
    "stationary": false,
    "equipment": null,
    "maxUses": 2,
    "motion": {
      "turnDelta": 90,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF",
      "Z1",
      "Z15",
      "Z2"
    ]
  },
  "S2": {
    "id": "S2",
    "name": "Left Turn",
    "category": "turn",
    "stationary": false,
    "equipment": null,
    "maxUses": 2,
    "motion": {
      "turnDelta": -90,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF",
      "Z1",
      "Z15",
      "Z2"
    ]
  },
  "S3": {
    "id": "S3",
    "name": "270° Right",
    "category": "turn",
    "stationary": false,
    "equipment": null,
    "maxUses": 2,
    "motion": {
      "turnDelta": -90,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF",
      "Z1",
      "Z15",
      "Z2"
    ]
  },
  "S4": {
    "id": "S4",
    "name": "270° Left",
    "category": "turn",
    "stationary": false,
    "equipment": null,
    "maxUses": 2,
    "motion": {
      "turnDelta": 90,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF",
      "Z1",
      "Z15",
      "Z2"
    ]
  },
  "S5": {
    "id": "S5",
    "name": "Halt–Pivot Right–Halt",
    "category": "halt",
    "stationary": true,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF"
    ]
  },
  "S6": {
    "id": "S6",
    "name": "Halt–Pivot Right–Forward",
    "category": "halt",
    "stationary": true,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF"
    ]
  },
  "S7": {
    "id": "S7",
    "name": "Right About Turn",
    "category": "turn",
    "stationary": false,
    "equipment": null,
    "maxUses": 2,
    "motion": {
      "turnDelta": 180,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF",
      "Z1",
      "Z15",
      "Z2"
    ]
  },
  "S8": {
    "id": "S8",
    "name": "About U Turn",
    "category": "turn",
    "stationary": false,
    "equipment": null,
    "maxUses": 2,
    "motion": {
      "turnDelta": 180,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF",
      "Z1",
      "Z15",
      "Z2"
    ]
  },
  "S9": {
    "id": "S9",
    "name": "Halt–Stand",
    "category": "halt",
    "stationary": true,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF"
    ]
  },
  "S10": {
    "id": "S10",
    "name": "Halt–Down",
    "category": "halt",
    "stationary": true,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF"
    ]
  },
  "S11": {
    "id": "S11",
    "name": "Halt–Walk Around",
    "category": "halt",
    "stationary": true,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF"
    ]
  },
  "S12": {
    "id": "S12",
    "name": "Halt–Down–Walk Around",
    "category": "halt",
    "stationary": true,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF"
    ]
  },
  "S13": {
    "id": "S13",
    "name": "Halt–1, 2, 3 Steps Forward",
    "category": "halt",
    "stationary": true,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF"
    ]
  },
  "S14": {
    "id": "S14",
    "name": "Call Front",
    "category": "front",
    "stationary": false,
    "equipment": null,
    "maxUses": 2,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF"
    ]
  },
  "S15": {
    "id": "S15",
    "name": "Forward Right",
    "category": "front",
    "stationary": false,
    "equipment": null,
    "maxUses": 2,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF"
    ]
  },
  "S16": {
    "id": "S16",
    "name": "Forward Left",
    "category": "front",
    "stationary": false,
    "equipment": null,
    "maxUses": 2,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF"
    ]
  },
  "S17": {
    "id": "S17",
    "name": "1, 2, 3 Steps Back",
    "category": "front",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF"
    ]
  },
  "S18": {
    "id": "S18",
    "name": "Slow",
    "category": "pace",
    "stationary": false,
    "equipment": null,
    "maxUses": 2,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF",
      "Z1",
      "Z15",
      "Z2"
    ]
  },
  "S19": {
    "id": "S19",
    "name": "Fast",
    "category": "pace",
    "stationary": false,
    "equipment": null,
    "maxUses": 2,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF",
      "Z1",
      "Z15",
      "Z2"
    ]
  },
  "S20": {
    "id": "S20",
    "name": "Normal",
    "category": "pace",
    "stationary": false,
    "equipment": null,
    "maxUses": 2,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF",
      "Z1",
      "Z15",
      "Z2"
    ]
  },
  "S21": {
    "id": "S21",
    "name": "Moving Side Step Right",
    "category": "move",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF",
      "Z1",
      "Z15",
      "Z2"
    ]
  },
  "S22": {
    "id": "S22",
    "name": "Zig",
    "category": "move",
    "stationary": false,
    "equipment": null,
    "maxUses": 2,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF",
      "Z1",
      "Z15",
      "Z2"
    ]
  },
  "S23": {
    "id": "S23",
    "name": "360° Right",
    "category": "circle",
    "stationary": false,
    "equipment": null,
    "maxUses": 2,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF",
      "Z1",
      "Z15",
      "Z2"
    ]
  },
  "S24": {
    "id": "S24",
    "name": "360° Left",
    "category": "circle",
    "stationary": false,
    "equipment": null,
    "maxUses": 2,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF",
      "Z1",
      "Z15",
      "Z2"
    ]
  },
  "S25": {
    "id": "S25",
    "name": "Serpentine",
    "category": "cone",
    "stationary": false,
    "equipment": "cone",
    "maxUses": 2,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF",
      "Z1",
      "Z15",
      "Z2"
    ]
  },
  "S26": {
    "id": "S26",
    "name": "Straight Figure 8",
    "category": "cone",
    "stationary": false,
    "equipment": "cone",
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF",
      "Z1",
      "Z15",
      "Z2"
    ]
  },
  "S27": {
    "id": "S27",
    "name": "Spiral Right",
    "category": "cone",
    "stationary": false,
    "equipment": "cone",
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF",
      "Z1",
      "Z15",
      "Z2"
    ]
  },
  "S28": {
    "id": "S28",
    "name": "Spiral Left",
    "category": "cone",
    "stationary": false,
    "equipment": "cone",
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF",
      "Z1",
      "Z15",
      "Z2"
    ]
  },
  "S29": {
    "id": "S29",
    "name": "Cone Figure 8",
    "category": "cone",
    "stationary": false,
    "equipment": "cone",
    "maxUses": 2,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF",
      "Z1",
      "Z15",
      "Z2"
    ]
  },
  "S30": {
    "id": "S30",
    "name": "Halt",
    "category": "halt",
    "stationary": true,
    "equipment": null,
    "maxUses": 2,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF"
    ]
  },
  "S31": {
    "id": "S31",
    "name": "Zag",
    "category": "move",
    "stationary": false,
    "equipment": null,
    "maxUses": 2,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF",
      "Z1",
      "Z15",
      "Z2"
    ]
  },
  "S32": {
    "id": "S32",
    "name": "Bear Right",
    "category": "turn",
    "stationary": false,
    "equipment": null,
    "maxUses": 2,
    "motion": {
      "turnDelta": 45,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF",
      "Z1",
      "Z15",
      "Z2"
    ]
  },
  "S33": {
    "id": "S33",
    "name": "Bear Left",
    "category": "turn",
    "stationary": false,
    "equipment": null,
    "maxUses": 2,
    "motion": {
      "turnDelta": -45,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF",
      "Z1",
      "Z15",
      "Z2"
    ]
  },
  "S34": {
    "id": "S34",
    "name": "Ribbon Right",
    "category": "turn",
    "stationary": false,
    "equipment": null,
    "maxUses": 2,
    "motion": {
      "turnDelta": -135,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF",
      "Z1",
      "Z15",
      "Z2"
    ]
  },
  "S35": {
    "id": "S35",
    "name": "Ribbon Left",
    "category": "turn",
    "stationary": false,
    "equipment": null,
    "maxUses": 2,
    "motion": {
      "turnDelta": 135,
      "tolerance": 28
    },
    "levels": [
      "S",
      "A",
      "P",
      "ARF",
      "Z1",
      "Z15",
      "Z2"
    ]
  },
  "A1": {
    "id": "A1",
    "name": "Halt–Pivot Left–Halt",
    "category": "halt",
    "stationary": true,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": -90,
      "tolerance": 28
    },
    "levels": [
      "A",
      "P",
      "ARF"
    ]
  },
  "A2": {
    "id": "A2",
    "name": "Halt–Pivot Left–Forward",
    "category": "halt",
    "stationary": true,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": -90,
      "tolerance": 28
    },
    "levels": [
      "A",
      "P",
      "ARF"
    ]
  },
  "A3": {
    "id": "A3",
    "name": "Left About Turn",
    "category": "turn",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 28
    },
    "levels": [
      "A",
      "P",
      "ARF",
      "Z1",
      "Z15",
      "Z2"
    ]
  },
  "A4": {
    "id": "A4",
    "name": "Halt–180° Pivot Right",
    "category": "halt",
    "stationary": true,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 28
    },
    "levels": [
      "A",
      "P",
      "ARF"
    ]
  },
  "A5": {
    "id": "A5",
    "name": "Halt–Stand–Sit",
    "category": "halt",
    "stationary": true,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "A",
      "P",
      "ARF"
    ]
  },
  "A6": {
    "id": "A6",
    "name": "Halt–Stand–Down",
    "category": "halt",
    "stationary": true,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "A",
      "P",
      "ARF"
    ]
  },
  "A7": {
    "id": "A7",
    "name": "Halt–Down–Sit",
    "category": "halt",
    "stationary": true,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "A",
      "P",
      "ARF"
    ]
  },
  "A8": {
    "id": "A8",
    "name": "Halt–Fast From Sit",
    "category": "halt",
    "stationary": true,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "A",
      "P",
      "ARF"
    ]
  },
  "A9": {
    "id": "A9",
    "name": "Jump",
    "category": "equip",
    "stationary": false,
    "equipment": "jump",
    "maxUses": 2,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "A",
      "P",
      "ARF",
      "Z15",
      "Z2"
    ]
  },
  "A10": {
    "id": "A10",
    "name": "Off-Set Figure 8",
    "category": "cone",
    "stationary": false,
    "equipment": "cone",
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "A",
      "P",
      "ARF",
      "Z15",
      "Z2"
    ]
  },
  "A11": {
    "id": "A11",
    "name": "Cloverleaf Figure 8",
    "category": "cone",
    "stationary": false,
    "equipment": "cone",
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "A",
      "P",
      "ARF",
      "Z15",
      "Z2"
    ]
  },
  "A12": {
    "id": "A12",
    "name": "Finish Right",
    "category": "front",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "A",
      "P",
      "ARF"
    ]
  },
  "A13": {
    "id": "A13",
    "name": "Finish Left",
    "category": "front",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "A",
      "P",
      "ARF"
    ]
  },
  "A14": {
    "id": "A14",
    "name": "Halt–Leave Dog",
    "category": "leave",
    "stationary": true,
    "equipment": null,
    "maxUses": 2,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "A",
      "P",
      "ARF"
    ]
  },
  "A15": {
    "id": "A15",
    "name": "Turn–Down, Sit, Front",
    "category": "recall",
    "stationary": true,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 28
    },
    "levels": [
      "A",
      "P",
      "ARF"
    ]
  },
  "A16": {
    "id": "A16",
    "name": "Turn–Call Front",
    "category": "recall",
    "stationary": true,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 28
    },
    "levels": [
      "A",
      "P",
      "ARF"
    ]
  },
  "A17": {
    "id": "A17",
    "name": "Call to Heel–Forward",
    "category": "recall",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "A",
      "P",
      "ARF",
      "Z15",
      "Z2"
    ]
  },
  "A18": {
    "id": "A18",
    "name": "Return to Dog",
    "category": "recall",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "A",
      "P",
      "ARF",
      "Z15",
      "Z2"
    ]
  },
  "A19": {
    "id": "A19",
    "name": "Handler About Turn and Forward",
    "category": "move",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 28
    },
    "levels": [
      "A",
      "P",
      "ARF",
      "Z2"
    ]
  },
  "A20": {
    "id": "A20",
    "name": "Down",
    "category": "move",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "A",
      "P",
      "ARF"
    ]
  },
  "A21": {
    "id": "A21",
    "name": "Zig Zag Right",
    "category": "move",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "A",
      "P",
      "ARF",
      "Z15",
      "Z2"
    ]
  },
  "A22": {
    "id": "A22",
    "name": "Zig Zag Left",
    "category": "move",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "A",
      "P",
      "ARF",
      "Z15",
      "Z2"
    ]
  },
  "A23": {
    "id": "A23",
    "name": "Stand–Walk Around",
    "category": "front",
    "stationary": true,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "A",
      "P",
      "ARF",
      "Z15",
      "Z2"
    ]
  },
  "A24": {
    "id": "A24",
    "name": "Stand–Leave Dog",
    "category": "leave",
    "stationary": true,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "A",
      "P",
      "ARF",
      "Z15",
      "Z2"
    ]
  },
  "P1": {
    "id": "P1",
    "name": "Left Turn–Back 2 Steps",
    "category": "turn",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": -90,
      "tolerance": 28
    },
    "levels": [
      "P",
      "ARF",
      "Z2"
    ]
  },
  "P2": {
    "id": "P2",
    "name": "Right Turn–Back 2 Steps",
    "category": "turn",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 28
    },
    "levels": [
      "P",
      "ARF",
      "Z2"
    ]
  },
  "PR3": {
    "id": "PR3",
    "name": "Double Left About",
    "category": "turn",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "P",
      "ARF",
      "Z15",
      "Z2"
    ]
  },
  "PR4": {
    "id": "PR4",
    "name": "Heel Back 3 Steps",
    "category": "move",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "P",
      "ARF",
      "Z2"
    ]
  },
  "P5": {
    "id": "P5",
    "name": "Halt–Leave Running–Call Front",
    "category": "front",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "P",
      "Z2"
    ]
  },
  "PR6": {
    "id": "PR6",
    "name": "Moving Stand–Walk Around",
    "category": "move",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "P",
      "ARF",
      "Z2"
    ]
  },
  "PR7": {
    "id": "PR7",
    "name": "Moving Stand–Leave Dog",
    "category": "leave",
    "stationary": false,
    "equipment": null,
    "maxUses": 2,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "P",
      "ARF",
      "Z2"
    ]
  },
  "PR8": {
    "id": "PR8",
    "name": "Moving Down–Leave Dog",
    "category": "leave",
    "stationary": false,
    "equipment": null,
    "maxUses": 2,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "P",
      "ARF",
      "Z2"
    ]
  },
  "P9": {
    "id": "P9",
    "name": "Jump (Pro)",
    "category": "equip",
    "stationary": false,
    "equipment": "jump",
    "maxUses": 2,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "P",
      "ARF",
      "Z2"
    ]
  },
  "P10": {
    "id": "P10",
    "name": "Off-Set Figure 8 (Pro)",
    "category": "cone",
    "stationary": false,
    "equipment": "cone",
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "P",
      "ARF",
      "Z2"
    ]
  },
  "P11": {
    "id": "P11",
    "name": "Halt–180° Pivot Left",
    "category": "halt",
    "stationary": true,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 28
    },
    "levels": [
      "P",
      "ARF"
    ]
  },
  "P12": {
    "id": "P12",
    "name": "Halt–Step Right",
    "category": "halt",
    "stationary": true,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "P",
      "ARF"
    ]
  },
  "P13": {
    "id": "P13",
    "name": "Finish/Forward Left or Right",
    "category": "front",
    "stationary": false,
    "equipment": null,
    "maxUses": 2,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "P",
      "ARF"
    ]
  },
  "P14": {
    "id": "P14",
    "name": "Turn–Drop on Recall",
    "category": "recall",
    "stationary": true,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 28
    },
    "levels": [
      "P",
      "ARF"
    ]
  },
  "P15": {
    "id": "P15",
    "name": "Turn–Down, Sit, Front",
    "category": "recall",
    "stationary": true,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 28
    },
    "levels": [
      "P",
      "ARF"
    ]
  },
  "P16": {
    "id": "P16",
    "name": "Turn–Down, Sit, Heel",
    "category": "recall",
    "stationary": true,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 28
    },
    "levels": [
      "P",
      "ARF"
    ]
  },
  "P17": {
    "id": "P17",
    "name": "Turn–Call to Heel–Halt",
    "category": "recall",
    "stationary": true,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 28
    },
    "levels": [
      "P",
      "ARF"
    ]
  },
  "P18": {
    "id": "P18",
    "name": "Turn–Call to Heel–Forward",
    "category": "recall",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 28
    },
    "levels": [
      "P",
      "ARF",
      "Z2"
    ]
  },
  "P21": {
    "id": "P21",
    "name": "Stand–Leave Running",
    "category": "leave",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 28
    },
    "levels": [
      "P"
    ]
  },
  "PR19": {
    "id": "PR19",
    "name": "Lateral Side-Step Right",
    "category": "move",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "P",
      "ARF",
      "Z2"
    ]
  },
  "PR20": {
    "id": "PR20",
    "name": "Lateral Side-Step Left",
    "category": "move",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "P",
      "ARF",
      "Z2"
    ]
  },
  "PR22": {
    "id": "PR22",
    "name": "Broad Jump",
    "category": "equip",
    "stationary": false,
    "equipment": "jump",
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "P",
      "ARF",
      "Z2"
    ]
  },
  "R1": {
    "id": "R1",
    "name": "Halt–Step Left–Halt",
    "category": "halt",
    "stationary": true,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "ARF"
    ]
  },
  "R2": {
    "id": "R2",
    "name": "Dog Circle Right",
    "category": "circle",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "ARF",
      "Z15",
      "Z2"
    ]
  },
  "R5": {
    "id": "R5",
    "name": "Turn Face Dog–3 Steps Forward",
    "category": "recall",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 28
    },
    "levels": [
      "ARF",
      "Z2"
    ]
  },
  "APR9": {
    "id": "APR9",
    "name": "Jump (ARF)",
    "category": "equip",
    "stationary": false,
    "equipment": "jump",
    "maxUses": 3,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "ARF"
    ]
  },
  "R10": {
    "id": "R10",
    "name": "Tunnel",
    "category": "equip",
    "stationary": false,
    "equipment": "tunnel",
    "maxUses": 2,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "ARF",
      "Z2"
    ]
  },
  "R11": {
    "id": "R11",
    "name": "Table",
    "category": "equip",
    "stationary": false,
    "equipment": "table",
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "ARF",
      "Z2"
    ]
  },
  "R13": {
    "id": "R13",
    "name": "Right About Turn Side Switch",
    "category": "turn",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 28
    },
    "levels": [
      "ARF"
    ]
  },
  "R14": {
    "id": "R14",
    "name": "Left U-About Turn Side Switch",
    "category": "turn",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 28
    },
    "levels": [
      "ARF"
    ]
  },
  "R15": {
    "id": "R15",
    "name": "Turn Away Side Switch",
    "category": "turn",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 28
    },
    "levels": [
      "ARF"
    ]
  },
  "R16": {
    "id": "R16",
    "name": "Turn In Side Switch x2",
    "category": "turn",
    "stationary": false,
    "equipment": null,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 28
    },
    "levels": [
      "ARF",
      "Z2"
    ]
  },
  "R18": {
    "id": "R18",
    "name": "Pause Box",
    "category": "equip",
    "stationary": false,
    "equipment": "table",
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "ARF"
    ]
  },
  "R21": {
    "id": "R21",
    "name": "Send Out Around",
    "category": "equip",
    "stationary": false,
    "equipment": "cone",
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 28
    },
    "levels": [
      "ARF"
    ]
  }
};

// `stationary` is useful for UI/course balance, but it is not identical to
// `requiresHalt`. A23/A24 may be performed with a pause, which is why they are
// legal in the no-halt Zoom 1.5 class.
Object.values(signs).forEach(sign => { sign.requiresHalt = !!sign.stationary; });
if (signs.A23) signs.A23.requiresHalt = false;
if (signs.A24) signs.A24.requiresHalt = false;


// ---------------------------------------------------------------------------
// Physical setup metadata
// These are not substitutes for the rulebook; they give the layout engine the
// real-world dimensions needed to avoid crowding equipment exercises.
// ---------------------------------------------------------------------------
const equipmentSpace = {
  // footprint values are conservative DESIGN ENVELOPES around the exercise,
  // derived from the rulebook's equipment dimensions plus working room.
  // They are not additional C-WAGS rules.
  S25: {
    kind:'serpentine-4-cone', coneCount:4, coneSpacingMin:6, coneSpacingMax:8,
    footprint:{kind:'rect', back:2, forward:26, halfWidth:7, label:'Serpentine working area'}
  },
  S26: {
    kind:'straight-figure-8-4-cone', coneCount:4, coneSpacingMin:6, coneSpacingMax:8,
    footprint:{kind:'rect', back:2, forward:26, halfWidth:7, label:'Straight Figure 8 working area'}
  },
  S27: {
    kind:'spiral-3-cone', coneCount:3, coneSpacingMin:6, coneSpacingMax:8,
    footprint:{kind:'rect', back:2, forward:19, halfWidth:8, label:'Spiral working area'}
  },
  S28: {
    kind:'spiral-3-cone', coneCount:3, coneSpacingMin:6, coneSpacingMax:8,
    footprint:{kind:'rect', back:2, forward:19, halfWidth:8, label:'Spiral working area'}
  },
  S29: {
    kind:'cone-figure-8', coneCount:2, coneSpacingMin:6, coneSpacingMax:8,
    footprint:{kind:'rect', back:2, forward:14, halfWidth:8, label:'Cone Figure 8 working area'}
  },
  A9: {
    kind:'upright-jump', handlerOffset:3,
    footprint:{kind:'rect', back:8, forward:10, halfWidth:6, label:'Advanced jump approach/run-out'}
  },
  A10: {
    kind:'offset-figure-8', outerSpacingMin:10, outerSpacingMax:12, innerSpacing:8,
    footprint:{kind:'rect', back:2, forward:16, halfWidth:9, label:'Offset Figure 8 working area'}
  },
  A11: {
    kind:'cloverleaf-4-cone', coneCount:4, coneSpacingMin:8, coneSpacingMax:10,
    footprint:{kind:'rect', back:2, forward:19, halfWidth:10, label:'Cloverleaf working area'}
  },
  P9: {
    kind:'upright-jump', handlerOffset:6,
    footprint:{kind:'rect', back:10, forward:12, halfWidth:8, label:'Pro jump approach/run-out'}
  },
  P10: {
    kind:'offset-figure-8', outerSpacingMin:10, outerSpacingMax:12, innerSpacing:8,
    footprint:{kind:'rect', back:2, forward:16, halfWidth:9, label:'Offset Figure 8 working area'}
  },
  APR9:{
    kind:'arf-jump', handlerOffsetMax:6, minBetweenJumps:15,
    footprint:{kind:'rect', back:10, forward:12, halfWidth:8, label:'ARF jump approach/run-out'}
  },
  PR22:{
    kind:'broad-jump',
    footprint:{kind:'rect', back:10, forward:12, halfWidth:7, label:'Broad jump approach/run-out'}
  },
  R10: {
    kind:'tunnel', hostOptional:true, handlerSendDistanceMin:0, handlerSendDistanceMax:6,
    footprint:{kind:'rect', back:3, forward:14, halfWidth:7, label:'Tunnel working area'}
  },
  R11: {
    kind:'table', hostOptional:true, signToEquipment:6, handlerMinDistance:6,
    footprint:{kind:'rect', back:2, forward:13, halfWidth:7, label:'Table working area'}
  },
  R18: {
    kind:'pause-box', signToEquipment:6, handlerMinDistance:6, boxInsideSize:4,
    footprint:{kind:'rect', back:2, forward:13, halfWidth:7, label:'Pause box working area'}
  },
  R21: {
    kind:'send-around', signToEquipment:6,
    footprint:{kind:'rect', back:2, forward:13, halfWidth:7, label:'Send-around working area'}
  }
}
for (const [id, space] of Object.entries(equipmentSpace)) {
  if (signs[id]) signs[id].space = space;
}

// ---------------------------------------------------------------------------
// Level-aware "what must come next" rules.
// FINISH is handled separately by allowFinish.
// ---------------------------------------------------------------------------
const transitionRules = {
  S18: {
    nextByLevel: {
      S:['S20'], Z1:['S20'],
      A:['S20','S19'], P:['S20','S19'], ARF:['S20','S19'],
      Z15:['S20','S19'], Z2:['S20','S19']
    },
    allowFinish:true
  },
  S19: {
    nextByLevel: {
      S:['S20'], Z1:['S20'],
      A:['S20','S18'], P:['S20','S18'], ARF:['S20','S18'],
      Z15:['S20','S18'], Z2:['S20','S18']
    },
    allowFinish:true
  },
  A8: { next:['S20','S18'], allowFinish:false },

  // Front-position exercises.
  S14: { next:['S15','S16','S17','A12','A13','A18','A19','P13','R5'], allowFinish:true },
  P5:  { next:['S15','S16','S17','A12','A13','A18','A19','P13','R5'], allowFinish:true },

  // Leave Dog exercises. The exact available followers vary by level.
  A14: {
    nextByLevel: {
      A:['A9','A15','A16','A17','A18'],
      P:['P14','P15','P16','P17','P18','A9','A15','A16','A17','A18'],
      ARF:['A9','A15','A16','A17','A18','P9','APR9','R5','R10']
    },
    allowFinish:false
  },
  A24: {
    nextByLevel: {
      A:['A9','A15','A16','A17','A18'],
      P:['P14','P15','P16','P17','P18','A9','A15','A16','A17','A18'],
      ARF:['A9','A15','A16','A17','A18','P9','APR9','R5','R10'],
      Z15:['A9','A17','A18'],
      Z2:['A9','A17','A18','P9','R5','R10']
    },
    allowFinish:false
  },
  PR7: {
    nextByLevel: {
      P:['P14','P15','P16','P17','P18','A9','A15','A16','A17','A18'],
      ARF:['A9','A15','A16','A17','A18','P9','APR9','R5','R10'],
      Z2:['A9','A17','A18','P9','P18','R5','R10']
    },
    allowFinish:false
  },
  PR8: {
    nextByLevel: {
      P:['P14','P15','P16','P17','P18','A9','A15','A16','A17','A18'],
      ARF:['A9','A15','A16','A17','A18','P9','APR9','R5','R10'],
      Z2:['A9','A17','A18','P9','P18','R5','R10']
    },
    allowFinish:false
  },

  // P21 specifically ends at fast pace and must immediately change pace or Finish.
  P21: { next:['S20','S18'], allowFinish:true },

  // Zoom 2 explicitly states R5 must be followed by S15, S16, or A19.
  R5: {
    nextByLevel: { Z2:['S15','S16','A19'] },
    next:[],
    allowFinishByLevel:{ Z2:false },
    allowFinish:true
  }
};

// Used by the optional sequence injector. This is the safe union;
// transitionRules above remain authoritative for validation.
const sequenceNext = {
  S18:['S20','S19'],
  S19:['S20','S18'],
  A8:['S20','S18'],
  S14:['S15','S16','S17','A12','A13','A18','A19','P13','R5'],
  P5:['S15','S16','S17','A12','A13','A18','A19','P13','R5'],
  A14:['P14','P15','P16','P17','P18','A9','A15','A16','A17','A18','P9','APR9','R5','R10'],
  A24:['P14','P15','P16','P17','P18','A9','A15','A16','A17','A18','P9','APR9','R5','R10'],
  PR7:['P14','P15','P16','P17','P18','A9','A15','A16','A17','A18','P9','APR9','R5','R10'],
  PR8:['P14','P15','P16','P17','P18','A9','A15','A16','A17','A18','P9','APR9','R5','R10'],
  P21:['S20','S18']
};

// C-WAGS movement/context state.
// This catches combinations that simple pair rules cannot, such as a Leave Dog
// followed by a jump and then a recall/return sign.
const frontOnly = new Set(['S15','S16','S17','A12','A13','P13']);
const leaveOnly = new Set(['A15','A16','A17','P14','P15','P16','P17','P18']);
const frontOrLeave = new Set(['A18','R5']);
const leaveBridge = new Set(['A9','P9','APR9','R10']);
const leaveStarters = new Set(['A14','A24','PR7','PR8']);
const frontEnders = new Set(['S14','P5']);
const leaveToFront = new Set(['A15','A16','P14','P15','P16','R5']);
const leaveToHeel = new Set(['A17','A18','P17','P18']);
const frontToFront = new Set(['S17','R5']);
const frontToHeel = new Set(['S15','S16','A12','A13','A18','A19','P13']);

function allowedLeaveFollowers(levelId) {
  if (levelId === 'A') return new Set(['A9','A15','A16','A17','A18']);
  if (levelId === 'P') return new Set(['P14','P15','P16','P17','P18','A9','A15','A16','A17','A18']);
  if (levelId === 'ARF') return new Set(['A9','A15','A16','A17','A18','P9','APR9','R5','R10']);
  if (levelId === 'Z15') return new Set(['A9','A17','A18']);
  if (levelId === 'Z2') return new Set(['A9','A17','A18','P9','P18','R5','R10']);
  return new Set();
}

function contextAllows(context, signId, levelId) {
  if (context === 'front') {
    return frontOnly.has(signId) || frontOrLeave.has(signId) || signId === 'A19';
  }
  if (context === 'leave') {
    return allowedLeaveFollowers(levelId).has(signId);
  }

  // Normal heeling context.
  if (frontOnly.has(signId) || leaveOnly.has(signId) || frontOrLeave.has(signId)) return false;
  return true;
}

function contextAfter(context, signId) {
  if (context === 'leave') {
    if (leaveBridge.has(signId)) return 'leave';
    if (leaveToFront.has(signId)) return 'front';
    if (leaveToHeel.has(signId)) return 'heel';
  }

  if (context === 'front') {
    if (frontToFront.has(signId)) return 'front';
    if (frontToHeel.has(signId)) return 'heel';
  }

  if (leaveStarters.has(signId)) return 'leave';
  if (frontEnders.has(signId)) return 'front';
  return 'heel';
}

const Z1 = ["S1", "S2", "S3", "S4", "S7", "S8", "S18", "S19", "S20", "S21", "S22", "S23", "S24", "S25", "S26", "S27", "S28", "S29", "S31", "S32", "S33", "S34", "S35", "A3"];
const Z15_INTRO = ["A9", "A10", "A11", "PR3", "R2", "A23", "A24", "A17", "A18", "A21", "A22"];
const Z15 = ["S1", "S2", "S3", "S4", "S7", "S8", "S18", "S19", "S20", "S21", "S22", "S23", "S24", "S25", "S26", "S27", "S28", "S29", "S31", "S32", "S33", "S34", "S35", "A3", "A9", "A10", "A11", "PR3", "R2", "A23", "A24", "A17", "A18", "A21", "A22"];
const Z2_INTRO = ["P1", "P2", "PR4", "PR6", "PR7", "PR8", "P9", "P10", "P18", "PR22", "R5", "R10", "PR19", "PR20", "R16"];
const Z2 = ["S1", "S2", "S3", "S4", "S7", "S8", "S18", "S19", "S20", "S21", "S22", "S23", "S24", "S25", "S26", "S27", "S28", "S29", "S31", "S32", "S33", "S34", "S35", "A3", "A9", "A10", "A11", "PR3", "R2", "A23", "A24", "A17", "A18", "A21", "A22", "P1", "P2", "PR4", "PR6", "PR7", "PR8", "P9", "P10", "P18", "PR22", "R5", "R10", "PR19", "PR20", "R16", "R11"];




// C-WAGS permits two or more exercises to be joined and requires joined
// exercises to be indicated on the course map. These pairings are the
// front-position continuations where the first exercise ends with the dog in
// front and the next exercise begins in front; there is no intervening heeling.
const joinedPairRules = [
  {
    from:['S14','P5','A15','A16','P14','P15','S17'],
    to:['S15','S16','S17','A12','A13','A18','A19','P13'],
    displayGap:3,
    displayWarnAbove:6,
    label:'Front-position exercises performed as a joined sequence'
  }
];

const adjacentDistanceRules = [
  // Approximate/direct distances from the C-WAGS 2021 exercise descriptions.
  // These apply when the listed exercises are adjacent on the course.
  { from:['A14','A24','PR7','PR8'], to:['A15'], target:5, tolerance:1.5, label:'A15 Turn–Down, Sit, Front approximately 5 ft from the dog' },
  { from:['A14','A24','PR7','PR8'], to:['A17'], min:8, max:10, label:'A17 Call to Heel approximately 8–10 ft from where the dog is left' },
  { from:['A14','A24','PR7','PR8'], to:['P14'], min:20, label:'P14 Drop on Recall at least 20 ft from the dog' },
  { from:['A14','A24','PR7','PR8'], to:['P15'], target:12, tolerance:2, label:'P15 Turn–Down, Sit, Front approximately 12 ft from the dog' }
];

const dependentSigns = new Set([
  'S18','S19','S20','A8',
  'S14','S15','S16','S17',
  'A12','A13','A14','A15','A16','A17','A18','A24',
  'P5','P13','P14','P15','P16','P17','P18','P21',
  'PR7','PR8','R5'
]);

const chainTemplates = {
  S: [
    ['S18','S20'],
    ['S19','S20'],
    ['S14','S15'],
    ['S14','S16']
  ],
  A: [
    ['S18','S20'],
    ['S19','S20'],
    ['S18','S19','S20'],
    ['S19','S18','S20'],
    ['A8','S20'],
    ['A8','S18','S20'],
    ['S14','S15'],
    ['S14','A12'],
    ['A14','A17'],
    ['A14','A18'],
    ['A24','A17'],
    ['A24','A18'],
    ['A14','A15','S15'],
    ['A24','A16','A12']
  ],
  P: [
    ['S18','S20'],
    ['S19','S20'],
    ['S18','S19','S20'],
    ['S19','S18','S20'],
    ['A8','S20'],
    ['P21','S20'],
    ['P21','S18','S20'],
    ['P5','S15'],
    ['P5','P13'],
    ['A14','P17'],
    ['A14','P18'],
    ['A24','P17'],
    ['A24','P18'],
    ['PR7','P17'],
    ['PR7','P18'],
    ['PR8','P17'],
    ['PR8','P18'],
    ['A14','P14','S15'],
    ['PR7','P15','P13']
  ],
  ARF: [
    ['S18','S20'],
    ['S19','S20'],
    ['S18','S19','S20'],
    ['S19','S18','S20'],
    ['A8','S20'],
    ['S14','S15'],
    ['A14','A17'],
    ['A14','A18'],
    ['A24','A17'],
    ['A24','A18'],
    ['PR7','A17'],
    ['PR7','A18'],
    ['PR8','A17'],
    ['PR8','A18'],
    ['A14','R5','S15'],
    ['A24','R5','A19']
  ],
  Z1: [
    ['S18','S20'],
    ['S19','S20']
  ],
  Z15: [
    ['S18','S20'],
    ['S19','S20'],
    ['S18','S19','S20'],
    ['S19','S18','S20'],
    ['A24','A17'],
    ['A24','A18']
  ],
  Z2: [
    ['S18','S20'],
    ['S19','S20'],
    ['S18','S19','S20'],
    ['S19','S18','S20'],
    ['A24','A17'],
    ['A24','A18'],
    ['PR7','P18'],
    ['PR8','P18'],
    ['PR7','A17'],
    ['PR8','A18'],
    // Two straight leave-dog sequences provide two Zoom-2-introduced
    // exercises without requiring a 180° hairpin or optional equipment.
    ['PR7','A17','PR8','A18'],
    ['PR8','A18','PR7','A17'],
    ['A24','R5','S15'],
    ['PR7','R5','A19']
  ]
};

export const cwags2021 = {
  id: 'cwags',
  name: 'C-WAGS Rally',
  shortName: 'C-WAGS',
  discipline: 'rally',
  version: '2021',
  sourceNote: 'Normalized from the user-provided C-WAGS 2021 Rally rule set. Treat this as a versioned historical rules pack until a newer rulebook is supplied.',
  // Course Guidelines, PDF p.12: 'should', with joined/stated-distance exceptions.
  ordinarySpacing: { min:10, severity:'warning', source:'Rally-Rules-and-Guidelines-2021.pdf, p.12' },
  layout: { preferredGap:10 },
  assetBase: 'https://raw.githubusercontent.com/Chrojoh/cwagrally/main/Signs/',
  signs,
  dependentSigns,
  chainTemplates,
  adjacentDistanceRules,
  joinedPairRules,
  transitionRules,
  sequenceNext,
  sequenceFollowers: buildFollowers(sequenceNext),

  levels: {
    S: {
      id: 'S', name: 'Starter Rally', order: 10, nextLevel: 'A', progressionTrack: ['S','A','P','ARF'],
      stationCount: { min: 17, max: 20 },
      ringArea: { min: 1800, max: 3500 },
      leash: 'A division on leash; B division handler choice',
      allowedSigns: ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11", "S12", "S13", "S14", "S15", "S16", "S17", "S18", "S19", "S20", "S21", "S22", "S23", "S24", "S25", "S26", "S27", "S28", "S29", "S30", "S31", "S32", "S33", "S34", "S35"],
      quotas: [],
      defaultRing: { width: 60, height: 50 }
    },
    A: {
      id: 'A', name: 'Advanced Rally', order: 20, nextLevel: 'P', progressionTrack: ['S','A','P','ARF'],
      stationCount: { min: 18, max: 21 },
      ringArea: { min: 1800, max: 3500 },
      leash: 'off',
      allowedSigns: ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11", "S12", "S13", "S14", "S15", "S16", "S17", "S18", "S19", "S20", "S21", "S22", "S23", "S24", "S25", "S26", "S27", "S28", "S29", "S30", "S31", "S32", "S33", "S34", "S35", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12", "A13", "A14", "A15", "A16", "A17", "A18", "A19", "A20", "A21", "A22", "A23", "A24"],
      quotas: [{ id:'advanced', label:'Advanced-class exercises', min:8, signIds:["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12", "A13", "A14", "A15", "A16", "A17", "A18", "A19", "A20", "A21", "A22", "A23", "A24", "APR9"] }],
      defaultRing: { width: 60, height: 50 }
    },
    P: {
      id: 'P', name: 'Pro Rally', order: 30, nextLevel: 'ARF', progressionTrack: ['S','A','P','ARF'],
      stationCount: { min: 19, max: 22 },
      ringArea: { min: 2400, max: 4000 },
      leash: 'off',
      allowedSigns: ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11", "S12", "S13", "S14", "S15", "S16", "S17", "S18", "S19", "S20", "S21", "S22", "S23", "S24", "S25", "S26", "S27", "S28", "S29", "S30", "S31", "S32", "S33", "S34", "S35", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12", "A13", "A14", "A15", "A16", "A17", "A18", "A19", "A20", "A21", "A22", "A23", "A24", "P1", "P2", "PR3", "PR4", "P5", "PR6", "PR7", "PR8", "P9", "P10", "P11", "P12", "P13", "P14", "P15", "P16", "P17", "P18", "P21", "PR19", "PR20", "PR22"],
      quotas: [{ id:'pro', label:'Pro-class exercises', min:7, signIds:["P1", "P2", "PR3", "PR4", "P5", "PR6", "PR7", "PR8", "P9", "P10", "P11", "P12", "P13", "P14", "P15", "P16", "P17", "P18", "P21", "PR19", "PR20", "PR22"] }],
      defaultRing: { width: 65, height: 55 }
    },
    ARF: {
      id: 'ARF', name: 'ARF', order: 40, nextLevel: null, progressionTrack: ['S','A','P','ARF'],
      stationCount: { min: 19, max: 22 },
      ringArea: { min: 2400, max: 4000 },
      leash: 'off',
      allowedSigns: ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11", "S12", "S13", "S14", "S15", "S16", "S17", "S18", "S19", "S20", "S21", "S22", "S23", "S24", "S25", "S26", "S27", "S28", "S29", "S30", "S31", "S32", "S33", "S34", "S35", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12", "A13", "A14", "A15", "A16", "A17", "A18", "A19", "A20", "A21", "A22", "A23", "A24", "PR3", "PR4", "PR6", "PR7", "PR8", "PR19", "PR20", "PR22", "R1", "R2", "R5", "APR9", "R10", "R11", "R13", "R14", "R15", "R16", "R18", "R21"],
      quotas: [{ id:'arf', label:'ARF-class exercises', min:8, signIds:["PR3", "PR4", "PR6", "PR7", "PR8", "PR19", "PR20", "PR22", "R1", "R2", "R5", "APR9", "R10", "R11", "R13", "R14", "R15", "R16", "R18", "R21"] }],
      defaultRing: { width: 65, height: 55 }
    },
    Z1: {
      id: 'Z1', name: 'Zoom 1', order: 50, nextLevel: 'Z15', progressionTrack: ['Z1','Z15','Z2'],
      stationCount: { min: 15, max: 18 },
      ringArea: { min: 1800, max: 3500 },
      leash: 'handler choice',
      noHalts: true,
      allowedSigns: Z1,
      quotas: [],
      defaultRing: { width: 60, height: 50 }
    },
    Z15: {
      id: 'Z15', name: 'Zoom 1.5', order: 60, nextLevel: 'Z2', progressionTrack: ['Z1','Z15','Z2'],
      stationCount: { min: 15, max: 20 },
      ringArea: { min: 1800, max: 3500 },
      leash: 'off',
      noHalts: true,
      allowedSigns: Z15,
      quotas: [{ id:'zoom15', label:'Zoom 1.5-introduced exercises', min:6, signIds:Z15_INTRO }],
      defaultRing: { width: 60, height: 50 }
    },
    Z2: {
      id: 'Z2', name: 'Zoom 2', order: 70, nextLevel: null, progressionTrack: ['Z1','Z15','Z2'],
      stationCount: { min: 17, max: 20 },
      ringArea: { min: 2400, max: 4000 },
      leash: 'off',
      noHalts: true,
      allowedSigns: Z2,
      quotas: [{ id:'zoom2', label:'Zoom 2-introduced exercises', min:8, signIds:Z2_INTRO }],
      defaultRing: { width: 65, height: 55 }
    }
  },

  // Organization-specific rules that need geometric/equipment validation live here,
  // not in the generic engine. These are intentionally versioned with the pack.
  customValidators: [
    (course, pack) => {
      const stations = course.nodes.filter(n => n.kind === 'station');
      const out = [];
      const jumpIds = new Set(['A9','P9','APR9','PR22']);
      // 1) Dog-position/context state: heel -> front / leave dog -> legal resolution.
      let context = 'heel';
      for (let i = 0; i < stations.length; i++) {
        const id = stations[i].signId;
        if (!contextAllows(context, id, course.levelId)) {
          out.push({
            code:'cwags:dog-context',
            ok:false,
            severity:'error',
            message:`Station ${i+1} (${id}) cannot legally begin from ${context} context`,
            details:{ station:i+1, id, context }
          });
          break;
        }
        context = contextAfter(context, id);
      }
      if (context === 'leave') {
        out.push({
          code:'cwags:leave-unresolved',
          ok:false,
          severity:'error',
          message:'Course ends while a Leave Dog sequence is still unresolved'
        });
      }

      // 2) Exercise-specific distances take precedence over the ordinary 10-ft guideline.
      for (let i = 0; i < stations.length - 1; i++) {
        const a = stations[i], b = stations[i+1];
        const rule = (pack.adjacentDistanceRules || []).find(r => r.from.includes(a.signId) && r.to.includes(b.signId));
        if (!rule) continue;
        const d = Math.hypot(a.x-b.x, a.y-b.y);
        let ok = true;
        if (rule.target != null) ok = Math.abs(d-rule.target) <= (rule.tolerance ?? 1);
        if (rule.min != null) ok = ok && d + 1e-6 >= rule.min;
        if (rule.max != null) ok = ok && d - 1e-6 <= rule.max;
        if (!ok) {
          out.push({
            code:'cwags:exercise-distance',
            ok:false,
            severity:'error',
            message:`${rule.label}; current gap is ${d.toFixed(1)} ft`,
            details:{station:i+1,nextStation:i+2,from:a.signId,to:b.signId,distance:d,rule}
          });
        }
      }

      // 3) True equipment working footprints.
      // Each equipment exercise has an oriented rectangle aligned with the
      // actual outgoing course direction. The envelope must:
      //   - stay inside the ring,
      //   - contain no other station/start/finish marker,
      //   - not be crossed by an unrelated section of the route,
      //   - not overlap another equipment working envelope.
      const equipmentPlacements = [];
      for (let nodeIndex = 0; nodeIndex < course.nodes.length; nodeIndex++) {
        const node = course.nodes[nodeIndex];
        if (node.kind !== 'station') continue;
        const sign = pack.signs[node.signId];
        if (!sign?.space?.footprint) continue;

        const conflicts = equipmentPlacementConflicts({
          nodes: course.nodes,
          nodeIndex,
          sign,
          ring: course.ring,
          otherPlacements: equipmentPlacements,
          buffer: 1
        });

        for (const conflict of conflicts) {
          out.push({
            code:'cwags:equipment-footprint',
            ok:false,
            severity:'error',
            message:`${node.signId} equipment footprint conflict: ${conflict.type}`,
            details:{ stationId:node.stationId, signId:node.signId, conflict }
          });
        }
        equipmentPlacements.push({ nodeIndex, sign });
      }

      // 4) ARF jumps require at least 15 ft between jump placements.
      const arfJumps = stations.filter(s => s.signId === 'APR9');
      for (let i = 0; i < arfJumps.length; i++) {
        for (let j = i+1; j < arfJumps.length; j++) {
          const d = Math.hypot(arfJumps[i].x-arfJumps[j].x, arfJumps[i].y-arfJumps[j].y);
          if (d + 1e-6 < 15) {
            out.push({
              code:'cwags:apr9-jump-spacing',
              ok:false,
              severity:'error',
              message:`APR9 jumps must be at least 15 ft apart (${d.toFixed(1)} ft)`
            });
          }
        }
      }

      for (let i = 0; i < stations.length - 1; i++) {
        if (jumpIds.has(stations[i].signId) && jumpIds.has(stations[i+1].signId)) {
          // Advanced A9 specifically may not be two moving jumps consecutively.
          if (course.levelId === 'A' && stations[i].signId === 'A9' && stations[i+1].signId === 'A9') {
            out.push({ code:'cwags:a9-consecutive', ok:false, severity:'error', message:'Advanced A9 moving jumps may not be consecutive' });
          }
        }
      }
      if (course.levelId === 'ARF') {
        const rightSideMarkers = stations.filter(s => s.rightSideExercise).length;
        out.push({
          code:'cwags:arf-right-side',
          ok:rightSideMarkers <= 4,
          severity:'error',
          message:`${rightSideMarkers}/4 exercises explicitly marked as dog-on-right`
        });
      }
      return out;
    }
  ]
};

export default cwags2021;
