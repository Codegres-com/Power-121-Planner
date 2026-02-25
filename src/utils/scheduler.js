import { addHours, isBefore, isAfter, isSameMinute, startOfHour } from 'date-fns';

/**
 * Generates a schedule for 1-on-1 meetings.
 * @param {Array} participants - List of { name, email } objects.
 * @param {Object} options - Configuration options.
 * @param {string} options.mode - 'quick-pair' or 'round-robin'.
 * @param {number} [options.maxRounds] - Optional limit on number of rounds (for Round Robin).
 * @param {Date} options.startDate - Start date and time for scheduling.
 * @param {Date} options.endDate - End date and time limit.
 * @returns {Array} List of scheduled meetings: { round, timeSlot, pair: [p1, p2] }.
 */
export const generateSchedule = (participants, { mode = 'quick-pair', maxRounds = null, startDate, endDate }) => {
  if (!participants || participants.length < 2) return [];

  const schedule = [];
  let currentSlot = new Date(startDate);

  // Ensure we start at the beginning of the hour if desired?
  // User didn't specify, but "1 hour slot" implies clean slots.
  // For now, respect the exact start time provided by the user.

  if (mode === 'quick-pair') {
    // Quick Pair: Single round, random pairings
    const shuffled = [...participants].sort(() => 0.5 - Math.random());
    const pairs = [];

    for (let i = 0; i < shuffled.length - 1; i += 2) {
      pairs.push([shuffled[i], shuffled[i+1]]);
    }

    // Check time constraints
    if (isAfter(addHours(currentSlot, 1), endDate) && !isSameMinute(addHours(currentSlot, 1), endDate)) {
       console.warn('Scheduled time exceeds end date.');
       return [];
    }

    pairs.forEach((pair) => {
      schedule.push({
        round: 1,
        timeSlot: new Date(currentSlot),
        pair
      });
    });

  } else if (mode === 'round-robin') {
    // Round Robin: Generate all rounds
    const rounds = generateRoundRobinRounds(participants);
    const limit = maxRounds ? Math.min(rounds.length, maxRounds) : rounds.length;

    for (let i = 0; i < limit; i++) {
        const roundPairs = rounds[i];

        // Check if current slot + 1 hour is within endDate
        // allow if end of meeting matches endDate exactly
        const endOfMeeting = addHours(currentSlot, 1);

        if (isAfter(endOfMeeting, endDate) && !isSameMinute(endOfMeeting, endDate)) {
            console.warn(`Not enough time slots for round ${i + 1}`);
            break;
        }

        roundPairs.forEach(pair => {
            schedule.push({
                round: i + 1,
                timeSlot: new Date(currentSlot),
                pair
            });
        });

        // Advance to next slot
        currentSlot = addHours(currentSlot, 1);
    }
  }

  return schedule;
};

/**
 * Generates rounds for a Round Robin tournament using the Circle Method.
 * @param {Array} participants
 * @returns {Array<Array<[p1, p2]>>} Array of rounds, each containing an array of pairs.
 */
function generateRoundRobinRounds(participants) {
    let people = [...participants];
    // If odd number of participants, add a dummy 'BYE' participant
    if (people.length % 2 !== 0) {
        people.push({ name: 'BYE', email: null, isBye: true });
    }

    const n = people.length;
    const rounds = [];
    const numRounds = n - 1; // For n people (where n is even), n-1 rounds needed

    // Initial setup for rotation
    // Keep first player fixed, rotate the rest
    // Using indices to track rotation is easier, but array manipulation works too.

    // We need to keep a reference to the fixed player
    const fixedPlayer = people[0];
    let rotatingPlayers = people.slice(1);

    for (let r = 0; r < numRounds; r++) {
        const roundPairs = [];

        // Form pairs for this round
        // Pair 0: Fixed player vs last of rotating
        // But wait, standard circle method:
        // P0  P1  P2
        // P5  P4  P3
        // Pairs: (P0, P5), (P1, P4), (P2, P3)

        // Let's reconstruct the circle for this round
        const currentCircle = [fixedPlayer, ...rotatingPlayers];

        // Pair them up
        for (let i = 0; i < n / 2; i++) {
            const p1 = currentCircle[i];
            const p2 = currentCircle[n - 1 - i];

            // Check for BYE
            if (!p1.isBye && !p2.isBye) {
                roundPairs.push([p1, p2]);
            }
        }

        rounds.push(roundPairs);

        // Rotate the rotating players array
        // Last element moves to front
        const last = rotatingPlayers.pop();
        rotatingPlayers.unshift(last);
    }

    return rounds;
}
