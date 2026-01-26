import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiArrowRight, HiArrowPath } from 'react-icons/hi2'
import { matchesApi, teamsApi, playersApi } from '../services/api'
import { HeroSection } from '../components/tournament'
import { MatchCard } from '../components/match'
import { TopPerformers } from '../components/stats'
import { SectionHeader, LoadingSpinner, EmptyState, SkeletonCard } from '../components/common'

// Static HPL 2026 tournament data
const tournament = {
  name: 'HPL 2026',
  tagline: 'Where Legends Are Born',
  description: 'The Hostel Premier League brings together the finest cricket talent from across campus for an epic showdown of skill, strategy, and sportsmanship.'
}

const Home = () => {
  // Fetch matches - live matches refetch every 10 seconds
  const { data: liveMatches, isLoading: loadingLive, refetch: refetchLive } = useQuery({
    queryKey: ['matches', 'live'],
    queryFn: matchesApi.getLiveMatches,
    refetchInterval: 10000, // Auto-refresh live matches every 10 seconds
  })

  const { data: upcomingMatches, isLoading: loadingUpcoming } = useQuery({
    queryKey: ['matches', 'upcoming'],
    queryFn: matchesApi.getUpcomingMatches,
  })

  const { data: completedMatches, isLoading: loadingCompleted } = useQuery({
    queryKey: ['matches', 'completed'],
    queryFn: matchesApi.getCompletedMatches,
  })

  // Fetch top performers
  const { data: topBatsmen } = useQuery({
    queryKey: ['topBatsmen'],
    queryFn: () => playersApi.getTopBatsmen(5),
  })

  const { data: topBowlers } = useQuery({
    queryKey: ['topBowlers'],
    queryFn: () => playersApi.getTopBowlers(5),
  })

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection tournament={tournament} />

      {/* Live Matches */}
      <section className="py-8 sm:py-12 bg-base-200">
        <div className="container mx-auto px-3 sm:px-4">
          <SectionHeader 
            title="🔴 Live Matches" 
            subtitle="Catch the action as it happens"
            action={
              liveMatches?.data?.length > 0 && (
                <button 
                  onClick={() => refetchLive()}
                  className="btn btn-ghost btn-xs sm:btn-sm gap-1 sm:gap-2"
                  disabled={loadingLive}
                >
                  <HiArrowPath className={loadingLive ? 'animate-spin' : ''} /> Refresh
                </button>
              )
            }
          />
          
          {loadingLive ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : liveMatches?.data?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {liveMatches.data.map((match) => (
                <MatchCard key={match.id || match._id} match={match} />
              ))}
            </div>
          ) : (
            <div className="bg-base-100 rounded-xl p-8 text-center">
              <p className="text-base-content/60">No live matches at the moment</p>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Matches */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-3 sm:px-4">
          <SectionHeader 
            title="📅 Upcoming Matches" 
            subtitle="Mark your calendar"
            action={
              <Link to="/matches" className="btn btn-outline btn-primary btn-xs sm:btn-sm gap-1 sm:gap-2">
                View All <HiArrowRight />
              </Link>
            }
          />
          
          {loadingUpcoming ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : upcomingMatches?.data?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {upcomingMatches.data.slice(0, 3).map((match) => (
                <MatchCard key={match.id || match._id} match={match} />
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No upcoming matches" 
              description="Check back later for the schedule"
            />
          )}
        </div>
      </section>

      {/* Top Performers */}
      <section className="py-8 sm:py-12 bg-base-200">
        <div className="container mx-auto px-3 sm:px-4">
          <SectionHeader title="⭐ Top Performers" subtitle="The stars lighting up HPL 2026" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Top Batsmen */}
            <div>
              {topBatsmen?.data && (
                <TopPerformers 
                  title="🏏 Top Run Scorers"
                  players={topBatsmen.data}
                  statKey="batting.runs"
                  statLabel="runs"
                />
              )}
            </div>

            {/* Top Bowlers */}
            <div>
              {topBowlers?.data && (
                <TopPerformers 
                  title="🎯 Top Wicket Takers"
                  players={topBowlers.data}
                  statKey="bowling.wickets"
                  statLabel="wickets"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Results */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-3 sm:px-4">
          <SectionHeader 
            title="✅ Recent Results" 
            subtitle="What you might have missed"
            action={
              <Link to="/matches" className="btn btn-outline btn-primary btn-xs sm:btn-sm gap-1 sm:gap-2">
                All Results <HiArrowRight />
              </Link>
            }
          />
          
          {loadingCompleted ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : completedMatches?.data?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {completedMatches.data.slice(0, 3).map((match) => (
                <MatchCard key={match.id || match._id} match={match} />
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No completed matches yet" 
              description="Tournament is just getting started"
            />
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
