import { motion } from 'framer-motion'
import { useState } from 'react'

const Scorecard = ({ match }) => {
  const [selectedInnings, setSelectedInnings] = useState('first')

  if (!match) return null

  // Map teamA/teamB to team1/team2 for display
  const team1 = match.team1 || match.teamA || {}
  const team2 = match.team2 || match.teamB || {}

  // Get actual innings data from match
  const innings1 = match.innings?.[0] || {}
  const innings2 = match.innings?.[1] || {}

  // Determine which team batted first based on innings data
  const team1Id = team1._id?.toString?.() || team1.id
  const innings1BattingTeamId = innings1.battingTeam?.toString?.() || innings1.battingTeam
  const team1BattedFirst = innings1BattingTeamId === team1Id || !innings1BattingTeamId

  // Get batting and bowling data from actual innings
  const firstInningsBatting = innings1.batting || []
  const firstInningsBowling = innings1.bowling || []
  const secondInningsBatting = innings2.batting || []
  const secondInningsBowling = innings2.bowling || []

  // Team scores from innings
  const team1Score = team1BattedFirst
    ? { runs: innings1.runs || 0, wickets: innings1.wickets || 0, overs: innings1.overs || 0 }
    : { runs: innings2.runs || 0, wickets: innings2.wickets || 0, overs: innings2.overs || 0 }
  
  const team2Score = team1BattedFirst
    ? { runs: innings2.runs || 0, wickets: innings2.wickets || 0, overs: innings2.overs || 0 }
    : { runs: innings1.runs || 0, wickets: innings1.wickets || 0, overs: innings1.overs || 0 }

  // Get extras from innings
  const getExtrasString = (innings) => {
    const extras = innings.extras || {}
    const parts = []
    if (extras.byes) parts.push(`b ${extras.byes}`)
    if (extras.legByes) parts.push(`lb ${extras.legByes}`)
    if (extras.wides) parts.push(`w ${extras.wides}`)
    if (extras.noBalls) parts.push(`nb ${extras.noBalls}`)
    if (extras.penalty) parts.push(`p ${extras.penalty}`)
    const total = (extras.byes || 0) + (extras.legByes || 0) + (extras.wides || 0) + (extras.noBalls || 0) + (extras.penalty || 0)
    return parts.length > 0 ? `${total} (${parts.join(', ')})` : '0'
  }

  // Get fall of wickets from innings
  const getFallOfWickets = (innings) => {
    if (innings.fallOfWickets && innings.fallOfWickets.length > 0) {
      return innings.fallOfWickets
    }
    // Build from batting array if not available
    const fow = []
    let runningTotal = 0
    const batsmen = innings.batting || []
    batsmen.forEach((b, idx) => {
      if (b.isOut) {
        runningTotal = b.atScore || (runningTotal + b.runs)
        fow.push({
          wicket: fow.length + 1,
          runs: runningTotal,
          batsman: b.name || b.player?.name || `Batsman ${idx + 1}`
        })
      }
    })
    return fow
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
          <span className="block truncate">{team1.name}</span>
          <span className="text-xs opacity-80">
            {team1Score.runs}/{team1Score.wickets} ({team1Score.overs} ov)
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
          <span className="block truncate">{team2.name}</span>
          <span className="text-xs opacity-80">
            {team2Score.runs}/{team2Score.wickets} ({team2Score.overs} ov)
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
            {selectedInnings === 'first' ? team1.name : team2.name} - Batting
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
              {(selectedInnings === 'first' ? firstInningsBatting : secondInningsBatting).map((batsman, idx) => (
                <tr key={idx} className={batsman.isOut ? 'opacity-70' : ''}>
                  <td>
                    <div>
                      <p className="font-medium text-sm">{batsman.name || batsman.player?.name || `Batsman ${idx + 1}`}</p>
                      {batsman.isOut && (
                        <p className="text-xs text-base-content/50">{batsman.dismissal || 'out'}</p>
                      )}
                      {!batsman.isOut && (
                        <p className="text-xs text-success">not out</p>
                      )}
                    </div>
                  </td>
                  <td className="text-center font-bold">{batsman.runs || 0}</td>
                  <td className="text-center text-base-content/70">{batsman.balls || 0}</td>
                  <td className="text-center text-base-content/70">{batsman.fours || 0}</td>
                  <td className="text-center text-base-content/70">{batsman.sixes || 0}</td>
                  <td className="text-center text-base-content/70">
                    {batsman.balls > 0 ? ((batsman.runs / batsman.balls) * 100).toFixed(1) : '0.0'}
                  </td>
                </tr>
              ))}
              {(selectedInnings === 'first' ? firstInningsBatting : secondInningsBatting).length === 0 && (
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
                <td colSpan="5" className="text-center text-sm">
                  {getExtrasString(selectedInnings === 'first' ? innings1 : innings2)}
                </td>
              </tr>
              <tr className="font-bold">
                <td className="text-sm">Total</td>
                <td colSpan="5" className="text-center text-sm">
                  {selectedInnings === 'first' 
                    ? `${team1Score.runs}/${team1Score.wickets} (${team1Score.overs} overs)`
                    : `${team2Score.runs}/${team2Score.wickets} (${team2Score.overs} overs)`
                  }
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
            {selectedInnings === 'first' ? team2.name : team1.name} - Bowling
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-sm sm:table-md table-zebra">
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
              {(selectedInnings === 'first' ? firstInningsBowling : secondInningsBowling).map((bowler, idx) => (
                <tr key={idx}>
                  <td className="font-medium text-sm">{bowler.name || bowler.player?.name || `Bowler ${idx + 1}`}</td>
                  <td className="text-center text-base-content/70">{bowler.overs || 0}</td>
                  <td className="text-center text-base-content/70">{bowler.maidens || 0}</td>
                  <td className="text-center text-base-content/70">{bowler.runs || 0}</td>
                  <td className="text-center font-bold text-primary">{bowler.wickets || 0}</td>
                  <td className="text-center text-base-content/70">{bowler.economy?.toFixed?.(1) || '0.0'}</td>
                </tr>
              ))}
              {(selectedInnings === 'first' ? firstInningsBowling : secondInningsBowling).length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-base-content/50 py-6">
                    No bowling data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fall of Wickets */}
      <div className="bg-base-100 rounded-xl border border-base-200 overflow-hidden">
        <div className="bg-gradient-to-r from-hpl-midnight to-hpl-midnight/80 px-4 py-3">
          <h3 className="text-white font-epic font-semibold text-sm sm:text-base">Fall of Wickets</h3>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-3">
            {getFallOfWickets(selectedInnings === 'first' ? innings1 : innings2).map((fow, idx) => (
              <div key={idx} className="bg-base-200 rounded-lg px-3 py-2 text-sm">
                <span className="font-bold">{fow.runs}-{fow.wicket}</span>
                <span className="text-base-content/60 ml-1">({fow.batsman})</span>
              </div>
            ))}
            {getFallOfWickets(selectedInnings === 'first' ? innings1 : innings2).length === 0 && (
              <p className="text-base-content/50 text-sm">No wickets fallen</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Scorecard
