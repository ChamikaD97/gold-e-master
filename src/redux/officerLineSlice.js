// src/redux/slices/officerLineSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  officerLineMap: {
  "Udayanga": [
    {
      "line": 6,
      "code": "BA",
      "officer": "Udayanga"
    },
    {
      "line": 7,
      "code": "BK",
      "officer": "Udayanga"
    },
    {
      "line": 25,
      "code": "K",
      "officer": "Udayanga"
    },
    {
      "line": 36,
      "code": "N",
      "officer": "Udayanga"
    },
    {
      "line": 61,
      "code": "PK",
      "officer": "Udayanga"
    },
    {
      "line": 62,
      "code": "PT",
      "officer": "Udayanga"
    },
    {
      "line": 64,
      "code": "PT2",
      "officer": "Udayanga"
    },
    {
      "line": 102,
      "code": "DM",
      "officer": "Udayanga"
    },
    {
      "line": 150,
      "code": "A",
      "officer": "Udayanga"
    },
    {
      "line": 155,
      "code": "KM",
      "officer": "Udayanga"
    },
    {
      "line": 161,
      "code": "DM-2",
      "officer": "Udayanga"
    }
  ],
  "Ajith": [
    {
      "line": 8,
      "code": "BM",
      "officer": "Ajith"
    },
    {
      "line": 10,
      "code": "PH",
      "officer": "Ajith"
    },
    {
      "line": 33,
      "code": "MP",
      "officer": "Ajith"
    },
    {
      "line": 65,
      "code": "PW",
      "officer": "Ajith"
    },
    {
      "line": 74,
      "code": "UP",
      "officer": "Ajith"
    },
    {
      "line": 81,
      "code": "MT",
      "officer": "Ajith"
    },
    {
      "line": 97,
      "code": "MULATIYANA",
      "officer": "Ajith"
    },
    {
      "line": 98,
      "code": "TP",
      "officer": "Ajith"
    },
    {
      "line": 145,
      "code": "PP",
      "officer": "Ajith"
    },
    {
      "line": 146,
      "code": "GO",
      "officer": "Ajith"
    },
    {
      "line": 152,
      "code": "UG",
      "officer": "Ajith"
    }
  ],
  "Udara": [
    {
      "line": 9,
      "code": "D",
      "officer": "Udara"
    },
    {
      "line": 23,
      "code": "J",
      "officer": "Udara"
    },
    {
      "line": 60,
      "code": "D",
      "officer": "Udara"
    },
    {
      "line": 72,
      "code": "T",
      "officer": "Udara"
    },
    {
      "line": 96,
      "code": "SLF",
      "officer": "Udara"
    },
    {
      "line": 110,
      "code": "HA",
      "officer": "Udara"
    },
    {
      "line": 149,
      "code": "TK",
      "officer": "Udara"
    }
  ],
  "Gamini": [
    {
      "line": 12,
      "code": "DG",
      "officer": "Gamini"
    },
    {
      "line": 31,
      "code": "ML",
      "officer": "Gamini"
    },
    {
      "line": 34,
      "code": "MV",
      "officer": "Gamini"
    },
    {
      "line": 70,
      "code": "SELF",
      "officer": "Gamini"
    },
    {
      "line": 127,
      "code": "C13",
      "officer": "Gamini"
    },
    {
      "line": 127,
      "code": "C-13",
      "officer": "Gamini"
    },
    {
      "line": 157,
      "code": "ML 02",
      "officer": "Gamini"
    }
  ],
  "Chamod": [
    {
      "line": 67,
      "code": "S2",
      "officer": "Chamod"
    },
    {
      "line": 68,
      "code": "S",
      "officer": "Chamod"
    },
    {
      "line": 69,
      "code": "S2 II",
      "officer": "Chamod"
    },
    {
      "line": 91,
      "code": "NG",
      "officer": "Chamod"
    },
    {
      "line": 124,
      "code": "DR01",
      "officer": "Chamod"
    },
    {
      "line": 124,
      "code": "DR-01",
      "officer": "Chamod"
    },
    {
      "line": 138,
      "code": "DR2",
      "officer": "Chamod"
    },
    {
      "line": 139,
      "code": "DR3",
      "officer": "Chamod"
    }
  ]
},
  allLines: [
  "A",
  "BA",
  "BK",
  "BM",
  "C-13",
  "C13",
  "D",
  "DG",
  "DM",
  "DM-2",
  "DR",
  "DR-01",
  "DR01",
  "GO",
  "HA",
  "J",
  "K",
  "KM",
  "ML",
  "ML 02",
  "MP",
  "MT",
  "MULATIYANA",
  "MV",
  "N",
  "NG",
  "PH",
  "PK",
  "PP",
  "PT",
  "PT2",
  "PW",
  "S",
  "S2",
  "S2 II",
  "SELF",
  "SLF",
  "T",
  "TK",
  "TP",
  "UG",
  "UP"
]
};

const officerLineSlice = createSlice({
  name: "officerLine",
  initialState,
  reducers: {
    setOfficerLineMap: (state, action) => {
      state.officerLineMap = action.payload;
    },
    setAllLines: (state, action) => {
      state.allLines = action.payload;
    }
  }
});

export const { setOfficerLineMap, setAllLines } = officerLineSlice.actions;
export default officerLineSlice.reducer;
