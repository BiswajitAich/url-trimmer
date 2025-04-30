'use client';
import { JSX, useEffect, useState } from 'react';
import Link from 'next/link'
import { ChevronDown, Calendar, Clock, MousePointerClick, BarChart2, Link as LucideLink, RefreshCcw } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import isUserLoggedIn from '../auth/checkAuth';
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
    const [selectedUrl, setSelectedUrl] = useState<string>("");
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [totalClicks, setTotalClicks] = useState<number>(0);
    const [FLvisitors, setFLvisitors] = useState<[string, string]>(["No clicks yet", "No clicks yet"]);
    const [analyticsData, setAnalyticsData] = useState<{ date: string; clicks: number }[]>([]);
    const [hasAnalytics, setHasAnalytics] = useState<boolean>(false);
    const [alltrimUrls, setAlltrimUrls] = useState<AllUrls[]>([]);
    const [disabled, setDisabled] = useState<boolean>(false);
    const [countdown, setCountdown] = useState<number>(0);
    const trimUrlEnv = process.env.NEXT_PUBLIC_TRIM_URL;
    useEffect(() => {
        if (!isUserLoggedIn()) {
            window.location.href = '/auth';
            return;
        }

        const fetchUrls = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/secure/allTrimUrls', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await res.json();
                if (data?.data) {
                    setAlltrimUrls(data.data);
                }
            } catch (error) {
                console.log((error as Error).message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUrls();
    }, []);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        setDisabled(true);
        setCountdown(10);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch('/api/secure/analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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
                clicks
            }));

            setAnalyticsData(chartData);
            setHasAnalytics(true);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
            const interval = setInterval(() => {
                setCountdown((prev) => {
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
        if (!selectedUrl) return;
        fetchAnalytics();
    }, [selectedUrl]);

    const handleUrlSelect = (trimId: string) => {
        setSelectedUrl(trimId);
        setIsDropdownOpen(false);
    };

    const getSelectedUrlRedirect = () => {
        const selected = alltrimUrls.find(url => url.trimId === selectedUrl);
        return selected ? selected.redirectUrl : '';
    };

    const handleClickOutside = () => {
        if (isDropdownOpen) {
            setIsDropdownOpen(false);
        }
    };

    return (<>
        <Header />
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-800" onClick={handleClickOutside}>
            <main className="flex-grow px-4 py-12 md:py-16">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            <span className="text-indigo-300">URL</span> Analytics Dashboard
                        </h2>
                        <p className="text-lg text-indigo-200 max-w-2xl mx-auto">
                            Track performance metrics and engagement for your shortened links
                        </p>
                    </div>

                    <div className="relative z-10 bg-white/5 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-indigo-500/30 mb-8 shadow-xl">
                        <h3 className="text-xl font-medium text-white mb-4 flex items-center">
                            <BarChart2 className="mr-2 text-indigo-400" size={22} />
                            Select URL to Analyze
                        </h3>

                        <div className="relative mb-6" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full flex items-center justify-bettrimn bg-indigo-900/60 border border-indigo-400/40 rounded-lg p-4 text-white hover:bg-indigo-800/80 transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            >
                                <span className="truncate font-medium">
                                    {selectedUrl ? `${selectedUrl} → ${getSelectedUrlRedirect()}` : "Select a shortened URL"}
                                </span>
                                <ChevronDown className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} size={20} />
                            </button>
                            {selectedUrl && (
                                <span className="flex items-center gap-2 mt-4">
                                    <LucideLink size={20} color="green" />
                                    <Link
                                        href={`${trimUrlEnv}/${selectedUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 underline hover:text-blue-300 transition"
                                    >
                                        {`${trimUrlEnv}/${selectedUrl}`}
                                    </Link>
                                    <button
                                        onClick={fetchAnalytics}
                                        disabled={disabled}
                                        className={`flex items-center gap-2 border-2 border-rose-950 p-2 rounded-md bg-blue-900 text-white transition hover:shadow-fuchsia-300 hover:shadow active:translate-y-0.5 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                    >
                                        {disabled ? (
                                            <>
                                                <span>Wait {countdown}s</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Refresh Analysis</span>
                                                <RefreshCcw className="h-5 w-5" />
                                            </>
                                        )}
                                    </button>

                                </span>
                            )}

                            {isDropdownOpen && (
                                <div className="absolute mt-2 w-full bg-indigo-900/90 backdrop-blur-md border border-indigo-500/50 rounded-lg shadow-2xl max-h-60 overflow-auto z-50">
                                    {alltrimUrls.length > 0 ? (
                                        alltrimUrls.map((url) => (
                                            <div
                                                key={url.trimId}
                                                onClick={() => handleUrlSelect(url.trimId)}
                                                className="cursor-pointer hover:bg-indigo-800/80 p-3 text-white border-b border-indigo-700/30 last:border-0 transition-colors"
                                            >
                                                <div className="font-medium">{url.trimId}</div>
                                                <div className="text-sm text-indigo-300 truncate">{url.redirectUrl}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-indigo-300 text-center">No URLs found</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {isLoading && !hasAnalytics ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-400"></div>
                            <span className="ml-3 text-indigo-300">Loading analytics data...</span>
                        </div>
                    ) : selectedUrl && hasAnalytics ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
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
                            </div>

                            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 md:p-8 border border-indigo-500/30 mb-12 shadow-xl">
                                <h4 className="text-xl font-medium text-white mb-6 flex items-center">
                                    <BarChart className="mr-2 text-indigo-400" />
                                    Hourly Traffic (Last 24 Hours)
                                </h4>

                                <div className="mt-4">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={analyticsData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                                            <XAxis
                                                dataKey="date"
                                                stroke="#a5b4fc"
                                                tick={{ fill: '#a5b4fc' }}
                                                tickMargin={10}
                                            />
                                            <YAxis
                                                stroke="#a5b4fc"
                                                allowDecimals={false}
                                                tick={{ fill: '#a5b4fc' }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(79, 70, 229, 0.9)',
                                                    border: '1px solid #6366f1',
                                                    borderRadius: '8px',
                                                    color: 'white'
                                                }}
                                                itemStyle={{ color: 'white' }}
                                                labelStyle={{ color: 'white', fontWeight: 'bold' }}
                                                cursor={{ fill: 'rgba(99, 102, 241, 0.2)' }}
                                            />
                                            <Bar
                                                dataKey="clicks"
                                                fill="#818cf8"
                                                radius={[4, 4, 0, 0]}
                                                animationDuration={1500}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </>
                    ) : selectedUrl ? (
                        <div className="text-center py-12 bg-white/5 backdrop-blur-lg rounded-xl border border-indigo-500/30">
                            <h4 className="text-xl font-medium text-white mb-2">No analytics data available</h4>
                            <p className="text-indigo-300">This URL hasn't received any clicks yet.</p>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white/5 backdrop-blur-lg rounded-xl border border-indigo-500/30">
                            <h4 className="text-xl font-medium text-white mb-2">Select a URL to view analytics</h4>
                            <p className="text-indigo-300">Choose a shortened URL from the dropdown above to see detailed metrics.</p>
                        </div>
                    )}
                </div>
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
    subtitle
}: {
    icon: JSX.Element;
    title: string;
    value: string | number;
    subtitle: string;
}) => (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-indigo-500/30 hover:border-indigo-400/50 transition-all shadow-lg hover:shadow-xl">
        <div className="flex items-center mb-3">
            <div className="p-2 rounded-lg bg-indigo-900/40 mr-3">
                {icon}
            </div>
            <div>
                <h4 className="text-lg font-medium text-white">{title}</h4>
                <p className="text-xs text-indigo-300">{subtitle}</p>
            </div>
        </div>
        <p className="text-2xl font-bold text-white mt-2">{value}</p>
    </div>
);

export default Analytics;