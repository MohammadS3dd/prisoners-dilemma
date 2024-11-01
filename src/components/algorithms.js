const algorithms = {};

// Always Cooperate
algorithms.ALLC = {
  name: "Always Cooperate",
  description: "Cooperate every move.",
  turn: (myHistory, theirHistory) => true,
};

// Always Defect
algorithms.ALLD = {
  name: "Always Defect",
  description: "Defect every move.",
  turn: (myHistory, theirHistory) => false,
};

// Alternate
algorithms.ALT = {
  name: "Alterante",
  description: "Start by cooperating, then cooperate and defect alternately.",
  turn: (myHistory, theirHistory) => {
    return myHistory.length % 2 === 0;
  },
};

// Appease
algorithms.APP = {
  name: "Appease",
  description:
    "Start by cooperating, then repeat your previous move if the other player has cooperated or do the opposite if they have defected.",
  turn: (myHistory, theirHistory) => {
    if (myHistory.length === 0) {
      return true;
    }

    return theirHistory[theirHistory.length - 1] === true
      ? myHistory[myHistory.length - 1]
      : !myHistory[myHistory.length - 1];
  },
};

// Copy Average
algorithms.CPAVG = {
  name: "Copy Average",
  description:
    "Choose a random move, but with a probability distribution that matches the other player's move distribution. In other words, if the other player has cooperated for 20% of the time, cooperate with a probability of 20%.",
  turn: (myHistory, theirHistory) => {
    return (
      Math.random() <=
      theirHistory.filter((x) => x === true).length / theirHistory.length
    );
  },
};

// Grim Trigger
algorithms.GRIM = {
  name: "Grim Trigger",
  description:
    "Cooperate until the other player defects, after that always defect.",
  turn: (myHistory, theirHistory) => {
    return !theirHistory.includes(false);
  },
};

// Pavlovian
algorithms.PAV = {
  name: "Pavlovian",
  description:
    "Start by cooperating, then repeat the previous move if had a positive outcome or do the opposite otherwise.",
  turn: (myHistory, theirHistory) => {
    if (myHistory.length === 0) {
      return true;
    }

    const myPrev = myHistory[myHistory.length - 1] === true;
    const theirPrev = theirHistory[theirHistory.length - 1] === true;

    return (myPrev && theirPrev) || (!myPrev && theirPrev) ? myPrev : !myPrev;
  },
};

// Random
algorithms.RAND = {
  name: "Random",
  description: "Make a random move.",
  turn: (myHistory, theirHistory) => {
    return Math.random() >= 0.5;
  },
};

// Tit for Tat
algorithms.TFT = {
  name: "Tit for Tat",
  description: "Start by cooperating, then copy the other player's moves.",
  turn: (myHistory, theirHistory) => {
    return theirHistory.length === 0 || theirHistory[theirHistory.length - 1];
  },
};

// Tit for Two Tats
algorithms.TFTT = {
  name: "Tit for Two Tats",
  description:
    "Always cooperate, unless the other player has defected the last two times.",
  turn: (myHistory, theirHistory) => {
    return (
      myHistory.length <= 1 ||
      theirHistory[theirHistory.length - 1] === true ||
      theirHistory[theirHistory.length - 2] === true
    );
  },
};


// Two Tits for Tat
algorithms.TTFT = {
  name: "Two Tits for Tat",
  description:
    "Always cooperate, unless the other player has betrayed at least once in the last two moves.",
  turn: (myHistory, theirHistory) => {
    return (
      myHistory.length <= 1 ||
      theirHistory[theirHistory.length - 1] === false ||
      theirHistory[theirHistory.length - 2] === false
    );
  },
};
algorithms.UKNOWN = { name: "Unknown ???" };

export const algorithmKeys = Object.keys(algorithms);
export const algorithmFuncs = Object.values(algorithms);
export default algorithms;
export function calculateScores(player1History, player2History) {
  // Ensure both histories are the same length
  if (player1History.length > player2History.length) {
    player1History = player1History.slice(0, player2History.length);
} else if (player2History.length > player1History.length) {
    player2History = player2History.slice(0, player1History.length);
}
  // Define scores
  const scores = {
      bothCooperate: [3, 3],
      player1Defects: [5, 0],
      player2Defects: [0, 5],
      bothDefect: [1, 1]
  };

  // Initialize score totals
  let player1Score = 0;
  let player2Score = 0;

  // Calculate scores based on each round
  for (let i = 0; i < player1History.length; i++) {
      const player1Choice = player1History[i];
      const player2Choice = player2History[i];

      if (player1Choice && player2Choice) { // Both cooperate
          player1Score += scores.bothCooperate[0];
          player2Score += scores.bothCooperate[1];
      } else if (!player1Choice && player2Choice) { // Player 1 defects, Player 2 cooperates
          player1Score += scores.player1Defects[0];
          player2Score += scores.player1Defects[1];
      } else if (player1Choice && !player2Choice) { // Player 1 cooperates, Player 2 defects
          player1Score += scores.player2Defects[0];
          player2Score += scores.player2Defects[1];
      } else { // Both defect
          player1Score += scores.bothDefect[0];
          player2Score += scores.bothDefect[1];
      }
  }

  // Return the total scores
  return {
      p1: player1Score,
      p2: player2Score
  };
}
export function getRandomItem(arr) {
  if (arr.length === 0) return null; // Handle empty array case
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}