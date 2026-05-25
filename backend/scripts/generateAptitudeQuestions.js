const fs = require('fs');
const path = require('path');

const OUTPUT_PATH = path.join(__dirname, '../data/aptitude_questions.json');

// Helper to ensure target directory exists
const ensureDir = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const SECTIONS = ["Quantitative", "Logical", "Verbal"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

// Dictionary of Verbal Questions parameters
const verbalPool = [
  { word: "AMELIORATE", syn: "Worsen", isSyn: false, qText: "Choose the word that is most nearly opposite in meaning to: 'AMELIORATE'", expl: "'Ameliorate' means to make something better. Its opposite is 'Worsen' or 'Deteriorate'." },
  { word: "LOQUACIOUS", syn: "Talkative", isSyn: true, qText: "Choose the word that is most nearly similar in meaning to: 'LOQUACIOUS'", expl: "'Loquacious' means talkative or fond of talking." },
  { word: "EPHEMERAL", syn: "Fleeting", isSyn: true, qText: "Choose the word that is most nearly similar in meaning to: 'EPHEMERAL'", expl: "'Ephemeral' means lasting for a very short time; transient or fleeting." },
  { word: "CAPRICIOUS", syn: "Stable", isSyn: false, qText: "Choose the word that is most nearly opposite in meaning to: 'CAPRICIOUS'", expl: "'Capricious' means given to sudden changes of mood or behavior. Its opposite is 'Stable' or 'Predictable'." },
  { word: "AUDACIOUS", syn: "Bold", isSyn: true, qText: "Choose the word that is most nearly similar in meaning to: 'AUDACIOUS'", expl: "'Audacious' means showing a willingness to take surprisingly bold risks." },
  { word: "PRAGMATIC", syn: "Practical", isSyn: true, qText: "Choose the word that is most nearly similar in meaning to: 'PRAGMATIC'", expl: "'Pragmatic' means dealing with things sensibly and realistically in a way that is based on practical considerations." },
  { word: "METICULOUS", syn: "Careless", isSyn: false, qText: "Choose the word that is most nearly opposite in meaning to: 'METICULOUS'", expl: "'Meticulous' means showing great attention to detail; very careful and precise. Its opposite is 'Careless' or 'Sloppy'." },
  { word: "LACONIC", syn: "Concise", isSyn: true, qText: "Choose the word that is most nearly similar in meaning to: 'LACONIC'", expl: "'Laconic' means using very few words; brief or concise." },
  { word: "BENEVOLENT", syn: "Malevolent", isSyn: false, qText: "Choose the word that is most nearly opposite in meaning to: 'BENEVOLENT'", expl: "'Benevolent' means well-meaning and kindly. Its opposite is 'Malevolent' or 'Hostile'." },
  { word: "PLACATE", syn: "Appease", isSyn: true, qText: "Choose the word that is most nearly similar in meaning to: 'PLACATE'", expl: "'Placate' means to make someone less angry or hostile; to appease." },
  { word: "OBSTINATE", syn: "Stubborn", isSyn: true, qText: "Choose the word that is most nearly similar in meaning to: 'OBSTINATE'", expl: "'Obstinate' means stubbornly refusing to change one's opinion or chosen course of action." },
  { word: "DEARTH", syn: "Abundance", isSyn: false, qText: "Choose the word that is most nearly opposite in meaning to: 'DEARTH'", expl: "'Dearth' means a scarcity or lack of something. Its opposite is 'Abundance' or 'Surplus'." },
  { word: "EQUIVOCAL", syn: "Ambiguous", isSyn: true, qText: "Choose the word that is most nearly similar in meaning to: 'EQUIVOCAL'", expl: "'Equivocal' means open to more than one interpretation; ambiguous or vague." },
  { word: "FRUGAL", syn: "Extravagant", isSyn: false, qText: "Choose the word that is most nearly opposite in meaning to: 'FRUGAL'", expl: "'Frugal' means sparing or economical with regard to money or food. Its opposite is 'Extravagant' or 'Wasteful'." },
  { word: "ALACRITY", syn: "Eagerness", isSyn: true, qText: "Choose the word that is most nearly similar in meaning to: 'ALACRITY'", expl: "'Alacrity' means brisk and cheerful readiness; eagerness." }
];

console.log("🚀 Initializing Dynamic Aptitude Questions Generation...");

const generatedQuestions = [];
const TOTAL_QUESTIONS = 2500; // Generate exactly 2,500 questions
const TOTAL_SETS = 50; // 50 sets of 50 questions each

for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
  // Determine Set number: 1 to 50
  const setNum = Math.floor((i - 1) / 50) + 1; // 50 questions per set
  
  // Determine difficulty based on Set:
  // Sets 1-20: Easy
  // Sets 21-40: Medium
  // Sets 41-50: Hard
  let difficulty = DIFFICULTIES[0]; // Easy
  if (setNum > 20) difficulty = DIFFICULTIES[1]; // Medium
  if (setNum > 40) difficulty = DIFFICULTIES[2]; // Hard

  // Cycle sections: Quantitative -> Logical -> Verbal
  const section = SECTIONS[(i - 1) % SECTIONS.length];

  let questionText = "";
  let options = [];
  let correctIndex = 1; // default B
  let explanation = "";

  if (section === "Quantitative") {
    // Pick between Speed-Distance and Profit-Loss archetypes
    if (i % 2 === 0) {
      // Speed-Distance (Train crosses pole)
      const baseSpeedKmh = ((i % 6) + 2) * 18; // Speed in kmh: 36, 54, 72, 90, 108, 126, 144
      const speedMs = baseSpeedKmh * (5/18);  // speed in m/s (always a clean integer: 10, 15, 20, 25, 30, 35, 40)
      const timeSec = ((i % 5) + 2) * 5;      // time in sec: 10, 15, 20, 25, 30
      const lengthMeters = speedMs * timeSec;  // Length in meters

      questionText = `A train running at a speed of ${baseSpeedKmh} km/hr crosses a telephone pole in ${timeSec} seconds. What is the length of the train in meters? (Variant #${i})`;
      
      const optA = `${lengthMeters - 30} m`;
      const optB = `${lengthMeters} m`;
      const optC = `${lengthMeters + 35} m`;
      const optD = `${lengthMeters + 50} m`;
      options = [optA, optB, optC, optD];
      correctIndex = 1; // Opt B is correct
      explanation = `Speed in meters per second = ${baseSpeedKmh} * (5/18) = ${speedMs} m/sec. Since the train crosses a stationary pole, the distance covered is equal to the length of the train. Length = Speed * Time = ${speedMs} * ${timeSec} = ${lengthMeters} meters.`;
    } else {
      // Profit-Loss Cost Price
      const profitPct = ((i % 5) + 1) * 10; // 10%, 20%, 30%, 40%, 50%
      const costPrice = ((i % 8) + 2) * 100; // 200, 300, 400, 500, 600, 700, 800, 900
      const sellPrice = costPrice * (1 + profitPct/100);

      questionText = `A shopkeeper sells a laptop for ₹${sellPrice} making a profit of exactly ${profitPct}%. What was the cost price of the laptop? (Variant #${i})`;
      
      const optA = `₹${costPrice - 50}`;
      const optB = `₹${costPrice - 100}`;
      const optC = `₹${costPrice}`;
      const optD = `₹${costPrice + 120}`;
      options = [optA, optB, optC, optD];
      correctIndex = 2; // Opt C is correct
      explanation = `Selling Price = Cost Price * (1 + Profit/100). Therefore, Cost Price = Selling Price / (1 + Profit/100) = ${sellPrice} / (1 + ${profitPct/100}) = ₹${costPrice}.`;
    }
  } else if (section === "Logical") {
    // Pick between Arithmetic and Geometric Series archetypes
    if (i % 2 === 0) {
      // Arithmetic series
      const start = (i % 20) + 2;
      const step = (i % 8) + 3;
      const series = [start, start + step, start + 2 * step, start + 3 * step];
      const nextVal = start + 4 * step;

      questionText = `Identify the missing value in this numerical sequence: ${series.join(', ')}, ? (Variant #${i})`;
      
      const optA = String(nextVal - 2);
      const optB = String(nextVal);
      const optC = String(nextVal + 3);
      const optD = String(nextVal + 5);
      options = [optA, optB, optC, optD];
      correctIndex = 1; // Opt B
      explanation = `This is a simple arithmetic series with a common difference of ${step} added to each term (e.g. ${series[0]} + ${step} = ${series[1]}). The next number is ${series[3]} + ${step} = ${nextVal}.`;
    } else {
      // Geometric series
      const start = (i % 5) + 1;
      const ratio = 2;
      const series = [start, start * ratio, start * ratio * ratio, start * ratio * ratio * ratio];
      const nextVal = start * ratio * ratio * ratio * ratio;

      questionText = `Look at this series: ${series.join(', ')}, ... What number should come next? (Variant #${i})`;
      
      const optA = String(nextVal);
      const optB = String(nextVal + 4);
      const optC = String(nextVal - 6);
      const optD = String(nextVal + 10);
      options = [optA, optB, optC, optD];
      correctIndex = 0; // Opt A
      explanation = `This is a simple geometric division/multiplication series. Each term is multiplied by a ratio of ${ratio} to calculate the next term. The next number is ${series[3]} * ${ratio} = ${nextVal}.`;
    }
  } else {
    // Verbal synonym/antonym pool variation
    const entry = verbalPool[(i - 1) % verbalPool.length];
    
    questionText = `${entry.qText} (Variant #${i})`;
    
    const optCorrect = entry.syn;
    // Generate wrong options
    const rawWrongs = ["Initiate", "Approve", "Corroborate", "Validate", "Exacerbate", "Maintain", "Deteriorate", "Garrulous"];
    const wrongs = rawWrongs.filter(w => w.toLowerCase() !== optCorrect.toLowerCase()).slice(0, 3);

    options = [wrongs[0], optCorrect, wrongs[1], wrongs[2]];
    correctIndex = 1; // Opt B is correct
    explanation = entry.expl;
  }

  generatedQuestions.push({
    id: `apt_q_${i}`,
    section,
    difficulty,
    question: questionText,
    options,
    correctIndex,
    explanation,
    set: setNum
  });
}

ensureDir(OUTPUT_PATH);
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(generatedQuestions, null, 2), 'utf-8');

console.log(`✅ Success! Generated ${generatedQuestions.length} dynamic Aptitude Questions!`);
console.log(`📂 Output saved directly to: ${OUTPUT_PATH}`);
