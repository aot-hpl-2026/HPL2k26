import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { HiArrowLeft } from 'react-icons/hi2'
import { matchesApi } from '../services/api'
import { Scorecard } from '../components/match'
import { LoadingSpinner, ErrorState } from '../components/common'

// Returns "base+penalty/wickets" when penalty > 0, else "total/wickets"
const formatScore = (inns) => {
  const penalty = inns?.penaltyRuns || 0
  const total = inns?.runs ?? 0
  const wickets = inns?.wickets ?? 0
  if (penalty > 0) return `${total - penalty}+${penalty}/${wickets}`
  return `${total}/${wickets}`
}

const Match = () => {
  const { matchId } = useParams()
  const [activeTab, setActiveTab] = useState('scorecard')

  const { data: matchData, isLoading, error } = useQuery({
    queryKey: ['match', matchId],
    queryFn: () => matchesApi.getMatchById(matchId),
    enabled: !!matchId,
  })

  const rawMatch = matchData?.data

  const match = useMemo(() => {
    if (!rawMatch) return null
    return {
      ...rawMatch,
      team1: rawMatch.team1 || rawMatch.teamA || {},
      team2: rawMatch.team2 || rawMatch.teamB || {},
    }
  }, [rawMatch])

  const isCompleted = match?.status === 'completed'

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

  const tabs = [
    { id: 'scorecard', label: 'Scorecard' },
    { id: 'highlights', label: 'Highlights' },
  ]

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-hpl-maroon to-hpl-navy py-4">
        <div className="container mx-auto px-4">
          <Link
            to="/matches"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <HiArrowLeft /> Back to Matches
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Score Summary */}
        <div className="bg-base-100 rounded-xl border border-base-200 p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Team 1 */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-white border border-base-200 overflow-hidden p-1">
                <img
                  src={match?.team1?.logo}
                  alt={match?.team1?.shortName || 'Team'}
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
                />
                <span className="hidden text-hpl-maroon font-epic font-bold items-center justify-center w-full h-full">
                  {match?.team1?.shortName || 'T1'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-lg">{match?.team1?.name || 'Team 1'}</p>
                {isCompleted && (() => {
                  const team1Id = match?.team1?._id?.toString?.() || match?.team1?.id
                  const inns = match?.innings?.find(i => i.battingTeam?.toString?.() === team1Id || i.battingTeam === team1Id)
                  return inns ? (
                    <p className="text-2xl font-bold">
                      {formatScore(inns)}
                      <span className="text-sm font-normal text-base-content/60 ml-2">({inns.overs ?? 0} ov)</span>
                    </p>
                  ) : null
                })()}
              </div>
            </div>

            <span className="font-epic text-2xl text-base-content/30">VS</span>

            {/* Team 2 */}
            <div className="flex items-center gap-4 flex-row-reverse md:flex-row">
              <div>
                <p className="font-semibold text-lg text-right md:text-left">{match?.team2?.name || 'Team 2'}</p>
                {isCompleted && (() => {
                  const team2Id = match?.team2?._id?.toString?.() || match?.team2?.id
                  const inns = match?.innings?.find(i => i.battingTeam?.toString?.() === team2Id || i.battingTeam === team2Id)
                  return inns ? (
                    <p className="text-2xl font-bold">
                      {formatScore(inns)}
                      <span className="text-sm font-normal text-base-content/60 ml-2">({inns.overs ?? 0} ov)</span>
                    </p>
                  ) : null
                })()}
              </div>
              <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-white border border-base-200 overflow-hidden p-1">
                <img
                  src={match?.team2?.logo}
                  alt={match?.team2?.shortName || 'Team'}
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
                />
                <span className="hidden text-hpl-navy font-epic font-bold items-center justify-center w-full h-full">
                  {match?.team2?.shortName || 'T2'}
                </span>
              </div>
            </div>
          </div>

          {/* Match Status Badge */}
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            {match?.status === 'scheduled' && (
              <span className="badge badge-outline">Upcoming</span>
            )}
            {match?.status === 'completed' && (
              <span className="badge badge-success">Completed</span>
            )}
            {match?.toss?.winner && (
              <span className="text-sm text-base-content/60">
                Toss: {match?.toss?.decision === 'bat'
                  ? `${match?.team1?._id === match?.toss?.winner || match?.team1?.id === match?.toss?.winner?.toString?.() ? match?.team1?.shortName : match?.team2?.shortName} elected to bat`
                  : `${match?.team1?._id === match?.toss?.winner || match?.team1?.id === match?.toss?.winner?.toString?.() ? match?.team1?.shortName : match?.team2?.shortName} elected to bowl`
                }
              </span>
            )}
          </div>

          {/* Result */}
          {match?.result && (
            <div className="mt-4 p-4 bg-hpl-gold/10 rounded-lg text-center">
              <p className="font-semibold text-hpl-maroon">{match.result}</p>
            </div>
          )}
        </div>

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
            {activeTab === 'scorecard' && <Scorecard match={match} />}

            {activeTab === 'highlights' && (
              <div className="bg-base-100 rounded-xl border border-base-200 p-8 text-center">
                <p className="text-base-content/50">Highlights coming soon</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Match
