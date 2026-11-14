// Preloaded offline data. Values are typical guide figures.
// n=name, e=emoji, v=default variety, y=yield per acre, d=days to maturity,
// mm=water depth per irrigation (mm), i=days between irrigations, t=tip

const CROPS = {
  rice:{n:"Rice (Paddy)",e:"🌾",v:"MTU 1010 / Swarna Sub1",y:"20–24 quintal",d:125,mm:50,i:5,t:"Watch for stem borer and blast. Keep 2–5 cm water in the field."},
  maize:{n:"Maize",e:"🌽",v:"DKC 9144 / Pusa HM-4",y:"22–26 quintal",d:95,mm:50,i:8,t:"Fall armyworm is common. Scout leaves every week."},
  cotton:{n:"Cotton",e:"☁️",v:"Bt hybrid (e.g. RCH 659)",y:"6–8 quintal",d:160,mm:60,i:12,t:"Pink bollworm risk. Use pheromone traps."},
  soybean:{n:"Soybean",e:"🫘",v:"JS 9560 / NRC 86",y:"5–6 quintal",d:95,mm:45,i:12,t:"Avoid waterlogging. Watch for girdle beetle."},
  bajra:{n:"Bajra (Pearl millet)",e:"🌾",v:"HHB 67 Improved",y:"7–8 quintal",d:80,mm:40,i:14,t:"Very drought hardy. Treat seed against downy mildew."},
  groundnut:{n:"Groundnut",e:"🥜",v:"TAG 24 / GG 20",y:"7–9 quintal",d:110,mm:45,i:10,t:"Do not over-water at pegging. Look for leaf spot."},
  arhar:{n:"Arhar (Pigeon pea)",e:"🫛",v:"Pusa 992 / Asha",y:"5–6 quintal",d:160,mm:50,i:20,t:"Pod borer is the main pest. Water at flowering."},
  jute:{n:"Jute",e:"🌿",v:"JRO 524 (Navin)",y:"10–12 quintal fibre",d:120,mm:40,i:10,t:"Needs warm, humid weather. Control stem weevil."},
  ragi:{n:"Ragi (Finger millet)",e:"🌾",v:"GPU 28 / ML 365",y:"8–10 quintal",d:110,mm:40,i:12,t:"Low water crop. Watch for blast in humid spells."},
  wheat:{n:"Wheat",e:"🌾",v:"HD 3086 / DBW 187",y:"20–22 quintal",d:135,mm:60,i:20,t:"Irrigate at crown root stage (21 days). Watch for yellow rust."},
  mustard:{n:"Mustard",e:"🌼",v:"Pusa Bold / RH 749",y:"6–8 quintal",d:125,mm:50,i:25,t:"Aphids appear in cold, cloudy weather. Spray early."},
  chickpea:{n:"Chickpea (Chana)",e:"🫘",v:"Pusa 372 / JG 11",y:"7–9 quintal",d:110,mm:50,i:25,t:"Watch for wilt and pod borer. Avoid excess water."},
  potato:{n:"Potato",e:"🥔",v:"Kufri Jyoti / Kufri Pukhraj",y:"80–100 quintal",d:90,mm:40,i:8,t:"Late blight spreads in fog. Spray preventively."},
  barley:{n:"Barley",e:"🌾",v:"RD 2552 / DWRB 137",y:"16–18 quintal",d:120,mm:50,i:22,t:"Good for light soils. Watch for aphids."},
  onion:{n:"Onion",e:"🧅",v:"Agrifound Dark Red / N-53",y:"50–60 quintal",d:120,mm:35,i:8,t:"Stop watering 10 days before harvest. Thrips are common."},
  sunflower:{n:"Sunflower",e:"🌻",v:"KBSH 44",y:"6–8 quintal",d:100,mm:50,i:15,t:"Birds damage seed heads. Water at flowering."},
  moong:{n:"Moong (Green gram)",e:"🫛",v:"Pusa Vishal / IPM 2-3",y:"3–4 quintal",d:65,mm:40,i:10,t:"Short-duration crop. Control yellow mosaic virus whitefly."},
  watermelon:{n:"Watermelon",e:"🍉",v:"Sugar Baby / Arka Manik",y:"60–80 quintal",d:90,mm:35,i:6,t:"Reduce water at fruit ripening for sweeter fruit."},
  cucumber:{n:"Cucumber",e:"🥒",v:"Pusa Uday",y:"40–50 quintal",d:60,mm:30,i:5,t:"Powdery mildew risk. Keep leaves dry and pick often."}
};

const SEASONS = {
  K:{n:"Kharif",m:"Jun – Oct",icon:"🌧️",txt:"Monsoon crops. Rain gives much of the water.",f:0.8,gap:1.2},
  R:{n:"Rabi",m:"Nov – Mar",icon:"❄️",txt:"Winter crops. Cool weather, steady irrigation.",f:1.0,gap:1.0},
  Z:{n:"Zaid",m:"Apr – Jun",icon:"☀️",txt:"Summer crops. Hot and dry, water more often.",f:1.3,gap:0.7}
};

// Zones group states by climate and soil. s = ranked crops per season. vr = local variety picks.
const ZONES = {
  nw:{soil:"Alluvial loam",sf:1.0,sg:1.0,note:"Canal and tube-well irrigated plains.",
    s:{K:["rice","maize","cotton"],R:["wheat","mustard","potato","barley"],Z:["moong","maize","watermelon"]},
    vr:{rice:"Pusa Basmati 1509 / PR 126",wheat:"HD 3086 / PBW 826",cotton:"Bt hybrid (American cotton)"}},
  gang:{soil:"Gangetic alluvial",sf:1.0,sg:1.0,note:"Fertile plains with good groundwater.",
    s:{K:["rice","maize","arhar"],R:["wheat","potato","mustard","chickpea"],Z:["moong","maize","watermelon","cucumber"]},
    vr:{rice:"Swarna Sub1 / Sahbhagi Dhan",wheat:"HD 2967 / DBW 187",maize:"Shaktiman 2 / DKC 9144"}},
  east:{soil:"Red and laterite, alluvial delta",sf:1.1,sg:0.9,note:"High rainfall. Drainage matters as much as irrigation.",
    s:{K:["rice","jute","maize","groundnut"],R:["potato","mustard","wheat","chickpea"],Z:["moong","groundnut","cucumber"]},
    vr:{rice:"Swarna Sub1 / Lalat / MTU 7029",potato:"Kufri Jyoti / Kufri Chipsona"}},
  west:{soil:"Black cotton and medium black",sf:0.9,sg:1.15,note:"Black soil holds water well. Irrigate less often.",
    s:{K:["cotton","soybean","groundnut","rice","bajra"],R:["wheat","chickpea","onion"],Z:["groundnut","watermelon","cucumber","moong"]},
    vr:{cotton:"Bt hybrid (e.g. Ajeet 155 / RCH 659)",onion:"Nashik Red / Bhima Super",groundnut:"GG 20 / TAG 24"}},
  central:{soil:"Black and red-yellow",sf:0.95,sg:1.1,note:"Rain-fed Kharif, irrigated Rabi.",
    s:{K:["soybean","maize","rice","arhar"],R:["wheat","chickpea","mustard"],Z:["moong","watermelon","sunflower"]},
    vr:{wheat:"HI 1544 / MP 3288",soybean:"JS 9560 / JS 2069",chickpea:"JG 63 / JG 11"}},
  raj:{soil:"Sandy and sandy loam",sf:1.25,sg:0.8,note:"Sandy soil drains fast. Water little but often.",
    s:{K:["bajra","groundnut","cotton","moong"],R:["mustard","wheat","chickpea","barley"],Z:["watermelon","cucumber","moong"]},
    vr:{bajra:"HHB 67 Improved / RHB 177",mustard:"RH 749 / Pusa Mustard 28",wheat:"Raj 4079 / HD 3086"}},
  south:{soil:"Red loam and black",sf:1.0,sg:0.95,note:"Two rain seasons. Tanks and borewells are common.",
    s:{K:["rice","cotton","maize","groundnut","ragi"],R:["rice","chickpea","sunflower","onion"],Z:["groundnut","watermelon","cucumber","maize"]},
    vr:{rice:"BPT 5204 / ADT 43 / Jyothi",cotton:"Bt hybrid (e.g. Bunny / Mallika)",ragi:"GPU 28 / ML 365"}},
  ne:{soil:"Acidic hill and alluvial",sf:1.05,sg:0.85,note:"Heavy monsoon. Acidic soil, so add lime before sowing.",
    s:{K:["rice","maize","jute"],R:["potato","mustard","wheat"],Z:["maize","cucumber","moong"]},
    vr:{rice:"Ranjit / Bahadur / Gomati",potato:"Kufri Jyoti / Kufri Megha"}},
  hills:{soil:"Hill loam, shallow",sf:0.9,sg:1.1,note:"Short seasons and cold nights. Choose cold-tolerant varieties.",
    s:{K:["rice","maize"],R:["wheat","potato","barley"],Z:["maize","potato","cucumber"]},
    vr:{wheat:"VL 892 / HS 507",potato:"Kufri Himalini / Kufri Jyoti",rice:"HPR 2143 / Himalaya 1"}},
  isl:{soil:"Sandy coastal and laterite",sf:1.15,sg:0.9,note:"Humid and salty air. Use salt-tolerant varieties and good drainage.",
    s:{K:["rice","maize"],R:["groundnut","cucumber","moong"],Z:["watermelon","cucumber","groundnut"]},
    vr:{rice:"CR Dhan 307 / Sea-tolerant local lines"}}
};

const STATES = {
  "Andaman & Nicobar Islands":"isl","Andhra Pradesh":"south","Arunachal Pradesh":"ne","Assam":"ne","Bihar":"gang",
  "Chandigarh":"nw","Chhattisgarh":"east","Dadra & Nagar Haveli and Daman & Diu":"west","Delhi":"nw","Goa":"west",
  "Gujarat":"west","Haryana":"nw","Himachal Pradesh":"hills","Jammu & Kashmir":"hills","Jharkhand":"east",
  "Karnataka":"south","Kerala":"south","Ladakh":"hills","Lakshadweep":"isl","Madhya Pradesh":"central",
  "Maharashtra":"west","Manipur":"ne","Meghalaya":"ne","Mizoram":"ne","Nagaland":"ne","Odisha":"east",
  "Puducherry":"south","Punjab":"nw","Rajasthan":"raj","Sikkim":"ne","Tamil Nadu":"south","Telangana":"south",
  "Tripura":"ne","Uttar Pradesh":"gang","Uttarakhand":"hills","West Bengal":"east"
};

// Area units in square metres. Bigha varies by state; 2529 m² is the common UP/Bihar figure.
const UNIT_M2 = { acre:4046.86, ha:10000, bigha:2529 };
