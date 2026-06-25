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

  useEffect(() => {
    fetchHistory();
  }, []);

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
          {/* Inputs Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* The Form */}
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

            {/* Results Display */}
            {currentMatch && (
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
