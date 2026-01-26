import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { HiArrowLeft, HiArrowPath } from 'react-icons/hi2'
import { matchesApi } from '../services/api'
import { useLiveScore } from '../hooks'
import { LiveScoreCard, Scorecard } from '../components/match'
import { LoadingSpinner, ErrorState } from '../components/common'

const Match = () => {
  const { matchId } = useParams()
  const [activeTab, setActiveTab] = useState('scorecard') // Default to scorecard

  // Fetch match data
  const { data: matchData, isLoading, error, refetch } = useQuery({
    queryKey: ['match', matchId],
    queryFn: () => matchesApi.getMatchById(matchId),
    enabled: !!matchId,
    refetchInterval: 10000, // Refetch every 10 seconds for live matches
  })

  const rawMatch = matchData?.data
  
  // Normalize match data - map teamA/teamB to team1/team2 for consistent component usage
  const match = useMemo(() => {
    if (!rawMatch) return null
    return {
      ...rawMatch,
      team1: rawMatch.team1 || rawMatch.teamA || {},
      team2: rawMatch.team2 || rawMatch.teamB || {},
    }
  }, [rawMatch])

  const isLive = match?.status === 'live'
  const isCompleted = match?.status === 'completed'

  // Set default tab based on match status
  useEffect(() => {
    if (isLive) {
      setActiveTab('live')
    } else {
      setActiveTab('scorecard')
    }
  }, [isLive])

  // Subscribe to live score updates (only if match is live)
  const { 
    score, 
    lastBall, 
    recentBalls, 
    isConnected, 
    currentBatsmen, 
    currentBowler,
    innings,
    target,
    isLoading: liveLoading,
    error: liveError,
    refresh: refreshLiveScore
  } = useLiveScore(
    isLive ? matchId : null,
    match?.score
  )

  // Derive the effective score (from socket or match data)
  // For completed matches, always use match data
  const effectiveScore = isCompleted 
    ? match?.score 
    : (score || match?.score || { runs: 0, wickets: 0, overs: 0 })
  const effectiveBatsmen = isCompleted 
    ? (match?.innings?.[match?.currentInnings - 1]?.batting || [])
    : (currentBatsmen?.length > 0 ? currentBatsmen : match?.currentBatsmen || match?.innings?.[match?.currentInnings - 1]?.currentBatsmen || [])
  const effectiveBowler = currentBowler || match?.currentBowler || match?.innings?.[match?.currentInnings - 1]?.currentBowler || null
  const effectiveRecentBalls = recentBalls?.length > 0 ? recentBalls : match?.recentBalls || match?.innings?.[match?.currentInnings - 1]?.recentBalls || []

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorState message="Match not found" />
      </div>
    )
  }

  // Only show Live tab if match is actually live
  const tabs = [
    ...(isLive ? [{ id: 'live', label: '🔴 Live' }] : []),
    { id: 'scorecard', label: 'Scorecard' },
    { id: 'highlights', label: 'Highlights' },
  ]

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-hpl-maroon to-hpl-navy py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link 
            to="/matches" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <HiArrowLeft /> Back to Matches
          </Link>
          {isLive && (
            <button 
              onClick={() => {
                refetch()
                refreshLiveScore()
              }}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <HiArrowPath className={liveLoading ? 'animate-spin' : ''} /> Refresh
            </button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Live Score Card */}
        {isLive && (
          <div className="mb-8">
            <LiveScoreCard 
              match={match} 
              score={effectiveScore} 
              recentBalls={effectiveRecentBalls}
              currentBatsmen={effectiveBatsmen}
              currentBowler={effectiveBowler}
              target={target}
            />
            <div className="flex items-center justify-center gap-4 mt-2">
              {isConnected ? (
                <p className="text-sm text-success flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span> Live updates active
                </p>
              ) : (
                <p className="text-sm text-warning flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-warning"></span> Connecting to live updates...
                </p>
              )}
              <button 
                onClick={() => {
                  refetch()
                  refreshLiveScore()
                }}
                className="btn btn-ghost btn-xs gap-1"
                disabled={liveLoading}
              >
                <HiArrowPath className={`w-3 h-3 ${liveLoading ? 'animate-spin' : ''}`} />
                {liveLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        )}

        {/* Static Score for non-live matches */}
        {!isLive && match && (
          <div className="bg-base-100 rounded-xl border border-base-200 p-6 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Team 1 */}
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center bg-white border border-base-200 overflow-hidden p-1"
                >
                  <img 
                    src={match?.team1?.logo} 
                    alt={match?.team1?.shortName || 'Team'}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <span className="hidden text-hpl-maroon font-epic font-bold items-center justify-center w-full h-full">
                    {match?.team1?.shortName || 'T1'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-lg">{match?.team1?.name || 'Team 1'}</p>
                  {match?.team1?.score && (
                    <p className="text-2xl font-bold">
                      {match.team1.score.runs ?? 0}/{match.team1.score.wickets ?? 0}
                      <span className="text-sm font-normal text-base-content/60 ml-2">
                        ({match.team1.score.overs ?? 0} ov)
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <span className="font-epic text-2xl text-base-content/30">VS</span>

              {/* Team 2 */}
              <div className="flex items-center gap-4 flex-row-reverse md:flex-row">
                <div>
                  <p className="font-semibold text-lg text-right md:text-left">{match?.team2?.name || 'Team 2'}</p>
                  {match?.team2?.score && (
                    <p className="text-2xl font-bold">
                      {match.team2.score.runs ?? 0}/{match.team2.score.wickets ?? 0}
                      <span className="text-sm font-normal text-base-content/60 ml-2">
                        ({match.team2.score.overs ?? 0} ov)
                      </span>
                    </p>
                  )}
                </div>
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center bg-white border border-base-200 overflow-hidden p-1"
                >
                  <img 
                    src={match?.team2?.logo} 
                    alt={match?.team2?.shortName || 'Team'}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <span className="hidden text-hpl-navy font-epic font-bold items-center justify-center w-full h-full">
                    {match?.team2?.shortName || 'T2'}
                  </span>
                </div>
              </div>
            </div>

            {/* Result */}
            {match?.result && (
              <div className="mt-6 p-4 bg-hpl-gold/10 rounded-lg text-center">
                <p className="font-semibold text-hpl-maroon">
                  {match?.result}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-primary text-primary-content' 
                  : 'bg-base-100 text-base-content hover:bg-base-200'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'live' && (
              <div className="space-y-6">
                {/* Target info for 2nd innings */}
                {target && (
                  <div className="bg-base-100 rounded-xl border border-base-200 p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-base-content/60">Target</span>
                      <span className="font-bold text-lg">{target}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-base-content/60">Need</span>
                      <span className="font-bold text-lg text-primary">
                        {Math.max(0, target - (effectiveScore?.runs || 0))} runs from {Math.max(0, (match?.overs || 6) * 6 - Math.round((effectiveScore?.overs || 0) * 6))} balls
                      </span>
                    </div>
                  </div>
                )}

                {/* Current Batsmen */}
                <div className="bg-base-100 rounded-xl border border-base-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-hpl-maroon to-hpl-maroon/80 px-4 py-3">
                    <h3 className="text-white font-epic font-semibold text-sm sm:text-base">Current Batsmen</h3>
                  </div>
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="table table-sm sm:table-md">
                        <thead>
                          <tr className="text-base-content/60 text-xs sm:text-sm">
                            <th>Batsman</th>
                            <th className="text-center">R</th>
                            <th className="text-center">B</th>
                            <th className="text-center">4s</th>
                            <th className="text-center">6s</th>
                            <th className="text-center">SR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(effectiveBatsmen.length > 0 ? effectiveBatsmen : [
                            { name: 'Batsman 1', runs: 0, balls: 0, fours: 0, sixes: 0, onStrike: true },
                            { name: 'Batsman 2', runs: 0, balls: 0, fours: 0, sixes: 0, onStrike: false },
                          ]).filter(b => !b.isOut).slice(0, 2).map((batsman, idx) => (
                            <tr key={idx} className={batsman.onStrike ? 'bg-hpl-gold/10' : ''}>
                              <td className="text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{batsman.name}</span>
                                  {batsman.onStrike && (
                                    <span className="w-2 h-2 bg-hpl-gold rounded-full animate-pulse"></span>
                                  )}
                                </div>
                              </td>
                              <td className="text-center font-bold">{batsman.runs}</td>
                              <td className="text-center text-base-content/70">{batsman.balls}</td>
                              <td className="text-center text-base-content/70">{batsman.fours}</td>
                              <td className="text-center text-base-content/70">{batsman.sixes}</td>
                              <td className="text-center text-base-content/70">
                                {batsman.balls > 0 ? ((batsman.runs / batsman.balls) * 100).toFixed(1) : '0.0'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Current Bowler */}
                <div className="bg-base-100 rounded-xl border border-base-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-hpl-navy to-hpl-navy/80 px-4 py-3">
                    <h3 className="text-white font-epic font-semibold text-sm sm:text-base">Current Bowler</h3>
                  </div>
                  <div className="p-4">
                    <div className="overflow-x-auto">
                      <table className="table table-sm sm:table-md">
                        <thead>
                          <tr className="text-base-content/60 text-xs sm:text-sm">
                            <th>Bowler</th>
                            <th className="text-center">O</th>
                            <th className="text-center">M</th>
                            <th className="text-center">R</th>
                            <th className="text-center">W</th>
                            <th className="text-center">Econ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(effectiveBowler ? [effectiveBowler] : [
                            { name: 'Current Bowler', overs: 0, maidens: 0, runs: 0, wickets: 0, economy: 0 },
                          ]).map((bowler, idx) => (
                            <tr key={idx} className="bg-hpl-navy/5">
                              <td className="font-medium text-sm">{bowler.name}</td>
                              <td className="text-center text-base-content/70">{bowler.overs}</td>
                              <td className="text-center text-base-content/70">{bowler.maidens}</td>
                              <td className="text-center text-base-content/70">{bowler.runs}</td>
                              <td className="text-center font-bold text-primary">{bowler.wickets}</td>
                              <td className="text-center text-base-content/70">{bowler.economy?.toFixed(1) || '0.0'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* This Over */}
                <div className="bg-base-100 rounded-xl border border-base-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-hpl-midnight to-hpl-midnight/80 px-4 py-3">
                    <h3 className="text-white font-epic font-semibold text-sm sm:text-base">This Over</h3>
                  </div>
                  <div className="p-4">
                    <div className="flex gap-2 flex-wrap">
                      {effectiveRecentBalls.slice(-6).map((ball, i) => (
                        <motion.span
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`
                            w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base
                            ${ball === 'W' ? 'bg-red-500 text-white' : ''}
                            ${ball === '4' ? 'bg-blue-500 text-white' : ''}
                            ${ball === '6' ? 'bg-hpl-gold text-hpl-dark' : ''}
                            ${ball === '0' ? 'bg-gray-400 text-white' : ''}
                            ${!['W', '4', '6', '0'].includes(ball) ? 'bg-base-300 text-base-content' : ''}
                          `}
                        >
                          {ball}
                        </motion.span>
                      ))}
                      {effectiveRecentBalls.length === 0 && (
                        <p className="text-base-content/50 text-sm">No balls in this over yet</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Live Commentary */}
                <div className="bg-base-100 rounded-xl border border-base-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-hpl-maroon/80 to-hpl-navy/80 px-4 py-3">
                    <h3 className="text-white font-epic font-semibold text-sm sm:text-base">Recent Balls</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {effectiveRecentBalls.slice(-5).reverse().map((ball, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                        <span className={`
                          w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                          ${ball === 'W' ? 'bg-red-500 text-white' : ''}
                          ${ball === '4' ? 'bg-blue-500 text-white' : ''}
                          ${ball === '6' ? 'bg-hpl-gold text-hpl-dark' : ''}
                          ${!['W', '4', '6'].includes(ball) ? 'bg-base-300' : ''}
                        `}>
                          {ball}
                        </span>
                        <span className="text-base-content/70 text-sm">
                          {ball === 'W' ? 'WICKET!' : 
                           ball === '4' ? 'FOUR runs!' : 
                           ball === '6' ? 'SIX! Maximum!' : 
                           ball === '0' ? 'Dot ball' : 
                           ball?.includes?.('Wd') ? 'Wide ball' :
                           ball?.includes?.('Nb') ? 'No ball' :
                           `${ball} run${parseInt(ball) > 1 ? 's' : ''}`}
                        </span>
                      </div>
                    ))}
                    {effectiveRecentBalls.length === 0 && (
                      <p className="text-base-content/50 text-sm text-center py-4">No recent balls</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'scorecard' && <Scorecard match={match} />}

            {activeTab === 'highlights' && (
              <div className="bg-base-100 rounded-xl border border-base-200 p-12 text-center">
                <p className="text-base-content/60">Highlights will be available after the match</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Match
