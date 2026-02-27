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
 * Generates rounds for groups > 2.
 * Ensures strict condition: each unordered pair must occur strictly at most once.
 * Maximizes the number of valid rounds using randomized DFS backtracking.
 */
function generateGroupRounds(participants, groupSize, maxRounds) {
    const rounds = [];
    const history = new Map();

    participants.forEach(p => history.set(p.email, new Set()));

    const n = participants.length;
    let groupSizes = [];
    let remainder = n % groupSize;
    let numGroups = Math.floor(n / groupSize);
    
    for (let i = 0; i < numGroups; i++) {
        groupSizes.push(groupSize);
    }
    if (remainder === 1 && numGroups > 0) {
        groupSizes[groupSizes.length - 1]++;
    } else if (remainder > 1) {
        groupSizes.push(remainder);
    } else if (remainder === 1 && numGroups === 0) {
        groupSizes.push(1);
    }

    const theoreticalMax = n;
    const limit = maxRounds || theoreticalMax;
    const emailToParticipant = {};
    participants.forEach(p => emailToParticipant[p.email] = p);

    for (let r = 0; r < limit; r++) {
        let bestRound = null;
        let pEmails = participants.map(p => p.email);
        
        const attempts = 100;
        for (let attempt = 0; attempt < attempts; attempt++) {
            pEmails.sort(() => Math.random() - 0.5);
            let currentGroups = Array(groupSizes.length).fill(0).map(() => []);
            let iters = 0;
            
            function solve(pIndex) {
                if (iters++ > 5000) return false;
                if (pIndex === n) return true;
                
                let p = pEmails[pIndex];
                
                for (let gIndex = 0; gIndex < groupSizes.length; gIndex++) {
                    if (currentGroups[gIndex].length < groupSizes[gIndex]) {
                        let canAdd = true;
                        for (let other of currentGroups[gIndex]) {
                            if (history.get(p).has(other)) {
                                canAdd = false;
                                break;
                            }
                        }
                        
                        if (canAdd) {
                            currentGroups[gIndex].push(p);
                            if (solve(pIndex + 1)) return true;
                            currentGroups[gIndex].pop();
                        }
                        
                        if (currentGroups[gIndex].length === 0) {
                            break;
                        }
                    }
                }
                return false;
            }
            
            if (solve(0)) {
                bestRound = currentGroups.map(g => g.map(email => emailToParticipant[email]));
                break;
            }
        }

        if (bestRound) {
            rounds.push(bestRound);
            bestRound.forEach(group => {
                for (let i = 0; i < group.length; i++) {
                    for (let j = i + 1; j < group.length; j++) {
                        history.get(group[i].email).add(group[j].email);
                        history.get(group[j].email).add(group[i].email);
                    }
                }
            });
        } else {
            break; 
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
