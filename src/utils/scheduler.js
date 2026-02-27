import { addHours, addMinutes, isBefore, isAfter, isSameMinute, startOfHour } from 'date-fns';

/**
 * Generates a schedule for 1-on-1 meetings.
 * @param {Array} participants - List of { name, email } objects.
 * @param {Object} options - Configuration options.
 * @param {string} options.mode - 'quick-pair' or 'round-robin'.
 * @param {number} [options.maxRounds] - Optional limit on number of rounds (for Round Robin).
 * @param {Date} options.startDate - Start date and time for scheduling.
 * @param {Date} options.endDate - End date and time limit.
 * @param {number} [options.duration] - Duration in minutes.
 * @param {number} [options.groupSize] - Participants per meeting (Quick Pair only).
 * @returns {Array} List of scheduled meetings: { round, timeSlot, pair: [p1, p2, ...] }.
 */
export const generateSchedule = (participants, { mode = 'quick-pair', maxRounds = null, startDate, endDate, duration = 60, groupSize = 2 }) => {
  if (!participants || participants.length < 2) return [];

  const schedule = [];
  let currentSlot = new Date(startDate);
  
  const size = Math.max(2, groupSize);

  if (mode === 'quick-pair') {
    // Quick Pair / Group: Single round, random groupings
    // We can reuse the group generation logic but just for one round
    const rounds = generateGroupRounds(participants, size, 1);
    
    // Check time constraints
    const endOfMeeting = addMinutes(currentSlot, duration);
    if (isAfter(endOfMeeting, endDate) && !isSameMinute(endOfMeeting, endDate)) {
       console.warn('Scheduled time exceeds end date.');
       return [];
    }

    if (rounds.length > 0) {
        rounds[0].forEach((group) => {
            schedule.push({
                round: 1,
                timeSlot: new Date(currentSlot),
                pair: group
            });
        });
    }

  } else if (mode === 'round-robin') {
    // Round Robin: Generate multiple rounds trying to minimize overlap
    let rounds = [];
    
    if (size === 2) {
         rounds = generateRoundRobinRounds(participants);
    } else {
         // Determine max possible rounds roughly? Or use maxRounds if provided.
         const limit = maxRounds || participants.length; 
         rounds = generateGroupRounds(participants, size, limit);
    }

    const limit = maxRounds ? Math.min(rounds.length, maxRounds) : rounds.length;

    for (let i = 0; i < limit; i++) {
        const roundGroups = rounds[i];
        
        // Check if current slot + duration is within endDate
        const endOfMeeting = addMinutes(currentSlot, duration);
        
        if (isAfter(endOfMeeting, endDate) && !isSameMinute(endOfMeeting, endDate)) {
            console.warn(`Not enough time slots for round ${i + 1}`);
            break; 
        }

        roundGroups.forEach(group => {
            schedule.push({
                round: i + 1,
                timeSlot: new Date(currentSlot),
                pair: group
            });
        });

        // Advance to next slot
        currentSlot = addMinutes(currentSlot, duration);
    }
  }

  return schedule;
};

/**
 * Generates rounds for groups > 2 using a randomized greedy approach.
 * Tries to minimize meeting the same people again.
 */
function generateGroupRounds(participants, groupSize, maxRounds) {
    const rounds = [];
    const history = new Map(); // key: email, value: Set(emails met)

    // Initialize history
    participants.forEach(p => history.set(p.email, new Set()));

    for (let r = 0; r < maxRounds; r++) {
        // Try multiple shuffles to find the best grouping for this round
        let bestRoundGroups = [];
        let minOverlapScore = Infinity;

        // Number of attempts to find a good grouping
        const attempts = 50; 

        for (let attempt = 0; attempt < attempts; attempt++) {
            const shuffled = [...participants].sort(() => 0.5 - Math.random());
            const currentGroups = [];
            let currentOverlapScore = 0;

            for (let i = 0; i < shuffled.length; i += groupSize) {
                const chunk = shuffled.slice(i, i + groupSize);
                
                // Handle remainder: merge into last group if too small
                if (chunk.length < 2 && currentGroups.length > 0) {
                    currentGroups[currentGroups.length - 1].push(...chunk);
                } else {
                    currentGroups.push(chunk);
                }
            }

            // Calculate overlap score for this configuration
            // Score = sum of how many times each pair in a group has met before
            currentGroups.forEach(group => {
                for (let i = 0; i < group.length; i++) {
                    for (let j = i + 1; j < group.length; j++) {
                        const p1 = group[i];
                        const p2 = group[j];
                        if (history.get(p1.email).has(p2.email)) {
                            currentOverlapScore++;
                        }
                    }
                }
            });
            
            // If perfect round found (score 0), take it immediately
            if (currentOverlapScore === 0) {
                bestRoundGroups = currentGroups;
                minOverlapScore = 0;
                break;
            }

            if (currentOverlapScore < minOverlapScore) {
                minOverlapScore = currentOverlapScore;
                bestRoundGroups = currentGroups;
            }
        }

        // Add best groups to rounds
        if (bestRoundGroups.length > 0) {
             rounds.push(bestRoundGroups);
             
             // Update history
             bestRoundGroups.forEach(group => {
                for (let i = 0; i < group.length; i++) {
                    for (let j = i + 1; j < group.length; j++) {
                        const p1 = group[i];
                        const p2 = group[j];
                        history.get(p1.email).add(p2.email);
                        history.get(p2.email).add(p1.email);
                    }
                }
            });
        }
    }
    
    return rounds;
}

/**
 * Generates rounds for a Round Robin tournament using the Circle Method (Pairs).
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
