'use client';
import { useState, useEffect } from 'react';
import isUserLoggedIn from '../auth/checkAuth';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

interface QRCodeResponse {
    data: {
        status: string;
        type: string;
        data: string;
        message?: string;
    }
}

const QrCode = () => {
    const [url, setUrl] = useState('');
    const [qrCodeData, setQrCodeData] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [colorDark, setColorDark] = useState('#000000');
    const [colorLight, setColorLight] = useState('#ffffff');
    const [errorMessage, setErrorMessage] = useState('');
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        if (!isUserLoggedIn()) {
            window.location.href = '/auth';
        }
    }, []);

    const generateQRCode = async () => {
        if (!url.trim()) {
            setErrorMessage('Please enter a URL');
            return;
        }
        // if(!url.startsWith('https://')){
        //     setErrorMessage('Please enter a valid URL');
        //     return;
        // }

        setIsGenerating(true);
        setErrorMessage('');
        setCopySuccess(false);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/secure/generateQr', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({
                    url: url,
                    color: {
                        dark: colorDark,
                        light: colorLight
                    }
                })
            });

            if (!res.ok) {
                throw new Error(`Server responded with ${res.status}`);
            }

            const responseData: QRCodeResponse = await res.json();
            console.log("QR response:", responseData);

            if (responseData.data.status === 'ok' && responseData.data) {
                if (responseData.data.type === 'img') {
                    // Handle image data
                    setQrCodeData(responseData.data.data);
                }
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error("Failed to generate QR code:", error);
            setErrorMessage(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isUserLoggedIn()) {
            window.location.href = '/auth';
            return;
        }
        generateQRCode();
    };

    const handleCopyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(qrCodeData);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
            setErrorMessage('Failed to copy to clipboard');
        }
    };

    return (
        <><Header />
            <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
                <div className="bg-white/10 backdrop-blur-lg shadow-xl rounded-2xl p-8 max-w-xl w-full border border-indigo-400/30">
                    <div className="flex items-center justify-center mb-6">
                        <div className="bg-indigo-600/20 p-3 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-2 text-center tracking-wide">
                        Nytherra QR Generator
                    </h1>
                    <p className="text-indigo-200 text-center mb-6">
                        Create customized QR codes for your links and content
                    </p>

                    {errorMessage && (
                        <div className="bg-red-500/20 border border-red-500 text-white p-3 rounded-lg mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-white text-sm font-medium flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                Enter URL or text:
                            </label>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com or any text"
                                required
                                className="p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-indigo-400/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                            />
                        </div>

                        <div className="flex items-center gap-2 text-white">
                            <button
                                type="button"
                                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                                className="text-indigo-300 hover:text-indigo-100 flex items-center gap-2 text-sm focus:outline-none transition-colors"
                            >
                                <span className="w-5 h-5 flex items-center justify-center border border-indigo-400/50 rounded-full text-xs">
                                    {showAdvancedOptions ? '−' : '+'}
                                </span>
                                Advanced Options
                            </button>
                        </div>

                        {showAdvancedOptions && (
                            <div className="bg-indigo-900/30 p-4 rounded-lg border border-indigo-500/30">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-white text-sm font-medium">QR Code Color:</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={colorDark}
                                                onChange={(e) => setColorDark(e.target.value)}
                                                className="w-8 h-8 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={colorDark}
                                                onChange={(e) => setColorDark(e.target.value)}
                                                className="bg-white/20 text-white text-xs p-1 px-2 rounded border border-white/30 w-20"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-white text-sm font-medium">Background Color:</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={colorLight}
                                                onChange={(e) => setColorLight(e.target.value)}
                                                className="w-8 h-8 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={colorLight}
                                                onChange={(e) => setColorLight(e.target.value)}
                                                className="bg-white/20 text-white text-xs p-1 px-2 rounded border border-white/30 w-20"
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}

                        <button
                            type="submit"
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 px-4 rounded-lg font-semibold shadow-lg transition-all flex items-center justify-center mt-2"
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Generate QR Code
                                </span>
                            )}
                        </button>
                    </form>

                    {qrCodeData && (
                        <div className="mt-6 flex flex-col items-center border-t border-indigo-500/30 pt-6">
                            <div className="bg-white p-4 rounded-lg shadow-lg">
                                <img
                                    src={qrCodeData}
                                    alt="Generated QR Code"
                                    className="w-64 h-64 object-contain"
                                />
                            </div>
                            <div className="mt-4 flex flex-wrap gap-3 justify-center">
                                <a
                                    href={qrCodeData}
                                    download={'generatedQr'}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded text-sm font-medium transition flex items-center gap-1 shadow-md"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download
                                </a>
                                <button
                                    onClick={handleCopyToClipboard}
                                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded text-sm font-medium transition flex items-center gap-1 shadow-md"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    {copySuccess ? 'Copied!' : 'Copy URL'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default QrCode;