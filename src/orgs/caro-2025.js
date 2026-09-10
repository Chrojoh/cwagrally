import { routeNoGoConflicts } from '../core/venue.js';
const signs = {
  "100": {
    "id": "100",
    "name": "HALT - Stand",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/100.png"
  },
  "101": {
    "id": "101",
    "name": "HALT - Down",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/101.png"
  },
  "102": {
    "id": "102",
    "name": "HALT - Down - Sit",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/102.png"
  },
  "103": {
    "id": "103",
    "name": "HALT - Walk Around",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/103.png"
  },
  "104": {
    "id": "104",
    "name": "HALT - Down - Walk Around",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/104.png"
  },
  "105": {
    "id": "105",
    "name": "HALT - 1, 2, 3 Steps Forward",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/105.png"
  },
  "106": {
    "id": "106",
    "name": "HALT - Side Step Right - HALT",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/106.png"
  },
  "107": {
    "id": "107",
    "name": "HALT - 90 Pivot Right - HALT",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/107.png"
  },
  "108": {
    "id": "108",
    "name": "HALT - 90 Pivot Left - HALT",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": -90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/108.png"
  },
  "109": {
    "id": "109",
    "name": "HALT - Turn Right - 1 Step - HALT",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/109.png"
  },
  "110": {
    "id": "110",
    "name": "Right Turn",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/110.png"
  },
  "111": {
    "id": "111",
    "name": "Left Turn",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/111.png"
  },
  "112": {
    "id": "112",
    "name": "180 Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/112.png"
  },
  "113": {
    "id": "113",
    "name": "180 Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -180,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/113.png"
  },
  "114": {
    "id": "114",
    "name": "270 Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/114.png"
  },
  "115": {
    "id": "115",
    "name": "270 Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/115.png"
  },
  "116": {
    "id": "116",
    "name": "360 Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/116.png"
  },
  "117": {
    "id": "117",
    "name": "360 Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/117.png"
  },
  "118": {
    "id": "118",
    "name": "Slow",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/118.png"
  },
  "119": {
    "id": "119",
    "name": "Fast",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/119.png"
  },
  "120": {
    "id": "120",
    "name": "Normal",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/120.png"
  },
  "121": {
    "id": "121",
    "name": "Call Front - Finish Right - HALT",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/121.png"
  },
  "122": {
    "id": "122",
    "name": "Call Front - Finish Left - HALT",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/122.png"
  },
  "123": {
    "id": "123",
    "name": "Call Front - Forward Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/123.png"
  },
  "124": {
    "id": "124",
    "name": "Call Front - Forward Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/124.png"
  },
  "125": {
    "id": "125",
    "name": "Call Front - Handler Returns to Heel",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/125.png"
  },
  "126": {
    "id": "126",
    "name": "Spiral Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/126.png"
  },
  "127": {
    "id": "127",
    "name": "Spiral Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/127.png"
  },
  "128": {
    "id": "128",
    "name": "Weave Once",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/128.png"
  },
  "129": {
    "id": "129",
    "name": "Weave Twice",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/129.png"
  },
  "130": {
    "id": "130",
    "name": "Diagonal Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 45,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/130.png"
  },
  "131": {
    "id": "131",
    "name": "Diagonal Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -45,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/131.png"
  },
  "200": {
    "id": "200",
    "name": "Fast From Sit - HALT",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/200.png"
  },
  "201": {
    "id": "201",
    "name": "Leave Dog - Run - Call to Heel - HALT",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/201.png",
    "generatorEligible": false
  },
  "202": {
    "id": "202",
    "name": "Dog Circles Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/202.png"
  },
  "203": {
    "id": "203",
    "name": "Moving Down - Walk Around",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/203.png"
  },
  "204": {
    "id": "204",
    "name": "Moving Side Step Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/204.png"
  },
  "205": {
    "id": "205",
    "name": "Off-set Figure 8",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/205.png"
  },
  "206": {
    "id": "206",
    "name": "Left Turn - Dog Circles Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/206.png"
  },
  "207": {
    "id": "207",
    "name": "Left About Turn",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -180,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/207.png"
  },
  "208": {
    "id": "208",
    "name": "HALT - 180 Pivot Right - HALT",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/208.png"
  },
  "209": {
    "id": "209",
    "name": "HALT - 180 Pivot Left - HALT",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": -180,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/209.png"
  },
  "210": {
    "id": "210",
    "name": "HALT - From Sit - 180 Right",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/210.png"
  },
  "211": {
    "id": "211",
    "name": "HALT - From Sit - 180 Left",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": -180,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/211.png"
  },
  "212": {
    "id": "212",
    "name": "HALT - Stand - Leave For Walk Around",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/212.png",
    "generatorEligible": false
  },
  "213": {
    "id": "213",
    "name": "Return to Heel",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/213.png",
    "generatorEligible": false
  },
  "214": {
    "id": "214",
    "name": "HALT - Leave Dog - Turn - Call Front",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/214.png",
    "generatorEligible": false
  },
  "215": {
    "id": "215",
    "name": "Call Front - 1, 2, 3 Steps Backwards",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/215.png"
  },
  "216": {
    "id": "216",
    "name": "Finish Right - HALT",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/216.png"
  },
  "217": {
    "id": "217",
    "name": "Finish Left - HALT",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/217.png"
  },
  "218": {
    "id": "218",
    "name": "Forward Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/218.png"
  },
  "219": {
    "id": "219",
    "name": "Forward Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/219.png"
  },
  "220": {
    "id": "220",
    "name": "Jump",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/220.png",
    "equipment": "jump",
    "space": {
      "footprint": {
        "kind": "rect",
        "back": 6,
        "forward": 18,
        "halfWidth": 7,
        "label": "Obstacle send / landing area"
      }
    }
  },
  "221": {
    "id": "221",
    "name": "Diagonal Loop Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 45,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/221.png"
  },
  "222": {
    "id": "222",
    "name": "Diagonal Loop Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -45,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/222.png"
  },
  "223": {
    "id": "223",
    "name": "Call Dog",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/223.png",
    "generatorEligible": false
  },
  "300": {
    "id": "300",
    "name": "HALT - Stand - Down",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/300.png"
  },
  "301": {
    "id": "301",
    "name": "HALT - Stand - Sit",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/301.png"
  },
  "302": {
    "id": "302",
    "name": "Moving Stand - Walk Around",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/302.png"
  },
  "303": {
    "id": "303",
    "name": "Moving Stand - Call to Heel",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/303.png",
    "generatorEligible": false
  },
  "304": {
    "id": "304",
    "name": "Moving Down - Call to Heel",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/304.png",
    "generatorEligible": false
  },
  "305": {
    "id": "305",
    "name": "Back Up 3 Steps",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/305.png"
  },
  "306": {
    "id": "306",
    "name": "HALT - Stand - Leave",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/306.png",
    "generatorEligible": false
  },
  "307": {
    "id": "307",
    "name": "Sit Dog - Return to Heel",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/307.png",
    "generatorEligible": false
  },
  "308": {
    "id": "308",
    "name": "Down Dog - Return to Heel",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/308.png",
    "generatorEligible": false
  },
  "309": {
    "id": "309",
    "name": "Sit Dog - Call to Heel - Forward",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/309.png",
    "generatorEligible": false
  },
  "310": {
    "id": "310",
    "name": "Down Dog - Call to Heel - Forward",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/310.png",
    "generatorEligible": false
  },
  "311": {
    "id": "311",
    "name": "Jump",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/311.png",
    "equipment": "jump",
    "space": {
      "footprint": {
        "kind": "rect",
        "back": 6,
        "forward": 18,
        "halfWidth": 7,
        "label": "Obstacle send / landing area"
      }
    }
  },
  "312": {
    "id": "312",
    "name": "Broad Jump",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/312.png",
    "equipment": "broad-jump",
    "space": {
      "footprint": {
        "kind": "rect",
        "back": 6,
        "forward": 18,
        "halfWidth": 7,
        "label": "Obstacle send / landing area"
      }
    }
  },
  "313": {
    "id": "313",
    "name": "Tunnel",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/313.png",
    "equipment": "tunnel",
    "space": {
      "footprint": {
        "kind": "rect",
        "back": 4,
        "forward": 20,
        "halfWidth": 7,
        "label": "Tunnel working area"
      }
    }
  },
  "314": {
    "id": "314",
    "name": "Weave Poles",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/314.png",
    "equipment": "weaves",
    "space": {
      "footprint": {
        "kind": "rect",
        "back": 4,
        "forward": 18,
        "halfWidth": 6,
        "label": "Weave working area"
      }
    }
  },
  "315": {
    "id": "315",
    "name": "Right Turn - 2 Steps - Down",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/315.png"
  },
  "316": {
    "id": "316",
    "name": "Left Turn - 2 Steps - Down",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/316.png"
  },
  "317": {
    "id": "317",
    "name": "Call Front - Walk Around - Leave Dog",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/317.png",
    "generatorEligible": false
  },
  "318": {
    "id": "318",
    "name": "Right Turn - Back Up 2 Steps",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/318.png"
  },
  "319": {
    "id": "319",
    "name": "Left Turn - Back Up 2 Steps",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/319.png"
  },
  "320": {
    "id": "320",
    "name": "Moving Sit - Walk Around",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/320.png"
  },
  "400": {
    "id": "400",
    "name": "Turn In",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/400.png"
  },
  "401": {
    "id": "401",
    "name": "Turn Away",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/401.png"
  },
  "402": {
    "id": "402",
    "name": "Side By Side Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/402.png"
  },
  "403": {
    "id": "403",
    "name": "Side By Side Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/403.png"
  },
  "404": {
    "id": "404",
    "name": "Cross Front",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/404.png"
  },
  "405": {
    "id": "405",
    "name": "Cross Behind",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/405.png"
  },
  "406": {
    "id": "406",
    "name": "Weave Through Legs",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/406.png"
  },
  "407": {
    "id": "407",
    "name": "Spin Left - Right Turn - Cross Behind",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/407.png"
  },
  "408": {
    "id": "408",
    "name": "Spin Right - Left Turn - Cross Behind",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/408.png"
  },
  "409": {
    "id": "409",
    "name": "HALT - Stand",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/409.png"
  },
  "410": {
    "id": "410",
    "name": "HALT - Down",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/410.png"
  },
  "411": {
    "id": "411",
    "name": "HALT - Down - Sit",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/411.png"
  },
  "412": {
    "id": "412",
    "name": "HALT - Walk Around",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/412.png"
  },
  "413": {
    "id": "413",
    "name": "HALT - Down - Walk Around",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/413.png"
  },
  "414": {
    "id": "414",
    "name": "HALT - 1, 2, 3 Steps Forward",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/414.png"
  },
  "415": {
    "id": "415",
    "name": "HALT - Side Step Left - HALT",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/415.png"
  },
  "416": {
    "id": "416",
    "name": "HALT - 90 Pivot Right - HALT",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/416.png"
  },
  "417": {
    "id": "417",
    "name": "HALT - 90 Pivot Left - HALT",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": -90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/417.png"
  },
  "418": {
    "id": "418",
    "name": "HALT - Turn Left - 1 Step - HALT",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": -90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/418.png"
  },
  "419": {
    "id": "419",
    "name": "Right Turn",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/419.png"
  },
  "420": {
    "id": "420",
    "name": "Left Turn",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/420.png"
  },
  "421": {
    "id": "421",
    "name": "180 Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/421.png"
  },
  "422": {
    "id": "422",
    "name": "180 Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -180,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/422.png"
  },
  "423": {
    "id": "423",
    "name": "270 Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/423.png"
  },
  "424": {
    "id": "424",
    "name": "270 Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/424.png"
  },
  "425": {
    "id": "425",
    "name": "360 Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/425.png"
  },
  "426": {
    "id": "426",
    "name": "360 Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/426.png"
  },
  "427": {
    "id": "427",
    "name": "Slow",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/427.png"
  },
  "428": {
    "id": "428",
    "name": "Fast",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/428.png"
  },
  "429": {
    "id": "429",
    "name": "Normal",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/429.png"
  },
  "430": {
    "id": "430",
    "name": "Call Front - Finish Right - HALT",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/430.png"
  },
  "431": {
    "id": "431",
    "name": "Call Front - Finish Left - HALT",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/431.png"
  },
  "432": {
    "id": "432",
    "name": "Call Front - Forward Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/432.png"
  },
  "433": {
    "id": "433",
    "name": "Call Front - Forward Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/433.png"
  },
  "434": {
    "id": "434",
    "name": "Call Front - Handler Returns to Heel",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/434.png"
  },
  "435": {
    "id": "435",
    "name": "Spiral Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/435.png"
  },
  "436": {
    "id": "436",
    "name": "Spiral Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/436.png"
  },
  "437": {
    "id": "437",
    "name": "Weave Once",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/437.png"
  },
  "438": {
    "id": "438",
    "name": "Weave Twice",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/438.png"
  },
  "439": {
    "id": "439",
    "name": "Jump",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/439.png",
    "equipment": "jump",
    "space": {
      "footprint": {
        "kind": "rect",
        "back": 6,
        "forward": 18,
        "halfWidth": 7,
        "label": "Obstacle send / landing area"
      }
    }
  },
  "440": {
    "id": "440",
    "name": "Broad Jump",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/440.png",
    "equipment": "broad-jump",
    "space": {
      "footprint": {
        "kind": "rect",
        "back": 6,
        "forward": 18,
        "halfWidth": 7,
        "label": "Obstacle send / landing area"
      }
    }
  },
  "441": {
    "id": "441",
    "name": "Tunnel",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/441.png",
    "equipment": "tunnel",
    "space": {
      "footprint": {
        "kind": "rect",
        "back": 4,
        "forward": 20,
        "halfWidth": 7,
        "label": "Tunnel working area"
      }
    }
  },
  "442": {
    "id": "442",
    "name": "Weave Poles",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/442.png",
    "equipment": "weaves",
    "space": {
      "footprint": {
        "kind": "rect",
        "back": 4,
        "forward": 18,
        "halfWidth": 6,
        "label": "Weave working area"
      }
    }
  },
  "443": {
    "id": "443",
    "name": "Diagonal Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 45,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/443.png"
  },
  "444": {
    "id": "444",
    "name": "Diagonal Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -45,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/444.png"
  },
  "500": {
    "id": "500",
    "name": "Moving Sit - Cross Behind",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/500.png"
  },
  "501": {
    "id": "501",
    "name": "Moving Stand - Cross Behind",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/501.png"
  },
  "502": {
    "id": "502",
    "name": "Moving Down - Cross Behind",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/502.png"
  },
  "503": {
    "id": "503",
    "name": "Fast From Sit - HALT",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/503.png"
  },
  "504": {
    "id": "504",
    "name": "Leave Dog - Run - Call to Heel - HALT",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/504.png"
  },
  "505": {
    "id": "505",
    "name": "Dog Circles Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/505.png"
  },
  "506": {
    "id": "506",
    "name": "Moving Down - Walk Around",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/506.png"
  },
  "507": {
    "id": "507",
    "name": "Moving Side Step Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/507.png"
  },
  "508": {
    "id": "508",
    "name": "Off-set Figure 8",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/508.png"
  },
  "509": {
    "id": "509",
    "name": "Right Turn - Dog Circles Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/509.png"
  },
  "510": {
    "id": "510",
    "name": "Right About Turn",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/510.png"
  },
  "511": {
    "id": "511",
    "name": "HALT - 180 Pivot Right - HALT",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/511.png"
  },
  "512": {
    "id": "512",
    "name": "HALT - 180 Pivot Left - HALT",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": -180,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/512.png"
  },
  "513": {
    "id": "513",
    "name": "HALT - From Sit - 180 Right",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/513.png"
  },
  "514": {
    "id": "514",
    "name": "HALT - From Sit - 180 Left",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": -180,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/514.png"
  },
  "515": {
    "id": "515",
    "name": "HALT - Stand - Leave For Walk Around",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/515.png"
  },
  "516": {
    "id": "516",
    "name": "Return to Heel",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/516.png"
  },
  "517": {
    "id": "517",
    "name": "HALT - Leave Dog - Turn - Call Front",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/517.png"
  },
  "518": {
    "id": "518",
    "name": "Call Front - 1, 2, 3 Steps Backwards",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/518.png"
  },
  "519": {
    "id": "519",
    "name": "Finish Right - HALT",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/519.png"
  },
  "520": {
    "id": "520",
    "name": "Finish Left - HALT",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/520.png"
  },
  "521": {
    "id": "521",
    "name": "Forward Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/521.png"
  },
  "522": {
    "id": "522",
    "name": "Forward Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/522.png"
  },
  "523": {
    "id": "523",
    "name": "HALT - Stand - Down",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/523.png"
  },
  "524": {
    "id": "524",
    "name": "HALT - Stand - Sit",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/524.png"
  },
  "525": {
    "id": "525",
    "name": "Moving Stand - Walk Around",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/525.png"
  },
  "526": {
    "id": "526",
    "name": "Moving Sit - Walk Around",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/526.png"
  },
  "527": {
    "id": "527",
    "name": "Moving Stand - Call to Heel",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/527.png"
  },
  "528": {
    "id": "528",
    "name": "Moving Down - Call to Heel",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/528.png"
  },
  "529": {
    "id": "529",
    "name": "Back Up 3 Steps",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/529.png"
  },
  "530": {
    "id": "530",
    "name": "HALT - Stand - Leave",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/530.png"
  },
  "531": {
    "id": "531",
    "name": "Sit Dog - Return to Heel",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/531.png"
  },
  "532": {
    "id": "532",
    "name": "Down Dog - Return to Heel",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/532.png"
  },
  "533": {
    "id": "533",
    "name": "Sit Dog - Call to Heel - Forward",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/533.png"
  },
  "534": {
    "id": "534",
    "name": "Down Dog - Call to Heel - Forward",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/534.png"
  },
  "535": {
    "id": "535",
    "name": "Diagonal Loop Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 45,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/535.png"
  },
  "536": {
    "id": "536",
    "name": "Diagonal Loop Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -45,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/536.png"
  },
  "537": {
    "id": "537",
    "name": "Right Turn - 2 Steps - Down",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/537.png"
  },
  "538": {
    "id": "538",
    "name": "Left Turn - 2 Steps - Down",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/538.png"
  },
  "539": {
    "id": "539",
    "name": "Call Dog",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/539.png"
  },
  "540": {
    "id": "540",
    "name": "Call Front - Walk Around - Leave Dog",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/540.png"
  },
  "541": {
    "id": "541",
    "name": "Right Turn - Back Up 2 Steps",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/541.png"
  },
  "542": {
    "id": "542",
    "name": "Left Turn - Back Up 2 Steps",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -90,
      "tolerance": 30
    },
    "image": "./assets/caro-2025/542.png"
  }
};

const levels = {
  "N": {
    "id": "N",
    "name": "Novice",
    "order": 10,
    "nextLevel": "I",
    "nextLevels": [
      "I",
      "A",
      "V"
    ],
    "progressionTrack": [
      "N",
      "I",
      "A",
      "X"
    ],
    "stationCount": {
      "min": 15,
      "max": 20,
      "includesStartFinish": true
    },
    "ringArea": {
      "min": 1500,
      "max": null
    },
    "defaultRing": {
      "width": 50,
      "height": 40
    },
    "leash": "On leash",
    "routeStyles": [
      "classic"
    ],
    "allowedSigns": [
      "100",
      "101",
      "102",
      "103",
      "104",
      "105",
      "106",
      "107",
      "108",
      "109",
      "110",
      "111",
      "112",
      "113",
      "114",
      "115",
      "116",
      "117",
      "118",
      "119",
      "120",
      "121",
      "122",
      "123",
      "124",
      "125",
      "126",
      "127",
      "128",
      "129",
      "130",
      "131"
    ],
    "quotas": [
      {
        "id": "cones",
        "label": "cone station(s)",
        "min": 1,
        "signIds": [
          "126",
          "127",
          "128",
          "129"
        ]
      },
      {
        "id": "pace",
        "label": "pace-change station(s)",
        "min": 1,
        "signIds": [
          "118",
          "119",
          "120"
        ]
      },
      {
        "id": "halts",
        "label": "HALT stations",
        "min": 2,
        "max": 5,
        "signIds": [
          "100",
          "101",
          "102",
          "103",
          "104",
          "105",
          "106",
          "107",
          "108",
          "109"
        ]
      },
      {
        "id": "fronts",
        "label": "Call Front stations",
        "min": 2,
        "signIds": [
          "121",
          "122",
          "123",
          "124",
          "125"
        ]
      }
    ]
  },
  "I": {
    "id": "I",
    "name": "Intermediate",
    "order": 20,
    "nextLevel": "A",
    "progressionTrack": [
      "N",
      "I",
      "A",
      "X"
    ],
    "stationCount": {
      "min": 15,
      "max": 20,
      "includesStartFinish": true
    },
    "ringArea": {
      "min": 1500,
      "max": null
    },
    "defaultRing": {
      "width": 50,
      "height": 40
    },
    "leash": "On leash",
    "routeStyles": [
      "classic"
    ],
    "allowedSigns": [
      "100",
      "101",
      "102",
      "103",
      "104",
      "105",
      "106",
      "107",
      "108",
      "109",
      "110",
      "111",
      "112",
      "113",
      "114",
      "115",
      "116",
      "117",
      "118",
      "119",
      "120",
      "121",
      "122",
      "123",
      "124",
      "125",
      "126",
      "127",
      "128",
      "129",
      "130",
      "131",
      "200",
      "203",
      "204",
      "205",
      "206",
      "207",
      "208",
      "209",
      "210",
      "211",
      "215",
      "216",
      "217",
      "218",
      "219",
      "221",
      "222",
      "223"
    ],
    "quotas": [
      {
        "id": "advanced",
        "label": "Advanced-level stations",
        "min": 6,
        "signIds": [
          "200",
          "201",
          "202",
          "203",
          "204",
          "205",
          "206",
          "207",
          "208",
          "209",
          "210",
          "211",
          "212",
          "213",
          "214",
          "215",
          "216",
          "217",
          "218",
          "219",
          "220",
          "221",
          "222",
          "223"
        ]
      },
      {
        "id": "halts",
        "label": "HALT stations",
        "min": 0,
        "max": 5,
        "signIds": [
          "100",
          "101",
          "102",
          "103",
          "104",
          "105",
          "106",
          "107",
          "108",
          "109",
          "200",
          "208",
          "209",
          "210",
          "211"
        ]
      }
    ]
  },
  "A": {
    "id": "A",
    "name": "Advanced",
    "order": 30,
    "nextLevel": "X",
    "progressionTrack": [
      "N",
      "I",
      "A",
      "X"
    ],
    "stationCount": {
      "min": 15,
      "max": 20,
      "includesStartFinish": true
    },
    "ringArea": {
      "min": 1500,
      "max": null
    },
    "defaultRing": {
      "width": 50,
      "height": 40
    },
    "leash": "Off leash",
    "routeStyles": [
      "classic"
    ],
    "allowedSigns": [
      "100",
      "101",
      "102",
      "103",
      "104",
      "105",
      "106",
      "107",
      "108",
      "109",
      "110",
      "111",
      "112",
      "113",
      "114",
      "115",
      "116",
      "117",
      "118",
      "119",
      "120",
      "121",
      "122",
      "123",
      "124",
      "125",
      "126",
      "127",
      "128",
      "129",
      "130",
      "131",
      "200",
      "201",
      "202",
      "203",
      "204",
      "205",
      "206",
      "207",
      "208",
      "209",
      "210",
      "211",
      "212",
      "213",
      "214",
      "215",
      "216",
      "217",
      "218",
      "219",
      "220",
      "221",
      "222",
      "223"
    ],
    "quotas": [
      {
        "id": "advanced",
        "label": "Advanced-level stations",
        "min": 8,
        "signIds": [
          "200",
          "201",
          "202",
          "203",
          "204",
          "205",
          "206",
          "207",
          "208",
          "209",
          "210",
          "211",
          "212",
          "213",
          "214",
          "215",
          "216",
          "217",
          "218",
          "219",
          "220",
          "221",
          "222",
          "223"
        ]
      },
      {
        "id": "jump",
        "label": "mandatory Jump #220",
        "min": 1,
        "max": 1,
        "signIds": [
          "220"
        ]
      },
      {
        "id": "halts",
        "label": "HALT stations",
        "min": 0,
        "max": 5,
        "signIds": [
          "100",
          "101",
          "102",
          "103",
          "104",
          "105",
          "106",
          "107",
          "108",
          "109",
          "200",
          "201",
          "208",
          "209",
          "210",
          "211"
        ]
      }
    ]
  },
  "X": {
    "id": "X",
    "name": "Excellent",
    "order": 40,
    "nextLevel": null,
    "progressionTrack": [
      "N",
      "I",
      "A",
      "X"
    ],
    "stationCount": {
      "min": 15,
      "max": 20,
      "includesStartFinish": true
    },
    "ringArea": {
      "min": 1500,
      "max": null
    },
    "defaultRing": {
      "width": 50,
      "height": 40
    },
    "leash": "Off leash",
    "routeStyles": [
      "classic"
    ],
    "allowedSigns": [
      "100",
      "101",
      "102",
      "103",
      "104",
      "105",
      "106",
      "107",
      "108",
      "109",
      "110",
      "111",
      "112",
      "113",
      "114",
      "115",
      "116",
      "117",
      "118",
      "119",
      "120",
      "121",
      "122",
      "123",
      "124",
      "125",
      "126",
      "127",
      "128",
      "129",
      "130",
      "131",
      "200",
      "201",
      "202",
      "203",
      "204",
      "205",
      "206",
      "207",
      "208",
      "209",
      "210",
      "211",
      "212",
      "213",
      "214",
      "215",
      "216",
      "217",
      "218",
      "219",
      "220",
      "221",
      "222",
      "223",
      "300",
      "301",
      "302",
      "303",
      "304",
      "305",
      "306",
      "307",
      "308",
      "309",
      "310",
      "311",
      "312",
      "313",
      "314",
      "315",
      "316",
      "317",
      "318",
      "319",
      "320"
    ],
    "quotas": [
      {
        "id": "excellent",
        "label": "Excellent-level stations",
        "min": 5,
        "signIds": [
          "300",
          "301",
          "302",
          "303",
          "304",
          "305",
          "306",
          "307",
          "308",
          "309",
          "310",
          "311",
          "312",
          "313",
          "314",
          "315",
          "316",
          "317",
          "318",
          "319",
          "320"
        ]
      },
      {
        "id": "advanced",
        "label": "Advanced-level stations",
        "min": 3,
        "signIds": [
          "200",
          "201",
          "202",
          "203",
          "204",
          "205",
          "206",
          "207",
          "208",
          "209",
          "210",
          "211",
          "212",
          "213",
          "214",
          "215",
          "216",
          "217",
          "218",
          "219",
          "220",
          "221",
          "222",
          "223"
        ]
      },
      {
        "id": "obstacles",
        "label": "obstacle station(s)",
        "min": 1,
        "max": 2,
        "signIds": [
          "220",
          "311",
          "312",
          "313",
          "314"
        ]
      },
      {
        "id": "halts",
        "label": "HALT stations",
        "min": 0,
        "max": 5,
        "signIds": [
          "100",
          "101",
          "102",
          "103",
          "104",
          "105",
          "106",
          "107",
          "108",
          "109",
          "200",
          "201",
          "208",
          "209",
          "210",
          "211",
          "300",
          "301",
          "306"
        ]
      }
    ]
  },
  "V": {
    "id": "V",
    "name": "Versatility",
    "order": 50,
    "nextLevel": "VX",
    "progressionTrack": [
      "N",
      "V",
      "VX"
    ],
    "stationCount": {
      "min": 15,
      "max": 20,
      "includesStartFinish": true
    },
    "ringArea": {
      "min": 1500,
      "max": null
    },
    "defaultRing": {
      "width": 50,
      "height": 40
    },
    "leash": "Off leash · both sides",
    "routeStyles": [
      "classic"
    ],
    "generationEnabled": false,
    "generationMessage": "Versatility is installed for browsing/manual editing, but automatic generation is disabled until the dog-side state machine is enabled.",
    "allowedSigns": [
      "100",
      "101",
      "102",
      "103",
      "104",
      "105",
      "106",
      "107",
      "108",
      "109",
      "110",
      "111",
      "112",
      "113",
      "114",
      "115",
      "116",
      "117",
      "118",
      "119",
      "120",
      "121",
      "122",
      "123",
      "124",
      "125",
      "126",
      "127",
      "128",
      "129",
      "130",
      "131",
      "400",
      "401",
      "402",
      "403",
      "404",
      "405",
      "406",
      "407",
      "408",
      "409",
      "410",
      "411",
      "412",
      "413",
      "414",
      "415",
      "416",
      "417",
      "418",
      "419",
      "420",
      "421",
      "422",
      "423",
      "424",
      "425",
      "426",
      "427",
      "428",
      "429",
      "430",
      "431",
      "432",
      "433",
      "434",
      "435",
      "436",
      "437",
      "438",
      "439",
      "440",
      "441",
      "442",
      "443",
      "444"
    ]
  },
  "VX": {
    "id": "VX",
    "name": "Versatility Excellent",
    "order": 60,
    "nextLevel": null,
    "progressionTrack": [
      "N",
      "V",
      "VX"
    ],
    "stationCount": {
      "min": 15,
      "max": 20,
      "includesStartFinish": true
    },
    "ringArea": {
      "min": 1500,
      "max": null
    },
    "defaultRing": {
      "width": 50,
      "height": 40
    },
    "leash": "Off leash · both sides",
    "routeStyles": [
      "classic"
    ],
    "generationEnabled": false,
    "generationMessage": "Versatility Excellent is installed for browsing/manual editing, but automatic generation is disabled until the dog-side state machine is enabled.",
    "allowedSigns": [
      "100",
      "101",
      "102",
      "103",
      "104",
      "105",
      "106",
      "107",
      "108",
      "109",
      "110",
      "111",
      "112",
      "113",
      "114",
      "115",
      "116",
      "117",
      "118",
      "119",
      "120",
      "121",
      "122",
      "123",
      "124",
      "125",
      "126",
      "127",
      "128",
      "129",
      "130",
      "131",
      "200",
      "201",
      "202",
      "203",
      "204",
      "205",
      "206",
      "207",
      "208",
      "209",
      "210",
      "211",
      "212",
      "213",
      "214",
      "215",
      "216",
      "217",
      "218",
      "219",
      "220",
      "221",
      "222",
      "223",
      "300",
      "301",
      "302",
      "303",
      "304",
      "305",
      "306",
      "307",
      "308",
      "309",
      "310",
      "311",
      "312",
      "313",
      "314",
      "315",
      "316",
      "317",
      "318",
      "319",
      "320",
      "400",
      "401",
      "402",
      "403",
      "404",
      "405",
      "406",
      "407",
      "408",
      "409",
      "410",
      "411",
      "412",
      "413",
      "414",
      "415",
      "416",
      "417",
      "418",
      "419",
      "420",
      "421",
      "422",
      "423",
      "424",
      "425",
      "426",
      "427",
      "428",
      "429",
      "430",
      "431",
      "432",
      "433",
      "434",
      "435",
      "436",
      "437",
      "438",
      "439",
      "440",
      "441",
      "442",
      "443",
      "444",
      "500",
      "501",
      "502",
      "503",
      "504",
      "505",
      "506",
      "507",
      "508",
      "509",
      "510",
      "511",
      "512",
      "513",
      "514",
      "515",
      "516",
      "517",
      "518",
      "519",
      "520",
      "521",
      "522",
      "523",
      "524",
      "525",
      "526",
      "527",
      "528",
      "529",
      "530",
      "531",
      "532",
      "533",
      "534",
      "535",
      "536",
      "537",
      "538",
      "539",
      "540",
      "541",
      "542"
    ]
  }
};

// Source audit: Handbook p.36 (PDF p.40), crossing diagonal loops exit
// backward-left / backward-right, not a forward 45-degree bearing.
signs['221'].motion.turnDelta=-135;
signs['222'].motion.turnDelta=135;
for(const id of ['214','309','310','317']) signs[id].motion.turnDelta=180;

const sourceTransitions={
  '118':{next:['119','120'],allowFinish:true},
  '119':{next:['118','120'],allowFinish:true},
  '200':{next:['118','120'],allowFinish:true},
  '201':{next:['223']},'212':{next:['213']},
  '214':{next:['216','217','218','219']},
  '215':{next:['216','217','218','219']},
  '303':{next:['223']},'304':{next:['223']},'317':{next:['223']},
  '306':{next:['307','308','309','310']}
};
for(const id of ['216','217','218','219']) signs[id].requiredPrevious=['214','215'];
signs['213'].requiredPrevious=['212'];
signs['223'].requiredPrevious=['201','303','304','317'];
for(const id of ['307','308','309','310']) signs[id].requiredPrevious=['306'];

function makeResult(code, ok, message, details = null, severity = 'error') {
  return { code, ok, message, details, severity };
}

function caroCourseValidator(course, pack) {
  const level = pack.levels[course.levelId];
  const stations = course.nodes.filter(n => n.kind === 'station');
  const results = [];
  // Trial Officials Guide 2026, PDF p.11: 8 feet before Start and after Finish.
  for(const kind of ['start','finish']) {
    const i=course.nodes.findIndex(n=>n.kind===kind);
    const node=course.nodes[i],neighbor=course.nodes[kind==='start'?i+1:i-1];
    if(!node || !neighbor) continue;
    const dx=node.x-neighbor.x,dy=node.y-neighbor.y,len=Math.hypot(dx,dy);
    const end={x:node.x+8*dx/(len||1),y:node.y+8*dy/(len||1)};
    const clear=len>0 && end.x>=0 && end.y>=0 && end.x<=course.ring.width && end.y<=course.ring.height &&
      routeNoGoConflicts([node,end],course.noGoZones||[],0.5).length===0;
    const severity = 'error';
    results.push(makeResult(`caro:${kind}-clearance`,clear,`${kind==='start'?'Start approach':'Finish run-out'} requires 8 ft of clear space inside the ring`,{stationId:node.stationId,end},severity));
  }


  // CARO course-design quality rules that are geometric rather than sign-pool rules.
  const obstacleIds = new Set(['220','311','312','313','314','439','440','441','442']);
  const boundaryBad = [];
  stations.forEach((n, i) => {
    if (!obstacleIds.has(n.signId)) return;
    const edge = Math.min(n.x, course.ring.width - n.x, n.y, course.ring.height - n.y);
    if (edge < 3) boundaryBad.push({ station:i+1, stationId:n.stationId, signId:n.signId, edge });
  });
  results.push(makeResult(
    'caro:obstacle-boundary',
    boundaryBad.length === 0,
    boundaryBad.length ? `${boundaryBad.length} obstacle station(s) are under 3 ft from a ring boundary` : 'Obstacle stations have at least 3 ft lateral boundary clearance',
    boundaryBad
  ));

  const cones = new Set(['126','127','128','129','435','436','437','438']);
  const consecutiveCones = [];
  for (let i=0;i<stations.length-1;i++) {
    if (cones.has(stations[i].signId) && cones.has(stations[i+1].signId)) {
      consecutiveCones.push({station:i+1,nextStation:i+2,stationId:stations[i].stationId,nextStationId:stations[i+1].stationId});
    }
  }
  results.push(makeResult(
    'caro:cone-separation',
    consecutiveCones.length === 0,
    consecutiveCones.length ? `${consecutiveCones.length} consecutive cone exercise pair(s)` : 'Cone exercises are not consecutive',
    consecutiveCones
  ));

  return results;
}

const caro2025 = {
  id: 'caro',
  version: '2025.12',
  discipline: 'rally',
  shortName: 'CARO',
  name: 'Canadian Association of Rally Obedience',
  sourceLabel: '2025 Rally Handbook + amendments effective Dec. 14, 2025 + 2026 Trial Officials Guide',
  assetBase: './assets/caro-2025/',
  layout: { preferredGap: 10 },
  // Checklist V12-2026 08 says generally 10 or 15 ft, without assigning
  // distances to sign families. These explicit estimates remain advisory.
  spacingGuidance: {
    default: 10, extended: 15,
    extendedAfter: ['119','200','428','503','105','414','215','518','305','529','315','316','537','538','318','319','541','542'],
    extendedBefore: ['215','518','305','529','318','319','541','542'],
    companions: [
      {from:['201','303','304','317'],to:['223']},
      {from:['500','501','502','504','527','528','540'],to:['539','223']},
      {from:['212'],to:['213']}, {from:['515'],to:['516']},
      {from:['214','215'],to:['216','217','218','219']},
      {from:['517','518'],to:['519','520','521','522']},
      {from:['306'],to:['307','308','309','310']},
      {from:['530'],to:['531','532','533','534']}
    ]
  },
  ringGuidance: '50 × 40 ft is the program default for automatic course layout, not a required CARO ring shape. Any dimensions that meet the 1,500 sq ft minimum are rule-valid.',
  // Reserve one future jump bay in Novice/Intermediate so the required #220
  // Jump can be added at Advanced without rebuilding the physical course.
  progressionReserve: {
    N: [{ id:'advanced-jump-bay', min:1, signIds:['220'], buffer:1 }],
    I: [{ id:'advanced-jump-bay', min:1, signIds:['220'], buffer:1 }]
  },
  routeStyles: ['classic'],
  signs,
  levels,
  sequenceNext: {},
  transitionRules: sourceTransitions,
  joinedPairRules: [],
  adjacentDistanceRules: [],
  chainTemplates: {},
  dependentSigns: new Set(),
  customValidators: [caroCourseValidator]
};

export { caro2025 };
export default caro2025;
