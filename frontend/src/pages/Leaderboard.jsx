import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';
import { useQuery } from '@tanstack/react-query';

export default function Leaderboard() {
  const { user, token } = useAuth();

  // Selected tab: 'season' | 'global' | 'friends'
  const [activeTab, setActiveTab] = useState('season');
  // Local search query for candidates filter
  const [searchQuery, setSearchQuery] = useState('');
  // Selected badge for details popup modal
  const [selectedBadge, setSelectedBadge] = useState(null);
  // Season selector active dropdown
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState('Season 1 Sprints');
  // Copied share state indicator
  const [copiedBadgeName, setCopiedBadgeName] = useState(false);

  // Fetch real leaderboard data using React Query
  const { data: leaderboardData } = useQuery({
    queryKey: ['leaderboard', token],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/gamification/leaderboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('Leaderboard fetch failed');
      }
      return res.json();
    },
    enabled: !!token,
  });

  const liveLeaderboard = useMemo(() => {
    if (!leaderboardData || !leaderboardData.leaderboard || leaderboardData.leaderboard.length === 0) {
      return [];
    }
    return leaderboardData.leaderboard.map((u, i) => ({
      rank: i + 1,
      name: u.name,
      xp: u.xp || 0,
      streak: u.streak || 1,
      badges: u.badges || [],
      isMe: u.name === (user?.name || ''),
      initials: u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'UN'
    }));
  }, [leaderboardData, user?.name]);


  // User particulars — prefer live data
  const currentUserName = user?.name || 'Yash';
  const currentUserXP = user?.xp || 5980;
  const currentUserStreak = user?.streak || 3;

  // The season rankings are live data if available, else fallback to static

  // Static list of badges and their details
  const achievements = useMemo(() => [
    {
      id: 'novice-prep',
      name: 'Novice Prep',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBk2CWi629Un46tQsnh7ZtGSITV2S1TEZ7Di1uCMBmwxbW-dqPfuq47KyYCHMqkFZkJyGZ180aRMbpVZw1zOxm67bx4T5D-EcxcS0oGbcfj3y2FHIHoAtIuwAUJ1MFeXz2b8A6EjVSLZS0mdhVTQehBTTzVJ0qPXEk_TPR2gydPIlrdRJ2NBH_09icl-O0bSS2H2tMtwGVLwK-zk7pXMjf5SB7A1SPk5T_vqradzQjrD74F2URFQWvqZ673dws4OzfO38zYnn5MqAx-',
      requirement: 'Complete your first mock interview session.',
      dateUnlocked: 'Jan 3, 2024',
      description: 'Awarded to candidates taking their first step in the AI Mock Interview arena. Keep practicing!'
    },
    {
      id: 'roadmap-pioneer',
      name: 'Roadmap Pioneer',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhjuSV0di2APePSItAW33gWefUHK7xvgDuzVkd3jRDHnObYkhpBjzmIQUtGBbaTS6Tb8kSO2NwDC8iDsLfVj--pDocRAcQsWv1ECxKbIUZm8gQKFJr8C3-XEOiV_c7EpDwT_03LWoK7kxV4GB0qzYllnOOCGRVJy2niBrsCNev4X9QTr1AXoaX-1GMXB7imef3EsgfM1CB1H2ejl_V7AfDHO-alRM_TLq7vWH1vBWqqGX6pL3Iaa2gxRBR1_FgUJ-8uIFN_eb8ZbeZ',
      requirement: 'Generate your first personalized learning roadmap.',
      dateUnlocked: 'Jan 5, 2024',
      description: 'Awarded for charting a career course and utilizing the AI Career Roadmap builder.'
    },
    {
      id: 'coding-master',
      name: 'Coding Master',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNZEsaMnIWp9DlCzhiqZ4IywWPJFg8ksxeMm5luXyE5u_yUXlCkVBvNvoFLuW_A5VFsQsM0JdL3rRmGPzkvJqPg3FkKUSNVBxL2WVfxe5wTCgfxQKhKqOWa5JgQDwYPx67mg5KyBXnK1jLQdMfx6Po-WuFbyWoRBEEXjrvZyBoeNy6E-1Indp0eoF7aPCCVx5Yw-XuQq1FLQYB2PWHxRWuyNxPNUk95Gpex2SNhvNI7_eT-WAxW7sp54nSY4Era2HJZbCdgSvF2yQf',
      requirement: 'Solve 10 algorithmic problems in the Coding Arena.',
      dateUnlocked: 'Jan 12, 2024',
      description: 'For demonstrating technical proficiency, clean code architecture, and algorithm optimization.'
    },
    {
      id: 'interview-scholar',
      name: 'Interview Scholar',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0Apq8spKo7mInwi4dW1LrgCKkRQ8tHKS4ARJ2QLL9qbq3jQCau-PFRPjnKAMkaT2bk6blpLfUWNva3mCCaJoOJP1diQMZVCCZtBpXRYcX-1HCY5EFrhxH9ivPGpULkBJKaDMz_iUF0wxiKEd9g1AkR2PvkQLnRS4AJtih9SEHLnd19gD361vEfOXbWWhzOGopEmJAMj_1DjBJnPPv-xiGQMLxiuPg2XjEdoo4c665ynaU3plIcF8Ffsx5WYi7z2suACXMYyN8OPDK',
      requirement: 'Score above 90% in any AI mock interview chamber.',
      dateUnlocked: 'Jan 18, 2024',
      description: 'High performance indicator for clarity, structured communication, and concept command.'
    },
    {
      id: 'debating-scholar',
      name: 'Debating Scholar',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2irCuQ3HLGblRRcIQc9dVR4T_MibLmYdcfc0wdAzYl1lJD5QhZry742TrGVd-dgGRJZC3Iu79-rPVkLRAdQB_XtjUsarjSZOUVfe1FcHeZ2CO5qnfLu9LR4mhVXAOyet_SyhDHeRIRa_KNPB3PT1BoI8WbmkGozSbRdN9op1NmHzJe3OK-GGS-d2EmDFo4uQB2F9N8GhXAc8GbCtV_g18r8bFEpDUmVnjypZLPEsj3EbF48FQpNA-RxPndn9n2SHYLkgVfcZDbwZ5',
      requirement: 'Participate actively in 5 career group mock discussions.',
      dateUnlocked: 'Jan 22, 2024',
      description: 'Awarded for collaborative communication, objective counter-arguments, and consensus building.'
    },
    {
      id: 'aptitude-scholar',
      name: 'Aptitude Scholar',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2RV4cBVCqUdH6RbZwDuXJIqix3-PYC_QzeR-bP9jfxqIAIQTzmuwmCjxqErgkmVjAfL_zw1cQUAox4XrtM5-FSgwmQq9zkkQnk9ZTKgy6g2YOqcgNrWlOoRK2p8K1hE5Pz46R56ZrtN5n8u0_4Q7vc_YCCXim5n6np4qkBfGytT0DDl2UgXPwyj5CWwlXFSgoX5Jon0OcQt8B1BuxB6qM2Jua7V0Bu8y7fY1afYyB9fnEuQzJ0Xs9Q26WJUCbpcWQGwhEgx0GjaBs',
      requirement: 'Score above 85% in all quantitative & analytical reasoning chapters.',
      dateUnlocked: 'Jan 26, 2024',
      description: 'Awarded for complete logical analysis coverage, statistical accuracy, and numerical reasoning.'
    }
  ], []);

  // Leaderboard data configurations for different tabs
  const seasonRankingsList = useMemo(() => {
    // Use live leaderboard if populated
    if (liveLeaderboard.length > 0) return liveLeaderboard;
    // Static fallback
    return [
      {
        rank: 1,
        name: currentUserName,
        xp: currentUserXP,
        streak: currentUserStreak,
        badges: ['Novice Prep', 'Roadmap Pioneer'],
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfGSD6ra-XuaEnuJNqvDum-X6p9y4D0KA0y8SYGz8x-CgUBgDBWUT4f07SGb2QF6Dsok4ptDVguoFLcl41HriaMOEBKt5njIn_fG4qdu2yPaUIy3UXDbmjfBALx82RCEYm2MuQ_3VOKWSRznzLZ5WQrepzPOlFxOycUmoLry2MgqkI83go0TsykgK2692I2edTjKerPjveXcamIFPMWxt9MFMGDYVXAPe7kdBWD26SmaWKWjPeKoj1P8YbXc_qaJBih98xyCFV0kgF',
        isMe: true
      },
      {
        rank: 2,
        name: 'Raj',
        xp: 1380,
        streak: 1,
        badges: ['Novice Prep', 'Debating Scholar'],
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCu6KRju1XP1IogN6kwGogA-CU94sCZQm9q5HXV9vr74BJ7D5cTRdFmIfjTn9LZdWbb7HVCdp9GC_J_NbWVfW-AcIzMdUzl7lYOU8barxpSsWaoXMAtF9CB_VuOMPBpmdF6yGWXK7VhOG8qzeRmBH0AGfrdQAJiBTrjSCKmYzf6WHzJIgoosfO1c2qoHgOeLaSZPlCWljXvs_CIDXdxDpbnZrMbOXCAaGtS6j_a0YsdH9Db6_SHoC2K7MjK9ZG18zACBLjBf3I8QUCL'
      },
      {
        rank: 3,
        name: 'Test User',
        xp: 460,
        streak: 1,
        badges: ['Novice Prep'],
        initials: 'TU'
      },
      {
        rank: 4,
        name: 'Google Scholar',
        xp: 100,
        streak: 1,
        badges: ['Novice Prep'],
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAJtxbn2QN7lr0YnVJLttV6V5DK2enBDFHe8InTaz3yjNha5iyQrxr9tlzVU1iDB_dwUGR1c4c3nSZ8Xo8NAUFJKej8x_6P6jIMpQx0r9ZEdnj2H4xefDTBQpAY92tczhYRK-Nuymr4vDzB_Qj9pm8IV1oqNhUPIPBBCQCdMqDea6of2MxriFN6RgBaCbDNsNjfskygx1NdkFJgIpuH0-t8UeVeeFwnZZSN7TcL0aXg7NT111vfzm8MC1tr8cFo-qGw7zNc_g84D31'
      },
      {
        rank: 5,
        name: 'LinkedIn Scholar',
        xp: 100,
        streak: 1,
        badges: ['Novice Prep'],
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVv2h0nexnAbOBa1T8JZVrbXfDl5_h8Nt1FivpLsTtO1pmcKNpzAtcphWJlJr8djHIfA4zY-IQHINWTmuiqLWwakoHz1SMz_DwVFp59lIw7NaNGzvJjaa1kq9Y_uTgjfXV4a-YNob_f__XykJ-HWUD4Ot9yAvIuLXDLbfM--toLcRUnjXVYiYaoLwhITN9sui8ZR03zPte2VFCWnIdaD6WMcF0urrx3v6-tMaUPV7rvu0OPRw26AjaE2rUpfX1I_4vU-ghT48E5WXP'
      }
    ];
  }, [liveLeaderboard, currentUserName, currentUserXP, currentUserStreak]);

  const globalRankingsList = useMemo(() => [
    {
      rank: 1,
      name: currentUserName,
      xp: currentUserXP + 12000,
      streak: currentUserStreak + 10,
      badges: ['Novice Prep', 'Roadmap Pioneer', 'Coding Master'],
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfGSD6ra-XuaEnuJNqvDum-X6p9y4D0KA0y8SYGz8x-CgUBgDBWUT4f07SGb2QF6Dsok4ptDVguoFLcl41HriaMOEBKt5njIn_fG4qdu2yPaUIy3UXDbmjfBALx82RCEYm2MuQ_3VOKWSRznzLZ5WQrepzPOlFxOycUmoLry2MgqkI83go0TsykgK2692I2edTjKerPjveXcamIFPMWxt9MFMGDYVXAPe7kdBWD26SmaWKWjPeKoj1P8YbXc_qaJBih98xyCFV0kgF',
      isMe: true
    },
    {
      rank: 2,
      name: 'Sarah Jenkins',
      xp: 15400,
      streak: 25,
      badges: ['Interview Scholar', 'Aptitude Scholar'],
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
    },
    {
      rank: 3,
      name: 'Raj',
      xp: 14200,
      streak: 8,
      badges: ['Novice Prep', 'Debating Scholar'],
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCu6KRju1XP1IogN6kwGogA-CU94sCZQm9q5HXV9vr74BJ7D5cTRdFmIfjTn9LZdWbb7HVCdp9GC_J_NbWVfW-AcIzMdUzl7lYOU8barxpSsWaoXMAtF9CB_VuOMPBpmdF6yGWXK7VhOG8qzeRmBH0AGfrdQAJiBTrjSCKmYzf6WHzJIgoosfO1c2qoHgOeLaSZPlCWljXvs_CIDXdxDpbnZrMbOXCAaGtS6j_a0YsdH9Db6_SHoC2K7MjK9ZG18zACBLjBf3I8QUCL'
    },
    {
      rank: 4,
      name: 'Elena Rostova',
      xp: 9800,
      streak: 12,
      badges: ['Coding Master'],
      initials: 'ER'
    },
    {
      rank: 5,
      name: 'John Doe',
      xp: 8400,
      streak: 5,
      badges: ['Roadmap Pioneer'],
      initials: 'JD'
    }
  ], [currentUserName, currentUserXP, currentUserStreak]);

  const friendsRankingsList = useMemo(() => [
    {
      rank: 1,
      name: currentUserName,
      xp: currentUserXP,
      streak: currentUserStreak,
      badges: ['Novice Prep', 'Roadmap Pioneer'],
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfGSD6ra-XuaEnuJNqvDum-X6p9y4D0KA0y8SYGz8x-CgUBgDBWUT4f07SGb2QF6Dsok4ptDVguoFLcl41HriaMOEBKt5njIn_fG4qdu2yPaUIy3UXDbmjfBALx82RCEYm2MuQ_3VOKWSRznzLZ5WQrepzPOlFxOycUmoLry2MgqkI83go0TsykgK2692I2edTjKerPjveXcamIFPMWxt9MFMGDYVXAPe7kdBWD26SmaWKWjPeKoj1P8YbXc_qaJBih98xyCFV0kgF',
      isMe: true
    },
    {
      rank: 2,
      name: 'Raj',
      xp: 1380,
      streak: 1,
      badges: ['Novice Prep', 'Debating Scholar'],
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCu6KRju1XP1IogN6kwGogA-CU94sCZQm9q5HXV9vr74BJ7D5cTRdFmIfjTn9LZdWbb7HVCdp9GC_J_NbWVfW-AcIzMdUzl7lYOU8barxpSsWaoXMAtF9CB_VuOMPBpmdF6yGWXK7VhOG8qzeRmBH0AGfrdQAJiBTrjSCKmYzf6WHzJIgoosfO1c2qoHgOeLaSZPlCWljXvs_CIDXdxDpbnZrMbOXCAaGtS6j_a0YsdH9Db6_SHoC2K7MjK9ZG18zACBLjBf3I8QUCL'
    },
    {
      rank: 3,
      name: 'Dev Friend',
      xp: 950,
      streak: 2,
      badges: ['Coding Master'],
      initials: 'DF'
    }
  ], [currentUserName, currentUserXP, currentUserStreak]);

  // Determine active board dataset
  const activeBoardData = useMemo(() => {
    switch (activeTab) {
      case 'global':
        return globalRankingsList;
      case 'friends':
        return friendsRankingsList;
      case 'season':
      default:
        return seasonRankingsList;
    }
  }, [activeTab, seasonRankingsList, globalRankingsList, friendsRankingsList]);

  // Filter rankings based on search query
  const filteredRankings = useMemo(() => {
    if (!searchQuery.trim()) return activeBoardData;
    return activeBoardData.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeBoardData, searchQuery]);

  // Handle sharing badge
  const handleShareBadge = (badgeName) => {
    const mockLink = `${window.location.origin}/leaderboard/achievements/${badgeName.toLowerCase().replace(/\s+/g, '-')}`;
    navigator.clipboard.writeText(mockLink).then(() => {
      setCopiedBadgeName(true);
      setTimeout(() => setCopiedBadgeName(false), 2000);
    });
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      <style>{`
        .glass-panel {
          background-color: #121216;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 1rem;
        }
        .glass-card {
          background-color: rgba(30, 30, 38, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 0.75rem;
          backdrop-filter: blur(10px);
        }
        .glow-border {
          position: relative;
        }
        .glow-border::before {
          content: '';
          position: absolute;
          top: -1px; left: -1px; right: -1px; bottom: -1px;
          border-radius: 0.75rem;
          background: linear-gradient(45deg, #8b5cf6, #3b82f6);
          z-index: 0;
          opacity: 0.4;
          pointer-events: none;
        }
      `}</style>

      {/* Main Grid Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Stats & Leaderboard */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Hero Banner Panel */}
          <div className="glass-panel p-6 relative overflow-hidden flex flex-col gap-6">
            <div 
              className="absolute right-0 top-0 w-1/2 h-full opacity-30 pointer-events-none" 
              style={{ background: 'radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.4) 0%, transparent 70%)' }}
            ></div>
            
            {/* Banner Top Row */}
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 flex-shrink-0 relative">
                <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full"></div>
                <img 
                  alt="Trophy" 
                  className="w-full h-full object-contain relative z-10" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1lrR1IfAiCOJ-5I1neMLmkr0VCsb7YuJqaVB2xuR-B34qXj9CwHtC_er2GwdYDk9Owy6RrDrcpeyBbx2EVD89bXNFGElT89PMrgntyq4zMhptatOsnXqYuL85JZMulr2z2yyQakprfSAZGiIXF6A-AZB9UzvWt_nzTLojA20XPpUfljJqbYpKybwWw4Ac_4cWkwK_phrsyhPxgPmFhgoX4yzzkCeSYQXgOsXqAnOYvfErqjkN6cuE5CTS6XLK-cSQit7G56vc9f_s" 
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Ranks & Leaderboard Seasons</h2>
                <p className="text-gray-400 text-sm">Compete, improve, and earn exclusive XP badges.</p>
              </div>

              {/* Sparkline line chart graph placeholder */}
              <div className="ml-auto w-48 h-16 opacity-50 relative hidden md:block">
                <svg className="w-full h-full stroke-purple-500 fill-none" strokeWidth="1.5" viewBox="0 0 100 30">
                  <path d="M0,25 L10,22 L20,24 L30,18 L40,20 L50,15 L60,18 L70,10 L80,12 L90,5 L100,2"></path>
                  <circle className="fill-purple-500" cx="10" cy="22" r="1.5"></circle>
                  <circle className="fill-purple-500" cx="30" cy="18" r="1.5"></circle>
                  <circle className="fill-purple-500" cx="50" cy="15" r="1.5"></circle>
                  <circle className="fill-purple-500" cx="70" cy="10" r="1.5"></circle>
                  <circle className="fill-purple-500" cx="90" cy="5" r="1.5"></circle>
                  <circle className="fill-white" cx="100" cy="2" r="1.5" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="2"></circle>
                </svg>
              </div>
            </div>

            {/* Stats Sub-row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10 pt-4 border-t border-gray-800/50">
              <div>
                <p className="text-xs text-gray-500 mb-1">Current Season</p>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white">Season 1: Sprints</span>
                  <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded">Active</span>
                </div>
                <p className="text-[11px] text-gray-500">Jan 1 - Jan 31, 2024 · 30 Days Left</p>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 mb-1">Your Rank</p>
                <div className="text-2xl font-bold text-purple-400 mb-1">#1</div>
                <p className="text-[11px] text-yellow-500 flex items-center gap-1">
                  <i className="fa-solid fa-crown"></i> Top 1% of learners
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Total XP Earned</p>
                <div className="text-2xl font-bold text-blue-400 mb-1">{currentUserXP}</div>
                <p className="text-[11px] text-gray-500">Keep it up!</p>
              </div>

              <div className="flex items-center gap-4">
                {/* Circular Progress */}
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                    <path className="text-blue-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="75, 100" strokeLinecap="round" strokeWidth="3"></path>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">75%</div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Season Goal</p>
                  <p className="text-sm font-medium text-white mb-0.5">7500 / 10000 XP</p>
                  <p className="text-[11px] text-purple-400 flex items-center gap-1">
                    <i className="fa-solid fa-gem text-[10px]"></i> Elite Badge
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters & Rankings Container */}
          <div className="flex flex-col gap-4">
            
            {/* Filter buttons and Search bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Tabs */}
              <div className="flex bg-[#121216] border border-gray-800 rounded-lg p-1">
                <button 
                  onClick={() => setActiveTab('season')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    activeTab === 'season'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Season Rankings
                </button>
                <button 
                  onClick={() => setActiveTab('global')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    activeTab === 'global'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Global Leaderboard
                </button>
                <button 
                  onClick={() => setActiveTab('friends')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    activeTab === 'friends'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Friends
                </button>
              </div>

              {/* Actions & Local Search */}
              <div className="flex items-center gap-3 self-end sm:self-auto">
                
                {/* Search query input */}
                <div className="relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-[10px]"></i>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#121216] border border-gray-800 text-xs rounded-lg pl-8 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-gray-750 w-48"
                    placeholder="Search candidate..."
                  />
                </div>

                {/* Dropdown Season Selection */}
                <div className="relative">
                  <button 
                    onClick={() => setShowSeasonDropdown(!showSeasonDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#121216] border border-gray-800 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    <i className="fa-regular fa-calendar text-gray-500"></i>
                    {selectedSeason}
                    <i className="fa-solid fa-chevron-down text-[10px] text-gray-500 ml-1"></i>
                  </button>

                  {showSeasonDropdown && (
                    <div className="absolute right-0 mt-1 w-44 bg-[#121216] border border-gray-800 rounded-lg shadow-xl z-20 py-1">
                      {['Season 1 Sprints', 'Season 2 Marathon', 'Warmup Season'].map((seasonOption) => (
                        <button
                          key={seasonOption}
                          onClick={() => {
                            setSelectedSeason(seasonOption);
                            setShowSeasonDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
                        >
                          {seasonOption}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Leaderboard Cards List */}
            <div className="flex flex-col gap-3">
              {filteredRankings.length > 0 ? (
                filteredRankings.map((player) => {
                  const isGold = player.rank === 1;
                  const isSilver = player.rank === 2;
                  const showCustomMedal = player.rank <= 3;

                  return (
                    <div 
                      key={player.name}
                      className={`glass-card p-4 flex items-center gap-4 relative overflow-hidden transition-all ${
                        player.isMe ? 'glow-border' : 'bg-[#121216]'
                      }`}
                    >
                      {/* Highlight backdrop overlay for "Me" */}
                      {player.isMe && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-blue-900/20 opacity-50 pointer-events-none z-0"></div>
                      )}

                      {/* Rank tag / custom medal */}
                      <div className="w-10 h-10 flex items-center justify-center relative z-10 flex-shrink-0">
                        {showCustomMedal ? (
                          <>
                            <img 
                              alt={`${isGold ? 'Gold' : isSilver ? 'Silver' : 'Bronze'} Medal`} 
                              className="w-full h-full object-contain" 
                              src={
                                isGold 
                                  ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPtr_R1Gj9GAl2X69Y3OGCWIMlH_6AOVYbC5YN0QEjIsgvTFIyJstezKXx9U9tgLVmLiFch5IlvbOIt0BRzPkKtLaj89Ea0TIKjhItXJLpzFwV2L7QhLK4MmBe8GJPqhMaetuTThKhT5c3JaiR25ZktqjLyjYPRB6cG_r8teNQcPvEfppmvmhzK8UZuhKYyFVxCVX8aN36VuwaMo-Wdbkt4sGew-qFEIGZRyUiMVX9sz_T-TnIuN2Ym4AQZ-eL6ftikM9FJJeS7Bm_' 
                                  : isSilver 
                                    ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQlLG7KUqsZz3N7qPZDi--bfKfq9LRJCSdbWu7qjlFMezliVZtN5P7Vg41AmyiIDp6KxwDzvqdNTbJoouUeeYAOlLVf2tQMTHfwZXAFq7ypJ0Va1DSjEIv-Jc8G0bOKPOhsIGLav1EmBHLNavaHEo3_LyuSc26Q_WyKVTP7zlZPFrnIg5MMd6L7Ufpqk-f2yesiK6I5lYvM1V_hgzWvFdVer8dM4dqxo10lmAnzZ9F9Nv7eoWZr3N30p7HqEjyQszS3xYCmKSmhPZK' 
                                    : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcscurv6X8oY_tyShteaIpG3lDTNIcsEVSJSenTSyyQwgDR1ZqmhP_mNUxt76ZF4VvRMNeJe10b7Gyyl1bGG6avJmhbGHf61mOdgqf9JFxNtZI46WkhcHvQAiO6xZZBfKb-k2EEYozv2yVbK354HZurtbqJ8XVvWZdMwhRvoDTOTUivma2N-vOiP-kXNwJlK1kEMlgxeOFcQ17_OgbspBPYhd856SWwOPolYhXRq9IieL6g8Ok5NKWPnu-1_PZ-sgg5JzN5m2Svw4y'
                              } 
                            />
                            <span className={`absolute text-sm font-bold ${isGold ? 'text-yellow-900' : isSilver ? 'text-gray-800' : 'text-orange-900'}`}>
                              {player.rank}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-400 font-bold text-sm">
                            {player.rank}
                          </span>
                        )}
                      </div>

                      {/* User Avatar / Initials */}
                      <div className="relative z-10 flex-shrink-0">
                        {player.avatar ? (
                          <img 
                            alt={`${player.name} Avatar`} 
                            className={`w-10 h-10 rounded-full border ${player.isMe ? 'border-purple-500/50' : 'border-gray-700'} object-cover`} 
                            src={player.avatar} 
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-full ${isGold ? 'bg-purple-600' : 'bg-gray-700'} flex items-center justify-center text-white font-bold text-sm border border-gray-700`}>
                            {player.initials || 'UN'}
                          </div>
                        )}
                      </div>

                      {/* User Details */}
                      <div className="flex-1 min-w-0 relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold ${player.isMe ? 'text-white font-bold' : 'text-gray-200'} truncate`}>
                            {player.name}
                          </h4>
                          {player.isMe && (
                            <span className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded leading-none uppercase tracking-wider">
                              ME
                            </span>
                          )}
                        </div>

                        {/* Badges Sub-list */}
                        <div className="flex flex-wrap gap-1.5">
                          {player.badges && player.badges.map((bName) => (
                            <span 
                              key={bName} 
                              className="bg-gray-800/80 border border-gray-700 text-gray-300 text-[10px] px-2 py-0.5 rounded-full"
                            >
                              {bName}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* XP Points & Streak details */}
                      <div className="text-right relative z-10 flex-shrink-0">
                        <div className="flex items-center justify-end gap-1 mb-1">
                          <i className="fa-solid fa-star text-yellow-500 text-xs"></i>
                          <span className={`font-bold ${player.isMe ? 'text-white text-lg' : 'text-gray-200 text-base'}`}>
                            {player.xp}
                          </span>
                          <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">XP</span>
                        </div>
                        <div className="flex items-center justify-end gap-1 text-orange-500 text-xs font-medium">
                          <i className="fa-solid fa-fire text-[10px]"></i>
                          <span>{player.streak}d Streak</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="glass-panel p-8 text-center text-gray-500 text-xs">
                  No candidates match &apos;{searchQuery}&apos; in the current view.
                </div>
              )}

              {/* View full leaderboard button */}
              <div className="flex justify-center mt-2">
                <button 
                  onClick={() => alert('Full global databases view simulated!')}
                  className="px-6 py-2 rounded-lg border border-gray-700 bg-transparent text-gray-400 hover:text-white hover:border-gray-500 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  View Full Leaderboard <i className="fa-solid fa-arrow-right text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Progress Tracks & Achievement inventory */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
          
          {/* Progress Timeline Panel */}
          <div className="glass-panel p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <i className="fa-solid fa-chart-line text-purple-400"></i> Your Progress This Season
            </h3>
            
            <div className="flex justify-between items-center mb-6 px-1">
              <div className="text-center">
                <p className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wider">Rank</p>
                <p className="text-lg font-bold text-white">#1</p>
              </div>
              <div className="w-px h-8 bg-gray-800"></div>
              <div className="text-center">
                <p className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wider">Percentile</p>
                <p className="text-lg font-bold text-white">Top 1%</p>
              </div>
              <div className="w-px h-8 bg-gray-800"></div>
              <div className="text-center">
                <p className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wider">XP Earned</p>
                <p className="text-lg font-bold text-white">{currentUserXP}</p>
              </div>
            </div>

            {/* Rank Progress Bar (Interactive timeline tracker) */}
            <div className="relative pt-2 pb-6 px-1">
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-800"></div>
              <div className="absolute top-4 left-4 w-1/4 h-0.5 bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
              
              <div className="flex justify-between relative z-10">
                {/* Novice Milestone */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-800 border-2 border-cyan-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                  </div>
                  <span className="text-[10px] text-gray-500">Novice</span>
                </div>
                
                {/* Scholar Milestone (Current Active) */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-800 border-2 border-cyan-500 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-medium">Scholar</span>
                </div>

                {/* Expert (Locked) */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#09090b] border border-gray-700 flex items-center justify-center">
                    <i className="fa-solid fa-lock text-[8px] text-gray-600"></i>
                  </div>
                  <span className="text-[10px] text-gray-600">Expert</span>
                </div>

                {/* Master (Locked) */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#09090b] border border-gray-700 flex items-center justify-center">
                    <i className="fa-solid fa-lock text-[8px] text-gray-600"></i>
                  </div>
                  <span className="text-[10px] text-gray-600">Master</span>
                </div>

                {/* Legend (Locked) */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#09090b] border border-gray-700 flex items-center justify-center">
                    <i className="fa-solid fa-lock text-[8px] text-gray-600"></i>
                  </div>
                  <span className="text-[10px] text-gray-600">Legend</span>
                </div>
              </div>
            </div>
          </div>

          {/* Achievement Inventory Panel */}
          <div className="glass-panel flex-1 flex flex-col overflow-hidden">
            <div className="p-5 pb-3 flex justify-between items-center border-b border-gray-800/50">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <i className="fa-solid fa-medal text-blue-400"></i> Your Achievement Inventory
              </h3>
              <button 
                onClick={() => alert('Full Achievement Album view simulated!')} 
                className="text-[11px] text-blue-400 hover:text-blue-300"
              >
                View All
              </button>
            </div>

            <div className="p-3 overflow-y-auto flex-1 space-y-2 max-h-[360px] custom-scrollbar">
              {achievements.map((badge) => (
                <div 
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/30 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 flex-shrink-0">
                    <img 
                      alt={`${badge.name} Badge`} 
                      className="w-full h-full object-contain" 
                      src={badge.image} 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 group-hover:text-white truncate transition-colors">
                      {badge.name}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      Unlocked milestone badge!
                    </p>
                  </div>
                  <i className="fa-solid fa-chevron-right text-gray-600 text-[10px] group-hover:text-gray-400 transition-colors"></i>
                </div>
              ))}
            </div>
          </div>

          {/* Info Card Panel */}
          <div className="glass-panel p-5 relative overflow-hidden bg-gradient-to-br from-[#121216] to-[#1a1225]">
            <div className="absolute bottom-0 right-0 w-32 h-24 opacity-30 pointer-events-none">
              <img 
                alt="Graph graphic decoration" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8vKVgw9urEFdG2TNc69PTHiWDVCNP9HdgiKwPdYd486wSs21SwUFtJCJvlefFQFwNRzKLYnu4Huc6VC_E2iVEcXaY9mXtYiZw57zGek-Lp9D-fw7lFXE7WqusqPoDB7-woNlpbmpq192hjU9wjtbRbjg-_v9weVW5nTTn0LWmbYtIClgwhqKlv8dy8Ha39n9T1xW8txVxT6DfPM27ADQohn8XVP75PRHKf0jldMTW42vnMAPW9yn-a9fGuXR_efG4XevQlhYjH_Ai" 
              />
            </div>
            <div className="relative z-10">
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <i className="fa-solid fa-chess-knight text-purple-400"></i> How Rankings Work?
              </h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Earn XP by completing learning activities, mock tests, and practice sessions. The more you learn, the higher you climb!
              </p>
            </div>
          </div>
          
        </div>
      </div>

      {/* Achievement Detail Overlay Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-opacity duration-300">
          <div className="relative w-full max-w-md bg-[#121216] border border-gray-850 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button 
              onClick={() => {
                setSelectedBadge(null);
                setCopiedBadgeName(false);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-1"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            {/* Content Details */}
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-24 h-24 relative mt-2">
                <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full"></div>
                <img 
                  alt={selectedBadge.name} 
                  className="w-full h-full object-contain relative z-10 animate-bounce duration-1000" 
                  src={selectedBadge.image} 
                />
              </div>

              <div>
                <span className="bg-blue-900/40 text-blue-400 text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider border border-blue-800/30">
                  Unlocked Milestone
                </span>
                <h4 className="text-xl font-bold text-white mt-2">
                  {selectedBadge.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Unlocked on {selectedBadge.dateUnlocked}
                </p>
              </div>

              <div className="w-full bg-[#1e1e26]/50 border border-gray-800/50 rounded-xl p-4 text-left space-y-3">
                <div>
                  <h5 className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Description</h5>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                    {selectedBadge.description}
                  </p>
                </div>

                <div className="border-t border-gray-800/50 pt-2.5">
                  <h5 className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Unlock Requirement</h5>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                    {selectedBadge.requirement}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex gap-3 mt-2">
                <button 
                  onClick={() => handleShareBadge(selectedBadge.name)}
                  className="flex-1 py-2 px-4 bg-gray-800 hover:bg-gray-750 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-share-nodes"></i>
                  {copiedBadgeName ? 'Copied Link!' : 'Copy Share Link'}
                </button>
                
                <button 
                  onClick={() => {
                    setSelectedBadge(null);
                    setCopiedBadgeName(false);
                  }}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Close Details
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
