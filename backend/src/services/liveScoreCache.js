// Redis keys for live match data
export const getLiveScoreKey = (matchId) => `hpl:match:${matchId}:live`;
export const getLiveStateKey = (matchId) => `hpl:match:${matchId}:state`;
export const getScoringStateKey = (matchId) => `hpl:match:${matchId}:scoring`;

// TTL: 6 hours for live match data (matches typically don't last that long)
const LIVE_TTL = 60 * 60 * 6;
// TTL: 24 hours for scoring state (in case admin needs to resume next day)
const SCORING_TTL = 60 * 60 * 24;

// Save live score data (for public viewers)
export const saveLiveScore = async (redis, matchId, data) => {
  if (!redis) return;
  try {
    await redis.set(getLiveScoreKey(matchId), JSON.stringify(data), { EX: LIVE_TTL });
  } catch (err) {
    console.error('Failed to save live score to Redis:', err.message);
  }
};

// Get live score data
export const getLiveScore = async (redis, matchId) => {
  if (!redis) return null;
  try {
    const data = await redis.get(getLiveScoreKey(matchId));
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Failed to get live score from Redis:', err.message);
    return null;
  }
};

// Save complete match state (for live display - includes batsmen, bowler, innings)
export const saveLiveState = async (redis, matchId, state) => {
  if (!redis) return;
  try {
    await redis.set(getLiveStateKey(matchId), JSON.stringify(state), { EX: LIVE_TTL });
  } catch (err) {
    console.error('Failed to save live state to Redis:', err.message);
  }
};

// Get complete match state
export const getLiveState = async (redis, matchId) => {
  if (!redis) return null;
  try {
    const data = await redis.get(getLiveStateKey(matchId));
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Failed to get live state from Redis:', err.message);
    return null;
  }
};

// Save scoring state (for admin resumption - full scoring panel state)
export const saveScoringState = async (redis, matchId, scoringState) => {
  if (!redis) return;
  try {
    await redis.set(getScoringStateKey(matchId), JSON.stringify({
      ...scoringState,
      savedAt: new Date().toISOString()
    }), { EX: SCORING_TTL });
  } catch (err) {
    console.error('Failed to save scoring state to Redis:', err.message);
  }
};

// Get scoring state (for admin to resume)
export const getScoringState = async (redis, matchId) => {
  if (!redis) return null;
  try {
    const data = await redis.get(getScoringStateKey(matchId));
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Failed to get scoring state from Redis:', err.message);
    return null;
  }
};

// Delete all live data for a match (when match ends)
export const deleteLiveData = async (redis, matchId) => {
  if (!redis) return;
  try {
    await redis.del(getLiveScoreKey(matchId));
    await redis.del(getLiveStateKey(matchId));
    await redis.del(getScoringStateKey(matchId));
  } catch (err) {
    console.error('Failed to delete live data from Redis:', err.message);
  }
};

// Build comprehensive live data object from match
export const buildLiveData = (match) => {
  const currentInningsData = match.innings?.[match.currentInnings - 1] || {};
  
  return {
    matchId: match._id.toString(),
    status: match.status,
    currentInnings: match.currentInnings,
    score: match.score || { runs: 0, wickets: 0, overs: 0, runRate: 0 },
    currentBatsmen: currentInningsData.currentBatsmen || [],
    currentBowler: currentInningsData.currentBowler || null,
    recentBalls: currentInningsData.recentBalls || [],
    battingTeam: currentInningsData.battingTeam,
    bowlingTeam: currentInningsData.bowlingTeam,
    innings: match.innings?.map(inn => ({
      battingTeam: inn.battingTeam,
      bowlingTeam: inn.bowlingTeam,
      runs: inn.runs,
      wickets: inn.wickets,
      overs: inn.overs,
      runRate: inn.runRate
    })) || [],
    toss: match.toss,
    target: match.currentInnings === 2 ? (match.innings?.[0]?.runs || 0) + 1 : null,
    overs: match.overs,
    lastUpdated: new Date().toISOString()
  };
};
