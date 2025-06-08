'use client';
import { useState } from 'react';
import isUserLoggedIn from '../auth/checkAuth';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Link from 'next/link';

interface Resp {
    message: string;
    redirectUrl: string;
    shortUrl: string;
}

const trimUrl = () => {
    const [url, setUrl] = useState('');
    const [customId, setCustomId] = useState('');
    const [dataResp, setDataResp] = useState<Resp | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setCopied(false);
        const token = localStorage.getItem('token');

        if (!isUserLoggedIn() || !token) {
            window.location.href = '/auth';
            return;
        }

        try {
            const res = await fetch('./api/secure/trimurl', {
                method: 'POST',
                body: JSON.stringify({
                    redirectUrl: url,
                    ...(customId && { customId })
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await res.json();
            console.log(result);

            // if (!res.ok) throw new Error(result?.message || 'Something went wrong');
            if (result.data?.error) {
                setError(result.data.error);
                return;
            }
            setDataResp(result.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (dataResp?.shortUrl) {
            await navigator.clipboard.writeText(dataResp.shortUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (<>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-black via-indigo-900 to-purple-950 flex items-center justify-center px-4 py-12">
            <div className="bg-white/10 backdrop-blur-md shadow-2xl rounded-3xl p-8 w-full max-w-xl border border-indigo-500 text-white">
                <h1 className="text-3xl font-bold text-center mb-6">🔮 Nytherra URL Shortener</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-medium mb-1">Long URL</label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                            placeholder="https://example.com/your-long-url"
                            className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Custom ID (optional)</label>
                        <input
                            type="text"
                            value={customId}
                            onChange={(e) => setCustomId(e.target.value)}
                            placeholder="e.g. my-awesome-link"
                            className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3 px-6 rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50"
                    >
                        {loading ? '⏳ Shortening...' : '🔗 Shorten URL'}
                    </button>
                </form>

                {error && (
                    <p className="mt-4 text-sm text-red-300 text-center">{error}</p>
                )}

                {dataResp && (
                    <div className="mt-8 p-4 bg-white/10 border border-indigo-400 rounded-xl animate-fade-in space-y-2">
                        <p className="text-lg font-semibold text-green-300">{dataResp.message}</p>

                        <div className="text-sm space-y-1">
                            <p>
                                <span className="font-medium">Original URL:</span>{' '}
                                <Link href={dataResp.redirectUrl} className="text-blue-200 underline" target="_blank">
                                    {dataResp.redirectUrl}
                                </Link>
                            </p>

                            <div className="flex items-center gap-2">
                                <span className="font-medium">Short URL:</span>
                                <a
                                    href={dataResp.shortUrl}
                                    target="_blank"
                                    className="text-purple-300 underline break-all"
                                >
                                    {dataResp.shortUrl}
                                </a>
                                <button
                                    onClick={handleCopy}
                                    className="ml-2 bg-indigo-500 hover:bg-indigo-600 text-sm px-3 py-1 rounded-lg text-white transition"
                                >
                                    {copied ? '✅ Copied!' : '📋 Copy'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        <Footer />
    </>
    );
};

export default trimUrl;
