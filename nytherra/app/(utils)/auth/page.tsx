'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import isUserLoggedIn from './checkAuth';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function AuthPage() {//Please verify your email first
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const [otpSent, setOtpSent] = useState(false);
  const [userOtp, setUserOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  // 1. Send OTP
  const handleSendOtp = async () => {
    setError(''); setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' },
      });
      const body = await res.json();
      console.log("handleSendOtp: ", body);

      if (res.ok) {
        setOtpSent(true);
      } else {
        setError(body.message || 'Failed to send OTP');
      }
    } catch {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async () => {
    setError(''); setIsLoading(true);
    try {
      console.log('Verifying OTP payload:', { email, otp: userOtp });
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp: userOtp }),
        headers: { 'Content-Type': 'application/json' },
      });
      const body = await res.json();
      console.log("handleVerifyOtp:", body.data.verified);

      if (res.ok && body.data.verified) {
        setOtpVerified(true);
      } else {
        setError(body.message || 'Invalid OTP');
      }
    } catch {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isUserLoggedIn()) { return; }
    window.location.href = '/';
  }, [])
  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    if (!otpVerified && !isSignIn) {
      setError('Please verify your email first');
      return;
    }
    // Form validation
    if (!email || !password) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (!isSignIn && password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`./api/auth/${!isSignIn ? "signup" : 'login'}`, {
        method: 'POST',
        body:
          !isSignIn ? JSON.stringify({
            'username': name,
            'email': email,
            'password': password,
          })
            :
            JSON.stringify({
              'email': email,
              'password': password
            }),
        headers: {
          "Content-Type": "application/json"
        }
      });
      let result = null;
      try {
        result = await res.json();
        console.log("nytherra result:", result);
      } catch (error) {
        console.log("nytherra result error:", (error as Error).message);
      }

      if (result.status == 'ok') {
        // localStorage.setItem('user', JSON.stringify(result.data.user));
        localStorage.setItem('token', result.data?.token);
        window.location.href = '/';
      }
      setError(result.data?.error);
    } catch (err) {
      setError('Authentication failed. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignIn(!isSignIn);
    setError('');
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-black via-indigo-900 to-purple-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link href="/">
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
                Nytherra
              </h1>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white/10 backdrop-blur-md shadow-xl rounded-2xl p-8 border border-indigo-500">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {isSignIn ? 'Sign in to your account' : 'Create your account'}
            </h2>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isSignIn && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-indigo-200 mb-1">
                    User Name (must be unique)
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    maxLength={20}
                    className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="Enter your name"
                  />
                </div>
              )}

              {/* Email + OTP */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-indigo-200 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="you@example.com"
                />

                {!isSignIn && (
                  <div className="mt-3 space-y-2">
                    {!otpSent && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={!email || isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg transition"
                      >
                        {isLoading ? 'Sending OTP…' : 'Send OTP'}
                      </button>
                    )}

                    {otpSent && !otpVerified && (
                      <>
                        <input
                          type="text"
                          value={userOtp}
                          onChange={e => setUserOtp(e.target.value)}
                          placeholder="Enter OTP"
                          className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={!userOtp || isLoading}
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg transition"
                        >
                          {isLoading ? 'Verifying…' : 'Verify OTP'}
                        </button>
                      </>
                    )}

                    {otpVerified && (
                      <div className="text-green-400 font-medium">
                        Email verified ✅
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-sm font-medium text-indigo-200 mb-1">
                    Password
                  </label>
                  {/*
                  {isSignIn && (
                    <Link href="/forgot-password" className="text-sm text-indigo-300 hover:text-white">
                      Forgot password?
                    </Link>
                  )}
                    */}
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={4}
                  maxLength={10}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="••••••••"
                />
              </div>

              {!isSignIn && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-indigo-200 mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={4}
                    maxLength={10}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    placeholder="••••••••"
                  />
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || (!isSignIn && !otpVerified)}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  isSignIn ? 'Sign in' : 'Create account'
                )}
              </button>
            </form>

            {/* Toggle */}
            <div className="mt-6 text-center">
              <p className="text-sm text-indigo-200">
                {isSignIn ? "Don't have an account?" : "Already have an account?"}{' '}
                <button onClick={toggleMode} className="text-indigo-300 hover:text-white font-medium">
                  {isSignIn ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>

          {/* Terms Sign in to your account*/}
          <div className="mt-6 text-center text-xs text-indigo-200/70">
            By signing up, you agree to our{' '}
            <Link href="/" className="text-indigo-300 hover:text-white">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/" className="text-indigo-300 hover:text-white">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}