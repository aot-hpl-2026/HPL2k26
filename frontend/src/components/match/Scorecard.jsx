import { motion } from 'framer-motion'
import { useState } from 'react'

// Renders "base/w" with a coloured, smaller penalty label when present
const formatScore = (score) => {
  const penalty = score.penaltyRuns || 0
  const total = score.runs || 0
  const wickets = score.wickets || 0
  const base = penalty !== 0 ? total - penalty : total
  return (
    <>
      {base}
      {penalty !== 0 && (
        <span className={`text-[0.65em] font-semibold align-middle mx-px ${penalty > 0 ? 'text-success' : 'text-error'}`}>
          {penalty > 0 ? `+${penalty}` : `${penalty}`}
        </span>
      )}
      /{wickets}
    </>
  )
}

const Scorecard = ({ match }) => {
  const [selectedInnings, setSelectedInnings] = useState('first')

  if (!match) return null

  const team1 = match.team1 || match.teamA || {}
  const team2 = match.team2 || match.teamB || {}

  const innings1 = match.innings?.[0] || {}
  const innings2 = match.innings?.[1] || {}

  const team1Id = team1._id?.toString?.() || team1.id
  const innings1BattingTeamId = innings1.battingTeam?.toString?.() || innings1.battingTeam
  const team1BattedFirst = innings1BattingTeamId === team1Id || !innings1BattingTeamId

  const firstInningsBatting = innings1.batting || []
  const firstInningsBowling = innings1.bowling || []
  const secondInningsBatting = innings2.batting || []
  const secondInningsBowling = innings2.bowling || []

  const team1Score = team1BattedFirst
    ? { runs: innings1.runs || 0, wickets: innings1.wickets || 0, overs: innings1.overs || 0, penaltyRuns: innings1.penaltyRuns || 0 }
    : { runs: innings2.runs || 0, wickets: innings2.wickets || 0, overs: innings2.overs || 0, penaltyRuns: innings2.penaltyRuns || 0 }

  const team2Score = team1BattedFirst
    ? { runs: innings2.runs || 0, wickets: innings2.wickets || 0, overs: innings2.overs || 0, penaltyRuns: innings2.penaltyRuns || 0 }
    : { runs: innings1.runs || 0, wickets: innings1.wickets || 0, overs: innings1.overs || 0, penaltyRuns: innings1.penaltyRuns || 0 }

  const getExtrasString = (innings) => {
    const extras = typeof innings.extras === 'number' ? innings.extras : 0
    return String(extras)
  }

  const currentBatting = selectedInnings === 'first' ? firstInningsBatting : secondInningsBatting
  const currentBowling = selectedInnings === 'first' ? firstInningsBowling : secondInningsBowling
  const currentInnings = selectedInnings === 'first' ? innings1 : innings2

  if (match.innings?.length === 0 || (firstInningsBatting.length === 0 && firstInningsBowling.length === 0)) {
    return (
      <div className="bg-base-100 rounded-xl border border-base-200 p-8 text-center">
        <p className="text-base-content/50">No scorecard data available yet</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Innings Selector */}
      <div className="flex gap-2 bg-base-100 rounded-xl border border-base-200 p-2">
        <button
          onClick={() => setSelectedInnings('first')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all text-sm sm:text-base ${
            selectedInnings === 'first'
              ? 'bg-gradient-to-r from-hpl-maroon to-hpl-maroon/80 text-white'
              : 'hover:bg-base-200'
          }`}
        >
          <span className="block truncate">{team1BattedFirst ? team1.name : team2.name}</span>
          <span className="text-xs opacity-80">
            {team1BattedFirst ? formatScore(team1Score) : formatScore(team2Score)}
            {' '}({team1BattedFirst ? team1Score.overs : team2Score.overs} ov)
          </span>
        </button>
        <button
          onClick={() => setSelectedInnings('second')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all text-sm sm:text-base ${
            selectedInnings === 'second'
              ? 'bg-gradient-to-r from-hpl-navy to-hpl-navy/80 text-white'
              : 'hover:bg-base-200'
          }`}
        >
          <span className="block truncate">{team1BattedFirst ? team2.name : team1.name}</span>
          <span className="text-xs opacity-80">
            {team1BattedFirst ? formatScore(team2Score) : formatScore(team1Score)}
            {' '}({team1BattedFirst ? team2Score.overs : team1Score.overs} ov)
          </span>
        </button>
      </div>

      {/* Batting Card */}
      <div className="bg-base-100 rounded-xl border border-base-200 overflow-hidden">
        <div className={`px-4 py-3 ${
          selectedInnings === 'first'
            ? 'bg-gradient-to-r from-hpl-maroon to-hpl-maroon/80'
            : 'bg-gradient-to-r from-hpl-navy to-hpl-navy/80'
        }`}>
          <h3 className="text-white font-epic font-semibold text-sm sm:text-base">
            {selectedInnings === 'first'
              ? (team1BattedFirst ? team1.name : team2.name)
              : (team1BattedFirst ? team2.name : team1.name)
            } - Batting
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-sm sm:table-md table-zebra">
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
              {currentBatting.map((batsman, idx) => (
                <tr key={idx} className={batsman.isOut ? 'opacity-70' : ''}>
                  <td>
                    <div>
                      <p className="font-medium text-sm">{batsman.name || `Batsman ${idx + 1}`}</p>
                      {batsman.isOut && batsman.dismissal && (
                        <p className="text-xs text-base-content/50">{batsman.dismissal}</p>
                      )}
                      {batsman.isOut && !batsman.dismissal && (
                        <p className="text-xs text-base-content/50">{batsman.dismissalType || 'out'}</p>
                      )}
                      {!batsman.isOut && (
                        <p className="text-xs text-success">not out</p>
                      )}
                    </div>
                  </td>
                  <td className="text-center font-bold">{batsman.runs ?? 0}</td>
                  <td className="text-center text-base-content/70">{batsman.balls || 0}</td>
                  <td className="text-center text-base-content/70">{batsman.fours || 0}</td>
                  <td className="text-center text-base-content/70">{batsman.sixes || 0}</td>
                  <td className="text-center text-base-content/70">
                    {batsman.balls > 0 ? (((batsman.runs ?? 0) / batsman.balls) * 100).toFixed(1) : '0.0'}
                  </td>
                </tr>
              ))}
              {currentBatting.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-base-content/50 py-6">
                    No batting data available
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-base-200">
              <tr>
                <td className="font-medium text-sm">Extras</td>
                <td colSpan="5" className="text-center text-sm">{getExtrasString(currentInnings)}</td>
              </tr>
              {(currentInnings.penaltyRuns > 0) && (
                <tr>
                  <td className="font-medium text-sm text-warning">Penalty</td>
                  <td colSpan="5" className="text-center text-sm text-warning">+{currentInnings.penaltyRuns}</td>
                </tr>
              )}
              <tr className="font-bold">
                <td className="text-sm">Total</td>
                <td colSpan="5" className="text-center text-sm">
                  {(() => {
                    const s = selectedInnings === 'first'
                      ? (team1BattedFirst ? team1Score : team2Score)
                      : (team1BattedFirst ? team2Score : team1Score)
                    return <>{formatScore(s)} ({s.overs} overs)</>
                  })()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Bowling Card */}
      <div className="bg-base-100 rounded-xl border border-base-200 overflow-hidden">
        <div className={`px-4 py-3 ${
          selectedInnings === 'first'
            ? 'bg-gradient-to-r from-hpl-navy to-hpl-navy/80'
            : 'bg-gradient-to-r from-hpl-maroon to-hpl-maroon/80'
        }`}>
          <h3 className="text-white font-epic font-semibold text-sm sm:text-base">
            {selectedInnings === 'first'
              ? (team1BattedFirst ? team2.name : team1.name)
              : (team1BattedFirst ? team1.name : team2.name)
            } - Bowling
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-sm sm:table-md table-zebra">
            <thead>
              <tr className="text-base-content/60 text-xs sm:text-sm">
                <th>Bowler</th>
                <th className="text-center">O</th>
                <th className="text-center">R</th>
                <th className="text-center">W</th>
                <th className="text-center">Wd</th>
                <th className="text-center">NB</th>
                <th className="text-center">Econ</th>
              </tr>
            </thead>
            <tbody>
              {currentBowling.map((bowler, idx) => (
                <tr key={idx}>
                  <td className="font-medium text-sm">{bowler.name || `Bowler ${idx + 1}`}</td>
                  <td className="text-center text-base-content/70">{bowler.overs || 0}</td>
                  <td className="text-center text-base-content/70">{bowler.runs || 0}</td>
                  <td className="text-center font-bold text-primary">{bowler.wickets || 0}</td>
                  <td className="text-center text-base-content/70">{bowler.wides || 0}</td>
                  <td className="text-center text-base-content/70">{bowler.noBalls || 0}</td>
                  <td className="text-center text-base-content/70">{bowler.economy?.toFixed?.(1) || '0.0'}</td>
                </tr>
              ))}
              {currentBowling.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-base-content/50 py-6">
                    No bowling data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}

export default Scorecard
