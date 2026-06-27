"use client";
import React, { useEffect, useState } from 'react';
import { axiosClient } from '@/utils/AxiosClient';
import { toast } from 'react-toastify';
import { CgSpinner } from 'react-icons/cg';
import { IoHeartOutline, IoSparklesOutline, IoCheckmarkCircle, IoAlertCircle, IoTimeOutline } from 'react-icons/io5';
import BreadCrums from '@/components/BreadCrums';

const MatchmakerPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [activeTab, setActiveTab] = useState('preferences'); // 'preferences' or 'real-persons'

  // Forms state
  const [p1Name, setP1Name] = useState('Tanvir Rahman');
  const [p1Gender, setP1Gender] = useState('male');
  const [p1Style, setP1Style] = useState('Traditional');
  const [p1Budget, setP1Budget] = useState('Standard');
  const [p1Focus, setP1Focus] = useState('Venue');
  const [p1Guests, setP1Guests] = useState('Family (300-600)');

  const [p2Name, setP2Name] = useState('Nusrat Jahan');
  const [p2Gender, setP2Gender] = useState('female');
  const [p2Style, setP2Style] = useState('Royal');
  const [p2Budget, setP2Budget] = useState('Premium');
  const [p2Focus, setP2Focus] = useState('Decor');
  const [p2Guests, setP2Guests] = useState('Family (300-600)');

  // Real persons compatibility form state
  const [realP1Name, setRealP1Name] = useState('');
  const [realP1Age, setRealP1Age] = useState('');
  const [realP1Profession, setRealP1Profession] = useState('');
  const [realP1Hobbies, setRealP1Hobbies] = useState('');
  const [realP1Personality, setRealP1Personality] = useState('');
  const [realP1Values, setRealP1Values] = useState('');

  const [realP2Name, setRealP2Name] = useState('');
  const [realP2Age, setRealP2Age] = useState('');
  const [realP2Profession, setRealP2Profession] = useState('');
  const [realP2Hobbies, setRealP2Hobbies] = useState('');
  const [realP2Personality, setRealP2Personality] = useState('');
  const [realP2Values, setRealP2Values] = useState('');
  const [realMatchResult, setRealMatchResult] = useState(null);

  // User selection state
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser1, setSelectedUser1] = useState(null);
  const [selectedUser2, setSelectedUser2] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token") || '';
      const response = await axiosClient.get("/matchmaker", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setHistory(response.data || []);
      if (response.data && response.data.length > 0) {
        setCurrentMatch(response.data[0]);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load matching history");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      setLoadingUsers(true);
      const token = localStorage.getItem("token") || '';
      const response = await axiosClient.get("/matchmaker/users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAvailableUsers(response.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load available users");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (activeTab === 'real-persons') {
      fetchAvailableUsers();
    }
  }, [activeTab]);

  const handleMatch = async (e) => {
    e.preventDefault();
    try {
      setMatching(true);
      const token = localStorage.getItem("token") || '';
      const response = await axiosClient.post('/matchmaker',
        {
          partner1: {
            name: p1Name,
            gender: p1Gender,
            style: p1Style,
            budget: p1Budget,
            focus: p1Focus,
            guests: p1Guests
          },
          partner2: {
            name: p2Name,
            gender: p2Gender,
            style: p2Style,
            budget: p2Budget,
            focus: p2Focus,
            guests: p2Guests
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setCurrentMatch(response.data);
      setHistory(prev => [response.data, ...prev]);
      toast.success("Compatibility calculated successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to compute matching compatibility");
    } finally {
      setMatching(false);
    }
  };

  const handleRealPersonMatch = (e) => {
    e.preventDefault();
    
    // Calculate real persons compatibility score based on personality, values, hobbies, profession
    let personalityScore = 0;
    let valuesScore = 0;
    let hobbiesScore = 0;
    let professionScore = 0;
    let ageScore = 0;

    const matches = [];
    const compromises = [];

    // Personality compatibility
    const personalityTraits = {
      'Introvert': ['Introvert', 'Ambivert'],
      'Extrovert': ['Extrovert', 'Ambivert'],
      'Ambivert': ['Introvert', 'Extrovert', 'Ambivert']
    };

    if (realP1Personality === realP2Personality) {
      personalityScore = 100;
      matches.push(`Both have ${realP1Personality} personality type - great natural compatibility!`);
    } else if (personalityTraits[realP1Personality]?.includes(realP2Personality)) {
      personalityScore = 75;
      matches.push(`${realP1Personality} and ${realP2Personality} personalities can complement each other well.`);
    } else {
      personalityScore = 50;
      compromises.push(`Different personality types (${realP1Personality} vs ${realP2Personality}) may require understanding and patience.`);
    }

    // Values compatibility
    const valueKeywords1 = realP1Values.toLowerCase().split(',').map(v => v.trim());
    const valueKeywords2 = realP2Values.toLowerCase().split(',').map(v => v.trim());
    const commonValues = valueKeywords1.filter(v => valueKeywords2.includes(v));
    
    if (commonValues.length > 0) {
      valuesScore = Math.min(100, 50 + commonValues.length * 25);
      matches.push(`Shared values: ${commonValues.join(', ')}`);
    } else {
      valuesScore = 40;
      compromises.push('Different life values - important to discuss core beliefs and priorities.');
    }

    // Hobbies compatibility
    const hobbyKeywords1 = realP1Hobbies.toLowerCase().split(',').map(h => h.trim());
    const hobbyKeywords2 = realP2Hobbies.toLowerCase().split(',').map(h => h.trim());
    const commonHobbies = hobbyKeywords1.filter(h => hobbyKeywords2.includes(h));
    
    if (commonHobbies.length > 0) {
      hobbiesScore = Math.min(100, 50 + commonHobbies.length * 25);
      matches.push(`Common interests: ${commonHobbies.join(', ')}`);
    } else {
      hobbiesScore = 30;
      compromises.push('Different hobbies - opportunity to explore new activities together.');
    }

    // Profession compatibility
    if (realP1Profession === realP2Profession) {
      professionScore = 100;
      matches.push(`Both work in ${realP1Profession} - shared professional understanding!`);
    } else {
      professionScore = 60;
      matches.push(`Different professions (${realP1Profession} and ${realP2Profession}) can bring diverse perspectives.`);
    }

    // Age compatibility
    const age1 = parseInt(realP1Age)
    const age2 = parseInt(realP2Age)
    const ageDiff = Math.abs(age1 - age2);
    
    if (ageDiff <= 2) {
      ageScore = 100;
      matches.push('Similar age groups - likely in similar life stages.');
    } else if (ageDiff <= 5) {
      ageScore = 80;
      matches.push('Small age difference - generally compatible life stages.');
    } else if (ageDiff <= 10) {
      ageScore = 60;
      compromises.push('Moderate age difference - may have different life experiences.');
    } else {
      ageScore = 40;
      compromises.push('Significant age difference - important to discuss life goals and timelines.');
    }

    const overallScore = Math.round(
      (personalityScore * 0.35) + 
      (valuesScore * 0.30) + 
      (hobbiesScore * 0.20) + 
      (professionScore * 0.10) + 
      (ageScore * 0.05)
    );

    // Generate recommendation
    let recommendation = '';
    if (overallScore >= 80) {
      recommendation = `Excellent compatibility! ${realP1Name} and ${realP2Name} share strong foundations in personality, values, and interests. This relationship has great potential for long-term success. Focus on nurturing your shared interests while respecting individual differences.`;
    } else if (overallScore >= 60) {
      recommendation = `Good compatibility with room to grow. ${realP1Name} and ${realP2Name} have several areas of alignment. Focus on building communication around your differences and celebrating your common interests. With effort and understanding, this can be a strong partnership.`;
    } else if (overallScore >= 40) {
      recommendation = `Moderate compatibility requiring effort. ${realP1Name} and ${realP2Name} have some differences that may need attention. Open communication about values, life goals, and expectations will be crucial. Consider pre-marital counseling to strengthen your foundation.`;
    } else {
      recommendation = `Significant differences exist that may require serious consideration. ${realP1Name} and ${realP2Name} should have honest conversations about core values, life goals, and expectations. Professional counseling may help determine if these differences can be worked through.`;
    }

    setRealMatchResult({
      partner1: { name: realP1Name, age: realP1Age, profession: realP1Profession, personality: realP1Personality },
      partner2: { name: realP2Name, age: realP2Age, profession: realP2Profession, personality: realP2Personality },
      compatibilityScore: overallScore,
      matches,
      compromises,
      recommendation
    });

    toast.success("Real persons compatibility calculated!");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadCrums text="AI Wedding Matchmaker" />

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <CgSpinner className="animate-spin text-6xl text-logo mb-4" />
          <p className="text-zinc-600 font-medium">Loading matchmaker engine...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Tab Navigation */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-zinc-150 p-2 shadow-sm flex gap-2">
              <button
                onClick={() => setActiveTab('preferences')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === 'preferences'
                    ? 'bg-logo text-white shadow-md'
                    : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                Wedding Preferences Match
              </button>
              <button
                onClick={() => setActiveTab('real-persons')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === 'real-persons'
                    ? 'bg-logo text-white shadow-md'
                    : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                Real Persons Compatibility
              </button>
            </div>
          </div>

          {/* Inputs Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Wedding Preferences Form */}
            {activeTab === 'preferences' && (
              <div className="bg-white rounded-2xl border border-zinc-150 p-6 shadow-sm">
                <h3 className="text-lg font-psmbold text-zinc-900 mb-6 flex items-center gap-x-2">
                  <IoSparklesOutline className="text-xl text-logo" />
                  Input Partner Preferences
                </h3>

              <form onSubmit={handleMatch} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Partner 1 details */}
                  <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 space-y-4">
                    <h4 className="font-semibold text-logo text-sm uppercase tracking-wider">Partner 1 (Boy/Groom)</h4>
                    
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Name</label>
                      <input
                        type="text"
                        value={p1Name}
                        onChange={(e) => setP1Name(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Favorite Wedding Style</label>
                      <select
                        value={p1Style}
                        onChange={(e) => setP1Style(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option value="Traditional">Traditional Bangladeshi</option>
                        <option value="Royal">Royal Red & Gold</option>
                        <option value="Pastel">Pastel Nikah</option>
                        <option value="Modern">Modern Minimal</option>
                        <option value="Garden">Garden / Outdoor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Budget Priority</label>
                      <select
                        value={p1Budget}
                        onChange={(e) => setP1Budget(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white outline-none"
                      >
                        <option value="Essential">Essential (under BDT 6 lakh)</option>
                        <option value="Standard">Standard (BDT 6-12 lakh)</option>
                        <option value="Premium">Premium (BDT 12-25 lakh)</option>
                        <option value="Luxury">Luxury (BDT 25 lakh+)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Key Focus Area</label>
                      <select
                        value={p1Focus}
                        onChange={(e) => setP1Focus(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white outline-none"
                      >
                        <option value="Venue">Venue & Location</option>
                        <option value="Food">Food & Catering</option>
                        <option value="Music">Music & Sound</option>
                        <option value="Decor">Decoration & Lighting</option>
                        <option value="Photography">Photography & Videography</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Ideal Guest Count</label>
                      <select
                        value={p1Guests}
                        onChange={(e) => setP1Guests(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white outline-none"
                      >
                        <option value="Intimate (<150)">Intimate (&lt; 150 guests)</option>
                        <option value="Family (300-600)">Family (300 - 600 guests)</option>
                        <option value="Large (700+)">Large (700+ guests)</option>
                      </select>
                    </div>
                  </div>

                  {/* Partner 2 details */}
                  <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 space-y-4">
                    <h4 className="font-semibold text-pink-600 text-sm uppercase tracking-wider">Partner 2 (Girl/Bride)</h4>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Name</label>
                      <input
                        type="text"
                        value={p2Name}
                        onChange={(e) => setP2Name(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Favorite Wedding Style</label>
                      <select
                        value={p2Style}
                        onChange={(e) => setP2Style(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option value="Traditional">Traditional Bangladeshi</option>
                        <option value="Royal">Royal Red & Gold</option>
                        <option value="Pastel">Pastel Nikah</option>
                        <option value="Modern">Modern Minimal</option>
                        <option value="Garden">Garden / Outdoor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Budget Priority</label>
                      <select
                        value={p2Budget}
                        onChange={(e) => setP2Budget(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white outline-none"
                      >
                        <option value="Essential">Essential (under BDT 6 lakh)</option>
                        <option value="Standard">Standard (BDT 6-12 lakh)</option>
                        <option value="Premium">Premium (BDT 12-25 lakh)</option>
                        <option value="Luxury">Luxury (BDT 25 lakh+)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Key Focus Area</label>
                      <select
                        value={p2Focus}
                        onChange={(e) => setP2Focus(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white outline-none"
                      >
                        <option value="Venue">Venue & Location</option>
                        <option value="Food">Food & Catering</option>
                        <option value="Music">Music & Sound</option>
                        <option value="Decor">Decoration & Lighting</option>
                        <option value="Photography">Photography & Videography</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Ideal Guest Count</label>
                      <select
                        value={p2Guests}
                        onChange={(e) => setP2Guests(e.target.value)}
                        className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white outline-none"
                      >
                        <option value="Intimate (<150)">Intimate (&lt; 150 guests)</option>
                        <option value="Family (300-600)">Family (300 - 600 guests)</option>
                        <option value="Large (700+)">Large (700+ guests)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={matching}
                  className="w-full py-3 bg-logo hover:bg-logo/90 text-white font-psmbold rounded-xl transition-colors flex items-center justify-center gap-x-2 shadow-sm text-base cursor-pointer"
                >
                  {matching ? (
                    <CgSpinner className="animate-spin text-xl" />
                  ) : (
                    <>
                      <IoHeartOutline className="text-xl" />
                      <span>Analyze Compatibility & Match!</span>
                    </>
                  )}
                </button>
              </form>
            </div>
            )}

            {/* Results Display */}
            {activeTab === 'preferences' && currentMatch && (
              <div className="bg-white rounded-2xl border border-zinc-150 p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-x-6 gap-y-4">
                  {/* Gauge */}
                  <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        className="stroke-zinc-100"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        className="stroke-logo"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 60}
                        strokeDashoffset={2 * Math.PI * 60 * (1 - currentMatch.compatibilityScore / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-psmbold text-zinc-950">{currentMatch.compatibilityScore}%</span>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">Match Score</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-psmbold text-zinc-950">
                      Compatibility Analysis: {currentMatch.partner1.name} & {currentMatch.partner2.name}
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">
                      Calculated using wedding theme preferences, focus points, guest numbers, and budget alignment.
                    </p>
                  </div>
                </div>

                {/* AI Assistant recommendation */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
                  <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-widest mb-2 flex items-center gap-x-1.5">
                    <IoSparklesOutline className="text-sm" />
                    AI Planner Recommendation
                  </h4>
                  <p className="text-zinc-800 text-sm font-medium leading-relaxed">
                    {currentMatch.recommendation}
                  </p>
                </div>

                {/* Agreements list */}
                {currentMatch.matches.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Points of Agreement</h4>
                    <div className="space-y-1.5">
                      {currentMatch.matches.map((match, i) => (
                        <div key={i} className="flex items-start gap-x-2 text-sm text-zinc-800">
                          <IoCheckmarkCircle className="text-green-500 text-lg shrink-0 mt-0.5" />
                          <span>{match}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compromises list */}
                {currentMatch.compromises.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Areas for Discussion</h4>
                    <div className="space-y-1.5">
                      {currentMatch.compromises.map((comp, i) => (
                        <div key={i} className="flex items-start gap-x-2 text-sm text-zinc-800">
                          <IoAlertCircle className="text-amber-500 text-lg shrink-0 mt-0.5" />
                          <span>{comp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Real Persons Compatibility Form */}
            {activeTab === 'real-persons' && (
              <div className="bg-white rounded-2xl border border-zinc-150 p-6 shadow-sm">
                <h3 className="text-lg font-psmbold text-zinc-900 mb-6 flex items-center gap-x-2">
                  <IoHeartOutline className="text-xl text-logo" />
                  Real Persons Compatibility Analysis
                </h3>

                {/* User Selection Mode */}
                <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <p className="text-sm text-indigo-800 font-medium mb-3">
                    Select users from the database for automatic compatibility check
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-indigo-700 mb-1">Select Person 1</label>
                      <select
                        value={selectedUser1?._id || ''}
                        onChange={(e) => {
                          const user = availableUsers.find(u => u._id === e.target.value);
                          if (user) {
                            setSelectedUser1(user);
                            setRealP1Name(user.name || '');
                            setRealP1Age(user.age?.toString() || '');
                            setRealP1Profession(user.profession || '');
                            setRealP1Personality(user.personality || '');
                            setRealP1Hobbies(user.hobbies || '');
                            setRealP1Values(user.values || '');
                          }
                        }}
                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
                      >
                        <option value="">-- Select from database --</option>
                        {availableUsers.filter(u => u._id !== selectedUser2?._id).map(user => (
                          <option key={user._id} value={user._id}>
                            {user.name} ({user.profession || 'No profession'})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-indigo-700 mb-1">Select Person 2</label>
                      <select
                        value={selectedUser2?._id || ''}
                        onChange={(e) => {
                          const user = availableUsers.find(u => u._id === e.target.value);
                          if (user) {
                            setSelectedUser2(user);
                            setRealP2Name(user.name || '');
                            setRealP2Age(user.age?.toString() || '');
                            setRealP2Profession(user.profession || '');
                            setRealP2Personality(user.personality || '');
                            setRealP2Hobbies(user.hobbies || '');
                            setRealP2Values(user.values || '');
                          }
                        }}
                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
                      >
                        <option value="">-- Select from database --</option>
                        {availableUsers.filter(u => u._id !== selectedUser1?._id).map(user => (
                          <option key={user._id} value={user._id}>
                            {user.name} ({user.profession || 'No profession'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {loadingUsers && (
                    <p className="text-xs text-indigo-600 mt-2">Loading available users...</p>
                  )}
                  {availableUsers.length === 0 && !loadingUsers && (
                    <p className="text-xs text-zinc-500 mt-2">No users available for matching. Users need to fill their profile first.</p>
                  )}
                </div>

                <form onSubmit={handleRealPersonMatch} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Person 1 details */}
                    <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 space-y-4">
                      <h4 className="font-semibold text-logo text-sm uppercase tracking-wider">Person 1</h4>
                      
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Name</label>
                        <input
                          type="text"
                          value={realP1Name}
                          onChange={(e) => setRealP1Name(e.target.value)}
                          className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Age</label>
                        <input
                          type="number"
                          value={realP1Age}
                          onChange={(e) => setRealP1Age(e.target.value)}
                          className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Profession</label>
                        <input
                          type="text"
                          value={realP1Profession}
                          onChange={(e) => setRealP1Profession(e.target.value)}
                          className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Personality Type</label>
                        <select
                          value={realP1Personality}
                          onChange={(e) => setRealP1Personality(e.target.value)}
                          className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 transition-colors"
                          required
                        >
                          <option value="">Select personality</option>
                          <option value="Introvert">Introvert</option>
                          <option value="Extrovert">Extrovert</option>
                          <option value="Ambivert">Ambivert</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Hobbies (comma separated)</label>
                        <input
                          type="text"
                          value={realP1Hobbies}
                          onChange={(e) => setRealP1Hobbies(e.target.value)}
                          placeholder="e.g. reading, traveling, cooking"
                          className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Core Values (comma separated)</label>
                        <input
                          type="text"
                          value={realP1Values}
                          onChange={(e) => setRealP1Values(e.target.value)}
                          placeholder="e.g. family, honesty, ambition"
                          className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Person 2 details */}
                    <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 space-y-4">
                      <h4 className="font-semibold text-pink-600 text-sm uppercase tracking-wider">Person 2</h4>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Name</label>
                        <input
                          type="text"
                          value={realP2Name}
                          onChange={(e) => setRealP2Name(e.target.value)}
                          className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Age</label>
                        <input
                          type="number"
                          value={realP2Age}
                          onChange={(e) => setRealP2Age(e.target.value)}
                          className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Profession</label>
                        <input
                          type="text"
                          value={realP2Profession}
                          onChange={(e) => setRealP2Profession(e.target.value)}
                          className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Personality Type</label>
                        <select
                          value={realP2Personality}
                          onChange={(e) => setRealP2Personality(e.target.value)}
                          className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 transition-colors"
                          required
                        >
                          <option value="">Select personality</option>
                          <option value="Introvert">Introvert</option>
                          <option value="Extrovert">Extrovert</option>
                          <option value="Ambivert">Ambivert</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Hobbies (comma separated)</label>
                        <input
                          type="text"
                          value={realP2Hobbies}
                          onChange={(e) => setRealP2Hobbies(e.target.value)}
                          placeholder="e.g. sports, music, gaming"
                          className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 mb-1">Core Values (comma separated)</label>
                        <input
                          type="text"
                          value={realP2Values}
                          onChange={(e) => setRealP2Values(e.target.value)}
                          placeholder="e.g. family, honesty, creativity"
                          className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-logo hover:bg-logo/90 text-white font-psmbold rounded-xl transition-colors flex items-center justify-center gap-x-2 shadow-sm text-base cursor-pointer"
                  >
                    <IoHeartOutline className="text-xl" />
                    <span>Calculate Real Persons Compatibility</span>
                  </button>
                </form>
              </div>
            )}

            {/* Real Persons Results Display */}
            {activeTab === 'real-persons' && realMatchResult && (
              <div className="bg-white rounded-2xl border border-zinc-150 p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-x-6 gap-y-4">
                  {/* Gauge */}
                  <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        className="stroke-zinc-100"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        className="stroke-pink-500"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 60}
                        strokeDashoffset={2 * Math.PI * 60 * (1 - realMatchResult.compatibilityScore / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-3xl font-psmbold text-zinc-950">{realMatchResult.compatibilityScore}%</span>
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">Compatibility</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-psmbold text-zinc-950">
                      Real Persons Compatibility: {realMatchResult.partner1.name} & {realMatchResult.partner2.name}
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">
                      Calculated using personality, values, hobbies, profession, and age compatibility factors.
                    </p>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-5 border border-pink-100">
                  <h4 className="text-xs font-bold text-pink-700 uppercase tracking-widest mb-2 flex items-center gap-x-1.5">
                    <IoHeartOutline className="text-sm" />
                    Compatibility Assessment
                  </h4>
                  <p className="text-zinc-800 text-sm font-medium leading-relaxed">
                    {realMatchResult.recommendation}
                  </p>
                </div>

                {/* Agreements list */}
                {realMatchResult.matches.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Strengths</h4>
                    <div className="space-y-1.5">
                      {realMatchResult.matches.map((match, i) => (
                        <div key={i} className="flex items-start gap-x-2 text-sm text-zinc-800">
                          <IoCheckmarkCircle className="text-green-500 text-lg shrink-0 mt-0.5" />
                          <span>{match}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compromises list */}
                {realMatchResult.compromises.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Areas to Consider</h4>
                    <div className="space-y-1.5">
                      {realMatchResult.compromises.map((comp, i) => (
                        <div key={i} className="flex items-start gap-x-2 text-sm text-zinc-800">
                          <IoAlertCircle className="text-amber-500 text-lg shrink-0 mt-0.5" />
                          <span>{comp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Past Matches Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-zinc-150 p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-psmbold text-zinc-950 flex items-center gap-x-2">
                <IoTimeOutline className="text-xl text-logo" />
                Match History
              </h3>

              {history.length <= 1 ? (
                <p className="text-zinc-500 text-xs italic">Past calculations will show up here.</p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {history.map((item, i) => {
                    const active = currentMatch && currentMatch._id === item._id;
                    const date = new Date(item.createdAt).toLocaleDateString();

                    return (
                      <button
                        key={item._id}
                        onClick={() => setCurrentMatch(item)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all duration-350 ${
                          active
                            ? 'border-logo bg-indigo-50/50 text-indigo-950 font-semibold'
                            : 'border-zinc-100 hover:border-zinc-200 text-zinc-600'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold">
                            {item.partner1.name} & {item.partner2.name}
                          </span>
                          <span className="text-[10px] text-zinc-400">{date}</span>
                        </div>
                        <p>Compatibility: <span className="font-semibold text-logo">{item.compatibilityScore}%</span></p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchmakerPage;
