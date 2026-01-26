/**
 * Cricket Scoring Engine for HPL
 * Handles all cricket scoring rules for T20 format
 */

export class CricketEngine {
  constructor(config = {}) {
    this.maxOvers = config.maxOvers || 20; // T20 format
    this.maxWickets = config.maxWickets || 10;
    this.ballsPerOver = 6;
    
    // Match state
    this.innings = [];
    this.currentInningsIndex = 0;
    this.isMatchComplete = false;
    this.result = null;
  }

  /**
   * Initialize a new innings
   */
  startInnings(battingTeam, bowlingTeam, players = {}) {
    const innings = {
      battingTeam,
      bowlingTeam,
      runs: 0,
      wickets: 0,
      balls: 0, // Legal deliveries only
      extras: {
        wides: 0,
        noBalls: 0,
        byes: 0,
        legByes: 0,
        total: 0
      },
      overs: 0,
      runRate: 0,
      requiredRunRate: null,
      target: null,
      
      // Current players
      striker: players.striker || null,
      nonStriker: players.nonStriker || null,
      currentBowler: players.bowler || null,
      previousBowler: null,
      
      // Stats tracking
      batsmen: {}, // { playerId: { runs, balls, fours, sixes, strikeRate } }
      bowlers: {}, // { playerId: { overs, balls, runs, wickets, economy, maidens } }
      
      // Ball by ball
      ballLog: [],
      recentBalls: [],
      
      // Over tracking
      currentOverBalls: 0, // Balls in current over (legal deliveries)
      isOverComplete: false,
      
      // Innings status
      isComplete: false,
      endReason: null // 'all_out', 'overs_complete', 'target_achieved'
    };

    // Set target if 2nd innings
    if (this.innings.length === 1) {
      innings.target = this.innings[0].runs + 1;
      innings.requiredRunRate = this.calculateRequiredRunRate(innings);
    }

    this.innings.push(innings);
    this.currentInningsIndex = this.innings.length - 1;
    
    return this.getCurrentState();
  }

  /**
   * Get current innings
   */
  getCurrentInnings() {
    return this.innings[this.currentInningsIndex];
  }

  /**
   * Record a ball delivery
   * @param {Object} delivery - The delivery details
   * @param {number} delivery.runsOffBat - Runs scored off the bat (0-6)
   * @param {string} delivery.extraType - 'wide', 'noball', 'bye', 'legbye', or null
   * @param {number} delivery.extraRuns - Additional runs on extras (default 1 for wide/noball)
   * @param {boolean} delivery.wicket - Whether a wicket fell
   * @param {Object} delivery.dismissal - Dismissal details { type, fielder, bowler }
   */
  recordBall(delivery) {
    const innings = this.getCurrentInnings();
    if (!innings || innings.isComplete) {
      return { error: 'Innings not active' };
    }

    const {
      runsOffBat = 0,
      extraType = null,
      extraRuns = 0,
      wicket = false,
      dismissal = null
    } = delivery;

    // Calculate total runs for this ball
    const result = this.calculateBallRuns(runsOffBat, extraType, extraRuns);
    
    // Is this a legal delivery?
    const isLegalDelivery = !['wide', 'noball'].includes(extraType);
    
    // Create ball record
    const ballRecord = {
      ballNumber: innings.balls + (isLegalDelivery ? 1 : 0),
      overNumber: Math.floor(innings.balls / 6),
      ballInOver: isLegalDelivery ? (innings.currentOverBalls + 1) : innings.currentOverBalls,
      striker: innings.striker,
      nonStriker: innings.nonStriker,
      bowler: innings.currentBowler,
      runsOffBat,
      extraType,
      extraRuns: result.extraRuns,
      totalRuns: result.totalRuns,
      isLegalDelivery,
      wicket,
      dismissal,
      timestamp: new Date()
    };

    // Update innings totals
    innings.runs += result.totalRuns;
    innings.extras[this.getExtraKey(extraType)] += result.extraRuns;
    innings.extras.total += result.extraRuns;

    // Update balls count (only for legal deliveries)
    if (isLegalDelivery) {
      innings.balls++;
      innings.currentOverBalls++;
    }

    // Update batsman stats
    this.updateBatsmanStats(innings, runsOffBat, isLegalDelivery, extraType);

    // Update bowler stats
    this.updateBowlerStats(innings, result, isLegalDelivery, wicket, extraType);

    // Handle wicket
    if (wicket) {
      innings.wickets++;
      ballRecord.dismissedBatsman = innings.striker;
      
      // Check if all out
      if (innings.wickets >= this.maxWickets) {
        innings.isComplete = true;
        innings.endReason = 'all_out';
      }
    }

    // Determine strike rotation
    const shouldRotate = this.shouldRotateStrike(runsOffBat, extraType, extraRuns, wicket);
    if (shouldRotate && !wicket) {
      this.rotateStrike(innings);
    }

    // Check for over complete
    if (innings.currentOverBalls >= this.ballsPerOver) {
      innings.isOverComplete = true;
      innings.currentOverBalls = 0;
      
      // Rotate strike at end of over
      this.rotateStrike(innings);
      
      // Previous bowler tracking
      innings.previousBowler = innings.currentBowler;
      innings.currentBowler = null; // Needs new bowler
    } else {
      innings.isOverComplete = false;
    }

    // Update overs display
    innings.overs = this.calculateOvers(innings.balls);
    innings.runRate = this.calculateRunRate(innings.runs, innings.balls);

    // Check target (2nd innings)
    if (innings.target && innings.runs >= innings.target) {
      innings.isComplete = true;
      innings.endReason = 'target_achieved';
    }

    // Check overs complete
    if (innings.balls >= this.maxOvers * this.ballsPerOver) {
      innings.isComplete = true;
      innings.endReason = 'overs_complete';
    }

    // Update required run rate
    if (innings.target) {
      innings.requiredRunRate = this.calculateRequiredRunRate(innings);
    }

    // Add to ball log
    innings.ballLog.push(ballRecord);
    innings.recentBalls = innings.ballLog.slice(-12).map(b => this.getBallDisplay(b));

    // Check match complete
    if (innings.isComplete && this.currentInningsIndex === 1) {
      this.completeMatch();
    }

    return {
      success: true,
      ball: ballRecord,
      state: this.getCurrentState(),
      actions: this.getRequiredActions(innings)
    };
  }

  /**
   * Calculate runs for a ball
   */
  calculateBallRuns(runsOffBat, extraType, extraRuns) {
    let totalRuns = runsOffBat;
    let calculatedExtraRuns = 0;

    switch (extraType) {
      case 'wide':
        // Wide: 1 penalty + any additional runs (overthrows etc)
        calculatedExtraRuns = 1 + (extraRuns || 0);
        totalRuns = calculatedExtraRuns; // Can't score off bat on wide
        break;
        
      case 'noball':
        // No-ball: 1 penalty + runs off bat + any additional runs
        calculatedExtraRuns = 1 + (extraRuns || 0);
        totalRuns = runsOffBat + calculatedExtraRuns;
        break;
        
      case 'bye':
        // Bye: runs don't count for batsman, but count for team
        calculatedExtraRuns = runsOffBat || extraRuns || 0;
        totalRuns = calculatedExtraRuns;
        break;
        
      case 'legbye':
        // Leg bye: runs don't count for batsman, but count for team
        calculatedExtraRuns = runsOffBat || extraRuns || 0;
        totalRuns = calculatedExtraRuns;
        break;
        
      default:
        // Normal delivery
        totalRuns = runsOffBat;
        calculatedExtraRuns = 0;
    }

    return { totalRuns, extraRuns: calculatedExtraRuns };
  }

  /**
   * Get extra key for stats
   */
  getExtraKey(extraType) {
    const map = {
      'wide': 'wides',
      'noball': 'noBalls',
      'bye': 'byes',
      'legbye': 'legByes'
    };
    return map[extraType] || 'total';
  }

  /**
   * Update batsman statistics
   */
  updateBatsmanStats(innings, runsOffBat, isLegalDelivery, extraType) {
    if (!innings.striker) return;

    const strikerId = innings.striker._id || innings.striker.id || innings.striker.name;
    
    if (!innings.batsmen[strikerId]) {
      innings.batsmen[strikerId] = {
        player: innings.striker,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0
      };
    }

    const stats = innings.batsmen[strikerId];
    
    // Only count balls faced for legal deliveries (not wides)
    if (isLegalDelivery || extraType === 'noball') {
      stats.balls++;
    }
    
    // Only count runs off bat (not byes/leg byes)
    if (!['bye', 'legbye', 'wide'].includes(extraType)) {
      stats.runs += runsOffBat;
      if (runsOffBat === 4) stats.fours++;
      if (runsOffBat === 6) stats.sixes++;
    }

    stats.strikeRate = stats.balls > 0 
      ? Number(((stats.runs / stats.balls) * 100).toFixed(2)) 
      : 0;
  }

  /**
   * Update bowler statistics
   */
  updateBowlerStats(innings, result, isLegalDelivery, wicket, extraType) {
    if (!innings.currentBowler) return;

    const bowlerId = innings.currentBowler._id || innings.currentBowler.id || innings.currentBowler.name;
    
    if (!innings.bowlers[bowlerId]) {
      innings.bowlers[bowlerId] = {
        player: innings.currentBowler,
        overs: 0,
        balls: 0,
        runs: 0,
        wickets: 0,
        economy: 0,
        maidens: 0,
        currentOverRuns: 0
      };
    }

    const stats = innings.bowlers[bowlerId];
    
    // Count legal deliveries
    if (isLegalDelivery) {
      stats.balls++;
      stats.overs = this.calculateOvers(stats.balls);
    }

    // Runs conceded (includes extras from wides/no-balls, not byes/leg-byes)
    if (!['bye', 'legbye'].includes(extraType)) {
      stats.runs += result.totalRuns;
      stats.currentOverRuns += result.totalRuns;
    }

    // Wickets
    if (wicket) {
      stats.wickets++;
    }

    // Check for maiden over
    if (stats.balls % 6 === 0 && stats.balls > 0) {
      if (stats.currentOverRuns === 0) {
        stats.maidens++;
      }
      stats.currentOverRuns = 0;
    }

    // Economy rate
    const oversBowled = stats.balls / 6;
    stats.economy = oversBowled > 0 
      ? Number((stats.runs / oversBowled).toFixed(2)) 
      : 0;
  }

  /**
   * Determine if strike should rotate
   */
  shouldRotateStrike(runsOffBat, extraType, extraRuns, wicket) {
    if (wicket) return false; // New batsman takes strike
    
    // Total runs that affect strike
    let effectiveRuns = 0;
    
    switch (extraType) {
      case 'wide':
        // Strike rotates on odd runs from wide
        effectiveRuns = extraRuns || 0;
        break;
      case 'noball':
        // Strike rotates on odd total runs
        effectiveRuns = runsOffBat + (extraRuns || 0);
        break;
      case 'bye':
      case 'legbye':
        // Strike rotates on odd runs
        effectiveRuns = runsOffBat || extraRuns || 0;
        break;
      default:
        effectiveRuns = runsOffBat;
    }

    return effectiveRuns % 2 === 1;
  }

  /**
   * Rotate strike between batsmen
   */
  rotateStrike(innings) {
    const temp = innings.striker;
    innings.striker = innings.nonStriker;
    innings.nonStriker = temp;
  }

  /**
   * Set new batsman after wicket
   */
  setNewBatsman(player, onStrike = true) {
    const innings = this.getCurrentInnings();
    if (!innings) return { error: 'No active innings' };

    if (onStrike) {
      innings.striker = player;
    } else {
      innings.nonStriker = player;
    }

    return { success: true, state: this.getCurrentState() };
  }

  /**
   * Set new bowler for the over
   */
  setNewBowler(player) {
    const innings = this.getCurrentInnings();
    if (!innings) return { error: 'No active innings' };

    // Validate: can't bowl consecutive overs
    if (innings.previousBowler) {
      const prevId = innings.previousBowler._id || innings.previousBowler.id || innings.previousBowler.name;
      const newId = player._id || player.id || player.name;
      
      if (prevId === newId) {
        return { error: 'Bowler cannot bowl consecutive overs' };
      }
    }

    innings.currentBowler = player;
    innings.isOverComplete = false;

    return { success: true, state: this.getCurrentState() };
  }

  /**
   * Calculate overs from balls
   */
  calculateOvers(balls) {
    const completedOvers = Math.floor(balls / 6);
    const ballsInOver = balls % 6;
    return Number((completedOvers + ballsInOver / 10).toFixed(1));
  }

  /**
   * Calculate run rate
   */
  calculateRunRate(runs, balls) {
    if (balls === 0) return 0;
    const overs = balls / 6;
    return Number((runs / overs).toFixed(2));
  }

  /**
   * Calculate required run rate
   */
  calculateRequiredRunRate(innings) {
    if (!innings.target) return null;
    
    const runsNeeded = innings.target - innings.runs;
    const ballsRemaining = (this.maxOvers * 6) - innings.balls;
    
    if (ballsRemaining <= 0) return null;
    
    const oversRemaining = ballsRemaining / 6;
    return Number((runsNeeded / oversRemaining).toFixed(2));
  }

  /**
   * Get ball display for recent balls
   */
  getBallDisplay(ball) {
    if (ball.wicket) return 'W';
    if (ball.extraType === 'wide') return ball.extraRuns > 1 ? `Wd+${ball.extraRuns - 1}` : 'Wd';
    if (ball.extraType === 'noball') return ball.runsOffBat > 0 ? `Nb+${ball.runsOffBat}` : 'Nb';
    if (ball.extraType === 'bye') return `B${ball.totalRuns}`;
    if (ball.extraType === 'legbye') return `Lb${ball.totalRuns}`;
    return ball.runsOffBat.toString();
  }

  /**
   * Get required actions after a ball
   */
  getRequiredActions(innings) {
    const actions = [];

    if (innings.isComplete) {
      if (this.currentInningsIndex === 0) {
        actions.push({ type: 'START_SECOND_INNINGS', message: 'Start second innings' });
      } else {
        actions.push({ type: 'MATCH_COMPLETE', message: 'Match is complete' });
      }
      return actions;
    }

    if (innings.wickets > 0 && !innings.striker) {
      actions.push({ type: 'NEW_BATSMAN', message: 'Select new batsman' });
    }

    if (innings.isOverComplete || !innings.currentBowler) {
      actions.push({ 
        type: 'NEW_BOWLER', 
        message: 'Select bowler for next over',
        previousBowler: innings.previousBowler
      });
    }

    return actions;
  }

  /**
   * Complete the match and determine result
   */
  completeMatch() {
    this.isMatchComplete = true;
    
    const firstInnings = this.innings[0];
    const secondInnings = this.innings[1];

    if (!secondInnings) {
      this.result = { type: 'incomplete', message: 'Match incomplete' };
      return;
    }

    const firstTotal = firstInnings.runs;
    const secondTotal = secondInnings.runs;

    if (secondTotal >= firstTotal + 1) {
      // Second team won
      const wicketsRemaining = this.maxWickets - secondInnings.wickets;
      this.result = {
        type: 'win',
        winner: secondInnings.battingTeam,
        loser: firstInnings.battingTeam,
        margin: `${wicketsRemaining} wickets`,
        message: `${secondInnings.battingTeam.name || secondInnings.battingTeam} won by ${wicketsRemaining} wickets`
      };
    } else if (firstTotal > secondTotal) {
      // First team won
      const runMargin = firstTotal - secondTotal;
      this.result = {
        type: 'win',
        winner: firstInnings.battingTeam,
        loser: secondInnings.battingTeam,
        margin: `${runMargin} runs`,
        message: `${firstInnings.battingTeam.name || firstInnings.battingTeam} won by ${runMargin} runs`
      };
    } else {
      // Tie
      this.result = {
        type: 'tie',
        message: 'Match tied'
      };
    }
  }

  /**
   * Get current match state
   */
  getCurrentState() {
    const innings = this.getCurrentInnings();
    
    return {
      innings: this.currentInningsIndex + 1,
      runs: innings?.runs || 0,
      wickets: innings?.wickets || 0,
      overs: innings?.overs || 0,
      balls: innings?.balls || 0,
      runRate: innings?.runRate || 0,
      extras: innings?.extras || { wides: 0, noBalls: 0, byes: 0, legByes: 0, total: 0 },
      target: innings?.target || null,
      requiredRunRate: innings?.requiredRunRate || null,
      runsNeeded: innings?.target ? innings.target - innings.runs : null,
      ballsRemaining: innings ? (this.maxOvers * 6) - innings.balls : null,
      
      striker: innings?.striker || null,
      nonStriker: innings?.nonStriker || null,
      currentBowler: innings?.currentBowler || null,
      previousBowler: innings?.previousBowler || null,
      
      batsmen: innings?.batsmen || {},
      bowlers: innings?.bowlers || {},
      
      recentBalls: innings?.recentBalls || [],
      currentOverBalls: innings?.currentOverBalls || 0,
      isOverComplete: innings?.isOverComplete || false,
      isInningsComplete: innings?.isComplete || false,
      inningsEndReason: innings?.endReason || null,
      
      isMatchComplete: this.isMatchComplete,
      result: this.result
    };
  }

  /**
   * Undo last ball (for corrections)
   */
  undoLastBall() {
    const innings = this.getCurrentInnings();
    if (!innings || innings.ballLog.length === 0) {
      return { error: 'No ball to undo' };
    }

    const lastBall = innings.ballLog.pop();
    
    // Reverse all the changes
    innings.runs -= lastBall.totalRuns;
    
    if (lastBall.isLegalDelivery) {
      innings.balls--;
      innings.currentOverBalls = innings.currentOverBalls > 0 ? innings.currentOverBalls - 1 : 5;
    }
    
    if (lastBall.extraType) {
      innings.extras[this.getExtraKey(lastBall.extraType)] -= lastBall.extraRuns;
      innings.extras.total -= lastBall.extraRuns;
    }
    
    if (lastBall.wicket) {
      innings.wickets--;
    }

    // Recalculate
    innings.overs = this.calculateOvers(innings.balls);
    innings.runRate = this.calculateRunRate(innings.runs, innings.balls);
    innings.recentBalls = innings.ballLog.slice(-12).map(b => this.getBallDisplay(b));
    innings.isComplete = false;
    innings.endReason = null;

    return { success: true, undone: lastBall, state: this.getCurrentState() };
  }

  /**
   * Export match data for saving
   */
  exportMatch() {
    return {
      innings: this.innings,
      currentInningsIndex: this.currentInningsIndex,
      isMatchComplete: this.isMatchComplete,
      result: this.result,
      maxOvers: this.maxOvers
    };
  }

  /**
   * Import match data (for resuming)
   */
  importMatch(data) {
    this.innings = data.innings || [];
    this.currentInningsIndex = data.currentInningsIndex || 0;
    this.isMatchComplete = data.isMatchComplete || false;
    this.result = data.result || null;
    this.maxOvers = data.maxOvers || 20;
    
    return this.getCurrentState();
  }
}

// Singleton instance for use in services
let matchEngine = null;

export const getMatchEngine = (matchId, config) => {
  // In production, you'd want a Map of match engines by matchId
  if (!matchEngine) {
    matchEngine = new CricketEngine(config);
  }
  return matchEngine;
};

export const createMatchEngine = (config) => {
  return new CricketEngine(config);
};

export default CricketEngine;
