'use client';

import { JSX, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Calendar,
  Clock,
  MousePointerClick,
  BarChart2,
  Link as LucideLink,
  RefreshCcw,
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

interface AllUrls {
  trimId: string;
  redirectUrl: string;
}

interface AnalysisResult {
  firstAccess: string;
  lastAccess: string;
  recentAccesses: string[];
  totalClicks: number;
  trimId: string;
  redirectUrl: string;
}

const Analytics = () => {
  const [selectedUrl, setSelectedUrl] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalClicks, setTotalClicks] = useState<number>(0);
  const [FLvisitors, setFLvisitors] = useState<[string, string]>(['No clicks yet', 'No clicks yet']);
  const [analyticsData, setAnalyticsData] = useState<{ date: string; clicks: number }[]>([]);
  const [hasAnalytics, setHasAnalytics] = useState<boolean>(false);
  const [alltrimUrls, setAlltrimUrls] = useState<AllUrls[]>([]);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const trimUrlEnv = process.env.NEXT_PUBLIC_TRIM_URL;

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Debug environment variables if needed
    console.debug('NODE_ENV:', process.env.NODE_ENV);
    console.debug('NEXT_PUBLIC_TRIM_URL:', process.env.NEXT_PUBLIC_TRIM_URL);
  }, []);

  useEffect(() => {
    const fetchUrls = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/secure/allTrimUrls', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (res.status === 401) {
          window.location.href = '/auth';
          return;
        }
        const data = await res.json();
        if (data?.data) {
          setAlltrimUrls(data.data);
        }
      } catch (error) {
        console.error('Error fetching URLs:', (error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUrls();
  }, []);

  const fetchAnalytics = async () => {
    if (!selectedUrl) return;
    setIsLoading(true);
    setDisabled(true);
    setCountdown(10);

    try {
      const res = await fetch('/api/secure/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trimId: selectedUrl }),
      });

      const result = await res.json();
      if (!result?.data) return;

      const { recentAccesses, firstAccess, lastAccess, totalClicks } = result.data as AnalysisResult;

      setTotalClicks(totalClicks);
      setFLvisitors([firstAccess, lastAccess]);

      // Process data for hourly chart
      const now = Date.now();
      const dayAgo = now - 24 * 60 * 60 * 1000;
      const lastDayAccesses = recentAccesses
        .map(ts => new Date(ts).getTime())
        .filter(ms => ms >= dayAgo);

      // Initialize hourly buckets
      const buckets: Record<string, number> = {};
      for (let h = 0; h < 24; h++) {
        const label = `${h.toString().padStart(2, '0')}:00`;
        buckets[label] = 0;
      }

      // Count clicks per hour
      lastDayAccesses.forEach(ms => {
        const dt = new Date(ms);
        const hourLabel = `${dt.getHours().toString().padStart(2, '0')}:00`;
        buckets[hourLabel]++;
      });

      // Format for chart display
      const chartData = Object.entries(buckets).map(([time, clicks]) => ({
        date: time,
        clicks,
      }));

      setAnalyticsData(chartData);
      setHasAnalytics(true);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
      let interval: NodeJS.Timeout;
      setCountdown(prev => prev);
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    if (selectedUrl) {
      fetchAnalytics();
    }
  }, [selectedUrl]);

  const handleUrlSelect = (trimId: string) => {
    if (trimId !== selectedUrl) {
      setSelectedUrl(trimId);
      setHasAnalytics(false);
    }
    setIsDropdownOpen(false);
  };

  const getSelectedUrlRedirect = () => {
    const selected = alltrimUrls.find(url => url.trimId === selectedUrl);
    return selected ? selected.redirectUrl : '';
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-800">
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16" ref={dropdownRef}>
          {/* Title Section */}
          <section className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="text-indigo-300">URL</span> Analytics Dashboard
            </h2>
            <p className="text-md sm:text-lg text-indigo-200 max-w-2xl mx-auto">
              Track performance metrics and engagement for your shortened links
            </p>
          </section>

          {/* URL Selector */}
          <section className="relative z-10 bg-white/5 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-indigo-500/30 mb-8 shadow-xl">
            <h3 className="text-xl sm:text-2xl font-medium text-white mb-4 flex items-center">
              <BarChart2 className="mr-2 text-indigo-400" size={22} />
              Select URL to Analyze
            </h3>

            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setIsDropdownOpen(prev => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                className="w-full flex items-center justify-between bg-indigo-900/60 border border-indigo-400/40 rounded-lg p-4 text-white hover:bg-indigo-800/80 transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <span className="truncate font-medium">
                  {selectedUrl
                    ? `${selectedUrl} → ${getSelectedUrlRedirect()}`
                    : 'Select a shortened URL'}
                </span>
                <ChevronDown
                  className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  size={20}
                />
              </button>

              {selectedUrl && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4">
                  <span className="flex items-center gap-2">
                    <LucideLink size={20} color="#34D399" />
                    <Link
                      href={`${trimUrlEnv}/${selectedUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline hover:text-blue-300 transition break-all"
                    >
                      {`${trimUrlEnv}/${selectedUrl}`}
                    </Link>
                  </span>
                  <button
                    onClick={fetchAnalytics}
                    disabled={disabled}
                    className={`flex items-center gap-2 border-2 border-rose-950 p-2 rounded-md bg-blue-900 text-white transition hover:shadow-fuchsia-300 hover:shadow active:translate-y-0.5 ${
                      disabled
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer'
                    } focus:ring-2 focus:ring-indigo-400 focus:outline-none`}
                  >
                    {disabled ? (
                      <span>Wait {countdown}s</span>
                    ) : (
                      <>
                        <span>Refresh Analysis</span>
                        <RefreshCcw className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Dropdown List */}
              {isDropdownOpen && (
                <ul
                  role="listbox"
                  className="absolute mt-2 w-full bg-indigo-900/90 backdrop-blur-md border border-indigo-500/50 rounded-lg shadow-2xl max-h-60 overflow-auto z-50"
                >
                  {alltrimUrls.length > 0 ? (
                    alltrimUrls.map(url => (
                      <li
                        key={url.trimId}
                        role="option"
                        aria-selected={selectedUrl === url.trimId}
                        onClick={() => handleUrlSelect(url.trimId)}
                        className="cursor-pointer hover:bg-indigo-800/80 p-3 text-white border-b border-indigo-700/30 last:border-0 transition-colors truncate"
                      >
                        <div className="font-medium truncate">{url.trimId}</div>
                        <div className="text-sm text-indigo-300 truncate">
                          {url.redirectUrl}
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="p-4 text-indigo-300 text-center">
                      No URLs found
                    </li>
                  )}
                </ul>
              )}
            </div>
          </section>

          {/* Content */}
          {isLoading && !hasAnalytics ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-400"></div>
              <span className="ml-3 text-indigo-300">Loading analytics data...</span>
            </div>
          ) : selectedUrl && hasAnalytics ? (
            <>
              {/* Metrics Cards */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                <MetricCard
                  icon={<MousePointerClick className="text-indigo-400" size={22} />}
                  title="Total Clicks"
                  value={totalClicks}
                  subtitle="All-time engagement"
                />
                <MetricCard
                  icon={<Calendar className="text-indigo-400" size={22} />}
                  title="First Visit"
                  value={FLvisitors[0]}
                  subtitle="Initial engagement"
                />
                <MetricCard
                  icon={<Clock className="text-indigo-400" size={22} />}
                  title="Most Recent Visit"
                  value={FLvisitors[1]}
                  subtitle="Latest activity"
                />
              </section>

              {/* Chart Section */}
              <section className="bg-white/5 backdrop-blur-lg rounded-xl p-6 md:p-8 border border-indigo-500/30 mb-12 shadow-xl">
                <h4 className="text-xl sm:text-2xl font-medium text-white mb-6 flex items-center">
                  <BarChart className="mr-2 text-indigo-400" />
                  Hourly Traffic (Last 24 Hours)
                </h4>

                <div className="w-full overflow-x-auto">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                      <XAxis
                        dataKey="date"
                        stroke="#a5b4fc"
                        tick={{ fill: '#a5b4fc', fontSize: 12 }}
                        tickMargin={10}
                      />
                      <YAxis
                        stroke="#a5b4fc"
                        allowDecimals={false}
                        tick={{ fill: '#a5b4fc', fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(79, 70, 229, 0.9)',
                          border: '1px solid #6366f1',
                          borderRadius: '8px',
                          color: 'white',
                        }}
                        itemStyle={{ color: 'white' }}
                        labelStyle={{ color: 'white', fontWeight: 'bold' }}
                        cursor={{ fill: 'rgba(99, 102, 241, 0.2)' }}
                      />
                      <Bar dataKey="clicks" fill="#818cf8" radius={[4, 4, 0, 0]} animationDuration={1500} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </>
          ) : selectedUrl ? (
            <div className="text-center py-12 bg-white/5 backdrop-blur-lg rounded-xl border border-indigo-500/30">
              <h4 className="text-xl font-medium text-white mb-2">
                No analytics data available
              </h4>
              <p className="text-indigo-300">
                This URL hasn't received any clicks yet.
              </p>
            </div>
          ) : (
            <div className="text-center py-12 bg-white/5 backdrop-blur-lg rounded-xl border border-indigo-500/30">
              <h4 className="text-xl font-medium text-white mb-2">
                Select a URL to view analytics
              </h4>
              <p className="text-indigo-300">
                Choose a shortened URL from the dropdown above to see detailed metrics.
              </p>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
};

const MetricCard = ({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: JSX.Element;
  title: string;
  value: string | number;
  subtitle: string;
}) => (
  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-indigo-500/30 hover:border-indigo-400/50 transition-all shadow-lg hover:shadow-xl focus-within:ring-2 focus-within:ring-indigo-400">
    <div className="flex items-center mb-3">
      <div className="p-2 rounded-lg bg-indigo-900/40 mr-3 flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="text-lg sm:text-xl font-medium text-white">{title}</h4>
        <p className="text-xs sm:text-sm text-indigo-300">{subtitle}</p>
      </div>
    </div>
    <p className="text-2xl sm:text-3xl font-bold text-white mt-2 truncate">{value}</p>
  </div>
);

export default Analytics;