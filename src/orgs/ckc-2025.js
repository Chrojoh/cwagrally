const signs = {
  "3": {
    "id": "3",
    "name": "Sit",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/3.png"
  },
  "4": {
    "id": "4",
    "name": "Sit Down",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/4.png"
  },
  "5": {
    "id": "5",
    "name": "Right Turn",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 2,
    "motion": {
      "turnDelta": 90,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/5.png"
  },
  "6": {
    "id": "6",
    "name": "Left Turn",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 2,
    "motion": {
      "turnDelta": -90,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/6.png"
  },
  "7": {
    "id": "7",
    "name": "About Turn Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 2,
    "motion": {
      "turnDelta": 180,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/7.png"
  },
  "8": {
    "id": "8",
    "name": "About U Turn",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 2,
    "motion": {
      "turnDelta": -180,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/8.png"
  },
  "9": {
    "id": "9",
    "name": "270 Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 2,
    "motion": {
      "turnDelta": -90,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/9.png"
  },
  "10": {
    "id": "10",
    "name": "270 Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 2,
    "motion": {
      "turnDelta": 90,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/10.png"
  },
  "11": {
    "id": "11",
    "name": "360 Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/11.png"
  },
  "12": {
    "id": "12",
    "name": "360 Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/12.png"
  },
  "13": {
    "id": "13",
    "name": "Call Front - Finish Right - Forward",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/13.png"
  },
  "14": {
    "id": "14",
    "name": "Call Front - Finish Left - Forward",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/14.png"
  },
  "15": {
    "id": "15",
    "name": "Call Front - Finish Right - Halt",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/15.png"
  },
  "16": {
    "id": "16",
    "name": "Call Front - Finish Left - Halt",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/16.png"
  },
  "17": {
    "id": "17",
    "name": "Slow",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 2,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/17.png"
  },
  "18": {
    "id": "18",
    "name": "Fast",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 2,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/18.png"
  },
  "19": {
    "id": "19",
    "name": "Normal",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 2,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/19.png"
  },
  "20": {
    "id": "20",
    "name": "Moving Side Step Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/20.png"
  },
  "21": {
    "id": "21",
    "name": "Spiral Right - Dog Outside",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/21.png"
  },
  "22": {
    "id": "22",
    "name": "Spiral Left - Dog Inside",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/22.png"
  },
  "23": {
    "id": "23",
    "name": "Serpentine Weave Twice",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/23.png"
  },
  "24": {
    "id": "24",
    "name": "Serpentine Weave Once",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/24.png"
  },
  "25": {
    "id": "25",
    "name": "Halt - 1, 2, 3 Steps Forward",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/25.png"
  },
  "26": {
    "id": "26",
    "name": "Call Front - 1, 2, 3 Steps Back",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/26.png"
  },
  "27": {
    "id": "27",
    "name": "Down and Stop",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/27.png"
  },
  "28": {
    "id": "28",
    "name": "Fast Forward From Sit",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/28.png"
  },
  "29": {
    "id": "29",
    "name": "Left About Turn",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -180,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/29.png"
  },
  "30": {
    "id": "30",
    "name": "Walk Around Dog",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/30.png"
  },
  "31": {
    "id": "31",
    "name": "Down - Walk Around Dog",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/31.png"
  },
  "32": {
    "id": "32",
    "name": "Figure 8 - No Distractions",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/32.png"
  },
  "33": {
    "id": "33",
    "name": "Left Turn - Forward",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -90,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/33.png"
  },
  "34": {
    "id": "34",
    "name": "Right Turn - Forward",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/34.png"
  },
  "35": {
    "id": "35",
    "name": "Call Front - Walk Around Dog",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/35.png"
  },
  "36": {
    "id": "36",
    "name": "Slow Forward From Sit",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/36.png"
  },
  "37": {
    "id": "37",
    "name": "Loop Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/37.png"
  },
  "38": {
    "id": "38",
    "name": "Loop Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/38.png"
  },
  "39": {
    "id": "39",
    "name": "Diagonal Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 45,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/39.png"
  },
  "40": {
    "id": "40",
    "name": "Diagonal Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -45,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/40.png"
  },
  "41": {
    "id": "41",
    "name": "Off Set Serpentine Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/41.png"
  },
  "42": {
    "id": "42",
    "name": "Off Set Serpentine Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/42.png"
  },
  "101": {
    "id": "101",
    "name": "About Turn Right - Forward",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/101.png"
  },
  "102": {
    "id": "102",
    "name": "About U Turn - Forward",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -180,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/102.png"
  },
  "103": {
    "id": "103",
    "name": "Send Over Jump - Handler Passes By",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 2,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/103.png",
    "equipment": "jump",
    "space": {
      "footprint": {
        "kind": "rect",
        "back": 4,
        "forward": 9,
        "halfWidth": 4.5,
        "label": "CKC jump working area"
      }
    }
  },
  "104": {
    "id": "104",
    "name": "Turn Right 1 Step - Call to Heel",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/104.png"
  },
  "105": {
    "id": "105",
    "name": "Stand - Walk Around Dog",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/105.png"
  },
  "106": {
    "id": "106",
    "name": "90 Pivot Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/106.png"
  },
  "107": {
    "id": "107",
    "name": "90 Pivot Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -90,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/107.png"
  },
  "108": {
    "id": "108",
    "name": "Offset Figure 8",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/108.png"
  },
  "109": {
    "id": "109",
    "name": "Halt - Side Step Right - Halt",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/109.png"
  },
  "110": {
    "id": "110",
    "name": "Call Dog Front - Finish Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/110.png"
  },
  "111": {
    "id": "111",
    "name": "Call Dog Front - Finish Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/111.png"
  },
  "112": {
    "id": "112",
    "name": "180 Pivot Right",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/112.png"
  },
  "113": {
    "id": "113",
    "name": "180 Pivot Left",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": -180,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/113.png"
  },
  "114": {
    "id": "114",
    "name": "Down - Sit",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/114.png"
  },
  "115": {
    "id": "115",
    "name": "Stand",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/115.png"
  },
  "116": {
    "id": "116",
    "name": "Pivot Right - Forward",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/116.png"
  },
  "117": {
    "id": "117",
    "name": "Pivot Left - Forward",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -90,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/117.png"
  },
  "118": {
    "id": "118",
    "name": "Leave Dog 2 Steps - Call to Heel - Forward",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/118.png",
    "generatorEligible": false
  },
  "119": {
    "id": "119",
    "name": "270 Pivot Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -90,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/119.png"
  },
  "120": {
    "id": "120",
    "name": "270 Pivot Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/120.png"
  },
  "121": {
    "id": "121",
    "name": "360 Pivot Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/121.png"
  },
  "122": {
    "id": "122",
    "name": "360 Pivot Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/122.png"
  },
  "123": {
    "id": "123",
    "name": "Right Turn - Dog Circles Right - Forward",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/123.png"
  },
  "124": {
    "id": "124",
    "name": "Left Turn - Dog Circles Right - Forward",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -90,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/124.png"
  },
  "201": {
    "id": "201",
    "name": "Stand - Down",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/201.png"
  },
  "202": {
    "id": "202",
    "name": "Stand - Sit",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/202.png"
  },
  "203": {
    "id": "203",
    "name": "Moving Stand - Walk Around Dog",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/203.png"
  },
  "204": {
    "id": "204",
    "name": "Moving Down - Walk Around Dog",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/204.png"
  },
  "205": {
    "id": "205",
    "name": "Back Up 3 Steps - Dog Stays in Position",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/205.png"
  },
  "206": {
    "id": "206",
    "name": "Moving Down - Call to Heel - Halt",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/206.png"
  },
  "207": {
    "id": "207",
    "name": "Moving Stand - Call to Heel - Halt",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/207.png"
  },
  "208": {
    "id": "208",
    "name": "Stand - Leave Dog - Sit Dog - Call Front - Finish",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/208.png",
    "generatorEligible": false
  },
  "209": {
    "id": "209",
    "name": "Stand - Leave Dog - Down Dog - Call Front - Finish",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/209.png",
    "generatorEligible": false
  },
  "211": {
    "id": "211",
    "name": "Double Left About Turn",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/211.png"
  },
  "212": {
    "id": "212",
    "name": "About Turn Right then About U Turn",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/212.png"
  },
  "213": {
    "id": "213",
    "name": "About U Turn then About Turn Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/213.png"
  },
  "214": {
    "id": "214",
    "name": "Dog Spins Right - Forward",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/214.png"
  },
  "215": {
    "id": "215",
    "name": "Dog Spins Left - Forward",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/215.png"
  },
  "216": {
    "id": "216",
    "name": "Recall Over Jump - Handler Steps into Heel Position - Halt",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/216.png",
    "equipment": "jump",
    "space": {
      "footprint": {
        "kind": "rect",
        "back": 5,
        "forward": 11,
        "halfWidth": 5,
        "label": "CKC jump working area"
      }
    }
  },
  "217": {
    "id": "217",
    "name": "Recall Over Jump - Handler Walks Around Dog into Heel - Halt",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/217.png",
    "equipment": "jump",
    "space": {
      "footprint": {
        "kind": "rect",
        "back": 5,
        "forward": 11,
        "halfWidth": 5,
        "label": "CKC jump working area"
      }
    }
  },
  "218": {
    "id": "218",
    "name": "Call Front - Side Step Right - Finish Right - Forward",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/218.png"
  },
  "219": {
    "id": "219",
    "name": "Call Front - Side Step Left - Finish Left - Forward",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/219.png"
  },
  "298": {
    "id": "298",
    "name": "Sit Stay",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/298.png"
  },
  "299": {
    "id": "299",
    "name": "Call",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 2,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/299.png",
    "generatorEligible": false
  },
  "300": {
    "id": "300",
    "name": "270 Pivot Right - Halt",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": -90,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/300.png"
  },
  "301": {
    "id": "301",
    "name": "270 Pivot Left - Halt",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/301.png"
  },
  "302": {
    "id": "302",
    "name": "Halt - 90 Pivot Right - Halt - 3 Times",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": -90,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/302.png"
  },
  "303": {
    "id": "303",
    "name": "Halt - 90 Pivot Left - Halt - 3 Times",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/303.png"
  },
  "304": {
    "id": "304",
    "name": "Halt - Call Front - 180 Pivot Right - Finish Right - Halt",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/304.png"
  },
  "305": {
    "id": "305",
    "name": "Halt - Call Front - 180 Pivot Left - Finish Left - Halt",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": -180,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/305.png"
  },
  "306": {
    "id": "306",
    "name": "Halt - 3 Steps Sit / 2 Steps Stand / 1 Step Down",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/306.png"
  },
  "307": {
    "id": "307",
    "name": "Halt - 3 Steps Down / 2 Steps Sit / 1 Step Stand",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/307.png"
  },
  "308": {
    "id": "308",
    "name": "Halt - Side Step Left - Halt",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/308.png"
  },
  "309": {
    "id": "309",
    "name": "Moving Side Step Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/309.png"
  },
  "310": {
    "id": "310",
    "name": "Back Up Two Steps",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/310.png"
  },
  "311": {
    "id": "311",
    "name": "Back Up 5 Steps - Dog Stays in Position",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/311.png"
  },
  "312": {
    "id": "312",
    "name": "Send To Jump",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/312.png",
    "equipment": "jump",
    "space": {
      "footprint": {
        "kind": "rect",
        "back": 5,
        "forward": 11,
        "halfWidth": 5,
        "label": "CKC jump working area"
      }
    }
  },
  "313": {
    "id": "313",
    "name": "Spiral Right With One Distraction",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/313.png"
  },
  "314": {
    "id": "314",
    "name": "Spiral Left With One Distraction",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/314.png"
  },
  "315": {
    "id": "315",
    "name": "Serpentine Weave Twice With Distractions",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/315.png"
  },
  "316": {
    "id": "316",
    "name": "Serpentine Weave Once With Distractions",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/316.png"
  },
  "317": {
    "id": "317",
    "name": "Double Left About Turn - Halt",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/317.png"
  },
  "318": {
    "id": "318",
    "name": "Moving Sit - Walk Around Dog",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/318.png"
  },
  "319": {
    "id": "319",
    "name": "Moving Down - Walk to Call Marker - Call to Heel - Forward",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/319.png",
    "generatorEligible": false
  },
  "320": {
    "id": "320",
    "name": "Moving Sit - Walk to Call Marker - Call to Heel - Forward",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/320.png",
    "generatorEligible": false
  },
  "321": {
    "id": "321",
    "name": "Moving Stand - Walk to Call Marker - Call to Heel - Forward",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/321.png",
    "generatorEligible": false
  },
  "322": {
    "id": "322",
    "name": "Moving Stand - Walk to Call Marker - Call Front - Finish - Forward",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/322.png",
    "generatorEligible": false
  },
  "323": {
    "id": "323",
    "name": "Moving Stand - Walk to Call Marker - Down then Sit - Return",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/323.png",
    "generatorEligible": false
  },
  "324": {
    "id": "324",
    "name": "Recall Over Jump - Finish Right - Turn - Forward - Halt",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/324.png",
    "generatorEligible": false,
    "equipment": "jump",
    "space": {
      "footprint": {
        "kind": "rect",
        "back": 5,
        "forward": 11,
        "halfWidth": 5,
        "label": "CKC jump working area"
      }
    }
  },
  "325": {
    "id": "325",
    "name": "Recall Over Jump - Finish Left - Turn - Forward - Halt",
    "category": "station",
    "stationary": true,
    "requiresHalt": true,
    "maxUses": 1,
    "motion": {
      "turnDelta": -90,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/325.png",
    "generatorEligible": false,
    "equipment": "jump",
    "space": {
      "footprint": {
        "kind": "rect",
        "back": 5,
        "forward": 11,
        "halfWidth": 5,
        "label": "CKC jump working area"
      }
    }
  },
  "328": {
    "id": "328",
    "name": "Side by Side 360 Right Circle",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/328.png"
  },
  "329": {
    "id": "329",
    "name": "Side by Side 360 Left Circle",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/329.png"
  },
  "330": {
    "id": "330",
    "name": "Double Left About Turn - Right Turn",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 90,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/330.png"
  },
  "331": {
    "id": "331",
    "name": "Double Left About Turn - Left Turn",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": -90,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/331.png"
  },
  "332": {
    "id": "332",
    "name": "Cloverleaf Right",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/332.png"
  },
  "333": {
    "id": "333",
    "name": "Cloverleaf Left",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/333.png"
  },
  "334": {
    "id": "334",
    "name": "Recall Over Jump - Finish - About Turn - Forward",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 180,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/334.png",
    "generatorEligible": false,
    "equipment": "jump",
    "space": {
      "footprint": {
        "kind": "rect",
        "back": 5,
        "forward": 11,
        "halfWidth": 5,
        "label": "CKC jump working area"
      }
    }
  },
  "398": {
    "id": "398",
    "name": "Stand Stay",
    "category": "station",
    "stationary": false,
    "requiresHalt": false,
    "maxUses": 1,
    "motion": {
      "turnDelta": 0,
      "tolerance": 30
    },
    "image": "./assets/ckc-2025/398.png"
  },
  "324A": {
    "id": "324A",
    "name": "Directional Arrow",
    "category": "auxiliary",
    "auxiliaryOnly": true,
    "generatorEligible": false,
    "maxUses": 1,
    "motion": {
      "flexibleExit": true
    },
    "image": "./assets/ckc-2025/324A.png"
  },
  "325A": {
    "id": "325A",
    "name": "Directional Arrow",
    "category": "auxiliary",
    "auxiliaryOnly": true,
    "generatorEligible": false,
    "maxUses": 1,
    "motion": {
      "flexibleExit": true
    },
    "image": "./assets/ckc-2025/325A.png"
  },
  "334A": {
    "id": "334A",
    "name": "Directional Arrow",
    "category": "auxiliary",
    "auxiliaryOnly": true,
    "generatorEligible": false,
    "maxUses": 1,
    "motion": {
      "flexibleExit": true
    },
    "image": "./assets/ckc-2025/334A.png"
  }
};

const levels = {
  "N": {
    "id": "N",
    "name": "Rally Novice",
    "order": 10,
    "nextLevel": "I",
    "progressionTrack": [
      "N",
      "I",
      "A",
      "X",
      "M"
    ],
    "stationCount": {
      "min": 10,
      "max": 15,
      "includesStartFinish": false
    },
    "ringArea": {
      "min": 2000,
      "max": 3000
    },
    "ringDimensions": {
      "minWidth": 30
    },
    "defaultRing": {
      "width": 40,
      "height": 50
    },
    "leash": "On leash",
    "routeStyles": [
      "mixed",
      "angled-flow",
      "classic"
    ],
    "allowedSigns": [
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
      "24",
      "25",
      "26",
      "27",
      "28",
      "29",
      "30",
      "31",
      "32",
      "33",
      "34",
      "35",
      "36",
      "37",
      "38",
      "39",
      "40",
      "41",
      "42"
    ],
    "quotas": [
      {
        "id": "stationary",
        "label": "stationary exercises",
        "min": 3,
        "max": 5,
        "signIds": [
          "3",
          "4",
          "15",
          "16",
          "25",
          "27",
          "30",
          "31",
          "35",
          "36",
          "300",
          "301",
          "302",
          "303",
          "304",
          "305",
          "306",
          "307",
          "308",
          "310",
          "311",
          "317",
          "324",
          "325",
          "201",
          "202",
          "205",
          "206",
          "207",
          "208",
          "209",
          "216",
          "217",
          "109",
          "112",
          "113",
          "114",
          "115"
        ]
      }
    ]
  },
  "I": {
    "id": "I",
    "name": "Rally Intermediate",
    "order": 20,
    "nextLevel": "A",
    "progressionTrack": [
      "N",
      "I",
      "A",
      "X",
      "M"
    ],
    "stationCount": {
      "min": 12,
      "max": 17,
      "includesStartFinish": false
    },
    "ringArea": {
      "min": 2000,
      "max": 3000
    },
    "ringDimensions": {
      "minWidth": 30
    },
    "defaultRing": {
      "width": 40,
      "height": 50
    },
    "leash": "On leash",
    "routeStyles": [
      "mixed",
      "angled-flow",
      "classic"
    ],
    "allowedSigns": [
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
      "24",
      "25",
      "26",
      "27",
      "28",
      "29",
      "30",
      "31",
      "32",
      "33",
      "34",
      "35",
      "36",
      "37",
      "38",
      "39",
      "40",
      "41",
      "42",
      "101",
      "102",
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
      "124"
    ],
    "quotas": [
      {
        "id": "stationary",
        "label": "stationary exercises",
        "min": 3,
        "max": 7,
        "signIds": [
          "3",
          "4",
          "15",
          "16",
          "25",
          "27",
          "30",
          "31",
          "35",
          "36",
          "300",
          "301",
          "302",
          "303",
          "304",
          "305",
          "306",
          "307",
          "308",
          "310",
          "311",
          "317",
          "324",
          "325",
          "201",
          "202",
          "205",
          "206",
          "207",
          "208",
          "209",
          "216",
          "217",
          "109",
          "112",
          "113",
          "114",
          "115"
        ]
      },
      {
        "id": "advanced",
        "label": "Advanced-level exercises",
        "min": 3,
        "signIds": [
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
          "124"
        ]
      }
    ]
  },
  "A": {
    "id": "A",
    "name": "Rally Advanced",
    "order": 30,
    "nextLevel": "X",
    "progressionTrack": [
      "N",
      "I",
      "A",
      "X",
      "M"
    ],
    "stationCount": {
      "min": 12,
      "max": 17,
      "includesStartFinish": false
    },
    "ringArea": {
      "min": 2000,
      "max": 3000
    },
    "ringDimensions": {
      "minWidth": 30
    },
    "defaultRing": {
      "width": 40,
      "height": 50
    },
    "leash": "Off leash",
    "routeStyles": [
      "mixed",
      "angled-flow",
      "classic"
    ],
    "allowedSigns": [
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
      "24",
      "25",
      "26",
      "27",
      "28",
      "29",
      "30",
      "31",
      "32",
      "33",
      "34",
      "35",
      "36",
      "37",
      "38",
      "39",
      "40",
      "41",
      "42",
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
      "124"
    ],
    "quotas": [
      {
        "id": "stationary",
        "label": "stationary exercises",
        "min": 3,
        "max": 7,
        "signIds": [
          "3",
          "4",
          "15",
          "16",
          "25",
          "27",
          "30",
          "31",
          "35",
          "36",
          "300",
          "301",
          "302",
          "303",
          "304",
          "305",
          "306",
          "307",
          "308",
          "310",
          "311",
          "317",
          "324",
          "325",
          "201",
          "202",
          "205",
          "206",
          "207",
          "208",
          "209",
          "216",
          "217",
          "109",
          "112",
          "113",
          "114",
          "115"
        ]
      },
      {
        "id": "advanced",
        "label": "Advanced-level exercises",
        "min": 3,
        "signIds": [
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
          "124"
        ]
      },
      {
        "id": "jumps",
        "label": "jump exercise",
        "min": 1,
        "max": 1,
        "signIds": [
          "103"
        ]
      }
    ]
  },
  "X": {
    "id": "X",
    "name": "Rally Excellent",
    "order": 40,
    "nextLevel": "M",
    "progressionTrack": [
      "N",
      "I",
      "A",
      "X",
      "M"
    ],
    "stationCount": {
      "min": 15,
      "max": 20,
      "includesStartFinish": false
    },
    "ringArea": {
      "min": 2000,
      "max": 3000
    },
    "ringDimensions": {
      "minWidth": 30
    },
    "defaultRing": {
      "width": 50,
      "height": 50
    },
    "leash": "Off leash",
    "routeStyles": [
      "mixed",
      "angled-flow",
      "classic"
    ],
    "nonConsecutiveSets": [
      {
        "id": "jump-spacing",
        "label": "jump exercises must not be consecutive",
        "minStationSeparation": 2,
        "signIds": ["103", "216", "217"]
      }
    ],
    "allowedSigns": [
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
      "24",
      "25",
      "26",
      "27",
      "28",
      "29",
      "30",
      "31",
      "32",
      "33",
      "34",
      "35",
      "36",
      "37",
      "38",
      "39",
      "40",
      "41",
      "42",
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
      "201",
      "202",
      "203",
      "204",
      "205",
      "206",
      "207",
      "208",
      "209",
      "211",
      "212",
      "213",
      "214",
      "215",
      "216",
      "217",
      "218",
      "219"
    ],
    "requiredAuxiliary": [
      {
        "id": "sit-stay",
        "signId": "298"
      }
    ],
    "quotas": [
      {
        "id": "stationary",
        "label": "stationary exercises",
        "min": 3,
        "max": 7,
        "signIds": [
          "3",
          "4",
          "15",
          "16",
          "25",
          "27",
          "30",
          "31",
          "35",
          "36",
          "300",
          "301",
          "302",
          "303",
          "304",
          "305",
          "306",
          "307",
          "308",
          "310",
          "311",
          "317",
          "324",
          "325",
          "201",
          "202",
          "205",
          "206",
          "207",
          "208",
          "209",
          "216",
          "217",
          "109",
          "112",
          "113",
          "114",
          "115"
        ]
      },
      {
        "id": "advanced",
        "label": "Advanced-level exercises",
        "min": 3,
        "signIds": [
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
          "124"
        ]
      },
      {
        "id": "excellent",
        "label": "Excellent-level exercises",
        "min": 3,
        "signIds": [
          "201",
          "202",
          "203",
          "204",
          "205",
          "206",
          "207",
          "208",
          "209",
          "211",
          "212",
          "213",
          "214",
          "215",
          "216",
          "217",
          "218",
          "219"
        ]
      },
      {
        "id": "jumps",
        "label": "jump exercises",
        "min": 2,
        "max": 2,
        "signIds": [
          "103",
          "216",
          "217"
        ]
      }
    ]
  },
  "M": {
    "id": "M",
    "name": "Rally Master",
    "order": 50,
    "nextLevel": null,
    "progressionTrack": [
      "N",
      "I",
      "A",
      "X",
      "M"
    ],
    "stationCount": {
      "min": 16,
      "max": 20,
      "includesStartFinish": false
    },
    "ringArea": {
      "min": 2000,
      "max": 3000
    },
    "ringDimensions": {
      "minWidth": 30
    },
    "defaultRing": {
      "width": 50,
      "height": 55
    },
    "leash": "Off leash",
    "routeStyles": [
      "mixed",
      "angled-flow",
      "classic"
    ],
    "nonConsecutiveSets": [
      {
        "id": "jump-spacing",
        "label": "jump exercises must not be consecutive",
        "minStationSeparation": 2,
        "signIds": ["103", "216", "217", "312", "324", "325", "334"]
      }
    ],
    "allowedSigns": [
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
      "24",
      "25",
      "26",
      "27",
      "28",
      "29",
      "30",
      "31",
      "32",
      "33",
      "34",
      "35",
      "36",
      "37",
      "38",
      "39",
      "40",
      "41",
      "42",
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
      "201",
      "202",
      "203",
      "204",
      "205",
      "206",
      "207",
      "208",
      "209",
      "211",
      "212",
      "213",
      "214",
      "215",
      "216",
      "217",
      "218",
      "219",
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
      "321",
      "322",
      "323",
      "324",
      "325",
      "328",
      "329",
      "330",
      "331",
      "332",
      "333",
      "334"
    ],
    "requiredAuxiliary": [
      {
        "id": "stand-stay",
        "signId": "398"
      }
    ],
    "maxUses": {
      "5": 1,
      "6": 1,
      "9": 1,
      "10": 1
    },
    "quotas": [
      {
        "id": "stationary",
        "label": "stationary exercises",
        "min": 6,
        "max": 9,
        "signIds": [
          "3",
          "4",
          "15",
          "16",
          "25",
          "27",
          "30",
          "31",
          "35",
          "36",
          "300",
          "301",
          "302",
          "303",
          "304",
          "305",
          "306",
          "307",
          "308",
          "310",
          "311",
          "317",
          "324",
          "325",
          "201",
          "202",
          "205",
          "206",
          "207",
          "208",
          "209",
          "216",
          "217",
          "109",
          "112",
          "113",
          "114",
          "115"
        ]
      },
      {
        "id": "excellent",
        "label": "Excellent-level exercises",
        "min": 3,
        "signIds": [
          "201",
          "202",
          "203",
          "204",
          "205",
          "206",
          "207",
          "208",
          "209",
          "211",
          "212",
          "213",
          "214",
          "215",
          "216",
          "217",
          "218",
          "219"
        ]
      },
      {
        "id": "master",
        "label": "Master-level exercises",
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
          "320",
          "321",
          "322",
          "323",
          "324",
          "325",
          "328",
          "329",
          "330",
          "331",
          "332",
          "333",
          "334"
        ]
      },
      {
        "id": "jumps",
        "label": "jump exercises",
        "min": 2,
        "max": 2,
        "signIds": [
          "103",
          "216",
          "217",
          "312",
          "324",
          "325",
          "334"
        ]
      }
    ]
  }
};

// Appendix B, PDF p.128: A/X class minima are in addition to jumps.
// Master jump exercises explicitly also count toward the Master-class minimum.
for(const levelId of ['A','X','M']) {
  for(const quota of levels[levelId].quotas) {
    if(quota.id==='advanced') quota.signIds=quota.signIds.filter(id=>id!=='103');
    if(quota.id==='excellent') quota.signIds=quota.signIds.filter(id=>!['216','217'].includes(id));
  }
}

function makeResult(code, ok, message, details = null, severity = 'error') {
  return { code, ok, message, details, severity };
}

function pointToSegmentDistance(p, a, b) {
  const vx=b.x-a.x, vy=b.y-a.y, wx=p.x-a.x, wy=p.y-a.y;
  const vv=vx*vx+vy*vy;
  if (vv < 1e-9) return Math.hypot(wx,wy);
  const t=Math.max(0,Math.min(1,(wx*vx+wy*vy)/vv));
  return Math.hypot(p.x-(a.x+t*vx),p.y-(a.y+t*vy));
}

function makeAuxiliary(course) {
  const sid = course.levelId === 'X' ? '298' : course.levelId === 'M' ? '398' : null;
  if (!sid) return [];

  const finishIndex=course.nodes.findIndex(n=>n.kind==='finish');
  const finish=finishIndex>=0?course.nodes[finishIndex]:course.nodes[course.nodes.length-1];
  const prev=finishIndex>0?course.nodes[finishIndex-1]:course.nodes[course.nodes.length-2];
  if(!finish||!prev) return [];

  const dx=finish.x-prev.x,dy=finish.y-prev.y;
  const len=Math.hypot(dx,dy)||1;
  const incoming={x:dx/len,y:dy/len};

  const stayOffset=5;       // nearby after Finish; not an official CKC distance
  const leashDistance=15;   // CKC minimum
  const inset=2;

  const rotate=(v,degrees)=>{
    const r=degrees*Math.PI/180,c=Math.cos(r),s=Math.sin(r);
    return {x:v.x*c-v.y*s,y:v.x*s+v.y*c};
  };
  const inRing=p=>p.x>=inset&&p.y>=inset&&p.x<=course.ring.width-inset&&p.y<=course.ring.height-inset;

  const pathClearance=p=>{
    let d=Infinity;
    for(let i=0;i<course.nodes.length-1;i++){
      d=Math.min(d,pointToSegmentDistance(p,course.nodes[i],course.nodes[i+1]));
    }
    return d;
  };

  const corridorClearance=(a,b)=>{
    const steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)));
    let d=Infinity;
    for(let k=0;k<=steps;k++){
      const t=k/steps;
      const p={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};
      d=Math.min(d,pathClearance(p));
    }
    return d;
  };

  // Prefer continuing naturally through Finish, but search enough headings
  // and nearby Stay offsets to work with genuinely varied course geometry.
  // The rule requires the Stay exercise immediately after Finish; it does not
  // require the post-Finish lane to continue at one of only eight 45° headings.
  const preferredAngles=[0,45,-45,90,-90,135,-135,180];
  const fineAngles=[];
  for(let a=-180;a<=180;a+=15) if(!preferredAngles.includes(a)) fineAngles.push(a);
  const angles=[...preferredAngles,...fineAngles];
  const stayOffsets=[5,4,6,7,8,9,3.5];
  const candidates=[];

  for(const offset of stayOffsets){
    for(const angle of angles){
      const dir=rotate(incoming,angle);
      const stay={x:finish.x+dir.x*offset,y:finish.y+dir.y*offset};
      const leash={x:stay.x+dir.x*leashDistance,y:stay.y+dir.y*leashDistance};
      if(!inRing(stay)||!inRing(leash)) continue;

      const stayClear=pathClearance(stay);
      const corridorClear=corridorClearance(stay,leash);
      if(stayClear<2||corridorClear<1.5) continue;

      const boundary=Math.min(
        stay.x,stay.y,course.ring.width-stay.x,course.ring.height-stay.y,
        leash.x,leash.y,course.ring.width-leash.x,course.ring.height-leash.y
      );

      // Continuing the Finish direction remains the first choice. Smaller
      // departure angles and a Stay around 5 ft beyond Finish are preferred,
      // then clearance from the numbered route and boundary breaks ties.
      const anglePenalty=Math.abs(angle)*3.2;
      const offsetPenalty=Math.abs(offset-stayOffset)*5;
      const score=anglePenalty+offsetPenalty-stayClear*4-corridorClear*2-boundary;
      candidates.push({stay,leash,dir,angle,offset,score,stayClear,corridorClear});
    }
  }

  // A legal generated course should normally find a clear candidate above.
  // For unusual hand-edited layouts, still return the least-conflicting lane
  // so the validator can identify the precise setup issue rather than dropping
  // the mandatory exercise entirely.
  if(!candidates.length){
    for(const offset of stayOffsets){
      for(const angle of angles){
        const dir=rotate(incoming,angle);
        const stay={x:finish.x+dir.x*offset,y:finish.y+dir.y*offset};
        const leash={x:stay.x+dir.x*leashDistance,y:stay.y+dir.y*leashDistance};
        if(!inRing(stay)||!inRing(leash)) continue;
        candidates.push({
          stay,leash,dir,angle,offset,
          score:Math.abs(angle)*3.2+Math.abs(offset-stayOffset)*5-pathClearance(stay)*2-corridorClearance(stay,leash)
        });
      }
    }
  }

  const chosen=candidates.sort((a,b)=>a.score-b.score)[0];
  if(!chosen) return [];

  return [{
    kind:'auxiliary',
    id:sid==='298'?'sit-stay':'stand-stay',
    signId:sid,
    label:sid==='298'?'Sit Stay after Finish':'Stand Stay after Finish',
    x:chosen.stay.x,
    y:chosen.stay.y,
    leashX:chosen.leash.x,
    leashY:chosen.leash.y,
    distanceFt:leashDistance,
    counted:false,
    afterFinish:true,
    finishX:finish.x,
    finishY:finish.y,
    note:'Mandatory after Finish; non-counted. Handler proceeds to the Stay sign, then walks forward at least 15 ft to retrieve the leash.'
  }];
}

function ckcCourseValidator(course, pack) {
  const level=pack.levels[course.levelId];
  const stations=course.nodes.filter(n=>n.kind==='station');
  const jumpSet=new Set(['103','216','217','312','324','325','334']);
  const jumpIdx=stations.map((n,i)=>jumpSet.has(n.signId)?i:-1).filter(i=>i>=0);
  const consecutive=[];
  for(let i=1;i<jumpIdx.length;i++) if(jumpIdx[i]===jumpIdx[i-1]+1) {
    consecutive.push({station:jumpIdx[i-1]+1,nextStation:jumpIdx[i]+1,stationId:stations[jumpIdx[i-1]].stationId,nextStationId:stations[jumpIdx[i]].stationId});
  }
  const out=[];
  if(['X','M'].includes(course.levelId)) out.push(makeResult(
    'ckc:jumps-not-consecutive',
    consecutive.length===0,
    consecutive.length?`${consecutive.length} consecutive jump pair(s) found`:'Required jumps are not consecutive',
    consecutive
  ));

  if(['X','M'].includes(course.levelId)) {
    const aux=(course.auxiliary||[])[0];
    let minPath=Infinity;
    if(aux) for(let i=0;i<course.nodes.length-1;i++) minPath=Math.min(minPath,pointToSegmentDistance(aux,course.nodes[i],course.nodes[i+1]));
    out.push(makeResult(
      'ckc:stay-off-path',
      !!aux && minPath>=2,
      !aux?'Mandatory stay sign is missing':minPath<2?'Mandatory stay sign is in/too close to the main course path':'Mandatory stay sign is outside the main course path',
      aux?{signId:aux.signId,minPath}:null
    ));

    const finish=course.nodes.find(n=>n.kind==='finish');
    const finishGap=aux&&finish?Math.hypot(aux.x-finish.x,aux.y-finish.y):0;
    out.push(makeResult(
      'ckc:stay-after-finish',
      !!aux && !!finish && aux.afterFinish===true && finishGap>=3 && finishGap<=10,
      !aux?'Mandatory stay sign is missing':!finish?'Finish is missing':'Stay sign should be placed immediately after Finish in the post-Finish flow',
      aux&&finish?{signId:aux.signId,finishGap}:null
    ));

    const leashDistance=aux&&aux.leashX!=null&&aux.leashY!=null
      ? Math.hypot(aux.leashX-aux.x,aux.leashY-aux.y)
      : 0;
    out.push(makeResult(
      'ckc:stay-leash-distance',
      !!aux && leashDistance>=15-0.05,
      !aux?'Mandatory stay sign is missing':leashDistance<15?'Leash retrieval point must be at least 15 ft forward from the Stay sign':'Leash retrieval lane is at least 15 ft',
      aux?{signId:aux.signId,leashDistance}:null
    ));

    const leashInRing=!!aux && aux.leashX>=0 && aux.leashY>=0 &&
      aux.leashX<=course.ring.width && aux.leashY<=course.ring.height;
    out.push(makeResult(
      'ckc:stay-leash-in-ring',
      leashInRing,
      leashInRing?'Leash retrieval point is inside the ring':'Leash retrieval point falls outside the ring',
      aux?{x:aux.leashX,y:aux.leashY}:null
    ));
  }
  return out;
}

const ckc2025 = {
  id:'ckc',
  version:'2025',
  discipline:'rally',
  shortName:'CKC',
  name:'Canadian Kennel Club Rally Obedience',
  sourceLabel:'Obedience & Rally Obedience Trial Rules & Regulations effective Jan. 1, 2025',
  assetBase:'./assets/ckc-2025/',
  layout:{preferredGap:8},
  // CKC Advanced requires one jump and Excellent/Master require two. Reserve
  // two compatible working bays before those levels so the minimum-change
  // optimizer can keep the lower-level station layout intact.
  progressionReserve:{
    // Excellent requires exactly two nonconsecutive jump exercises. Novice and
    // Intermediate reserve two separated compatible bays. Advanced already
    // contains exactly one #103 jump, so its reserve is anchored to that actual
    // jump station and proves that a second nonconsecutive jump can be added
    // without moving the first one.
    N:[{id:'future-jump-bays',min:2,signIds:['103','216','217'],buffer:1,minStationSeparation:2}],
    I:[{id:'future-jump-bays',min:2,signIds:['103','216','217'],buffer:1,minStationSeparation:2}],
    A:[{id:'future-jump-bays',min:2,signIds:['103','216','217'],buffer:1,minStationSeparation:2,anchorCurrentSignIds:['103'],requireAnchorCount:1}],
    // Master may keep either Excellent jump exercise; reserve verifies the two
    // existing jump locations remain mutually legal/nonconsecutive while the
    // remaining stations are converted to Master-level exercises.
    X:[{id:'master-jump-bays',min:2,signIds:['103','216','217','312','324','325','334'],buffer:1,minStationSeparation:2,anchorCurrentSignIds:['103','216','217'],requireAnchorCount:2}]
  },
  routeStyles:['mixed','angled-flow','classic'],
  signs,
  levels,
  sequenceNext:{},
  transitionRules:{},
  joinedPairRules:[],
  adjacentDistanceRules:[],
  chainTemplates:{},
  dependentSigns:new Set(),
  makeAuxiliary,
  customValidators:[ckcCourseValidator]
};

export { ckc2025 };
export default ckc2025;
