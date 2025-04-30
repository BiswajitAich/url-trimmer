'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import isUserLoggedIn from './checkAuth';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  useEffect(() => {
    if (!isUserLoggedIn()) { return; }
    window.location.href = '/';
  }, [])
  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

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
          {/* Logo and Nav */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
                Nytherra
              </h1>
            </Link>
          </div>

          {/* Auth Card */}
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
                    name="name"
                    type="text"
                    value={name}
                    maxLength={20}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                    placeholder="Enter Your name"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-indigo-200 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  maxLength={50}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-bettrimn">
                  <label htmlFor="password" className="block text-sm font-medium text-indigo-200 mb-1">
                    Password
                  </label>
                  {isSignIn && (
                    <Link href="/forgot-password" className="text-sm text-indigo-300 hover:text-white transition">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={4}
                  maxLength={10}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
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
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={4}
                    maxLength={10}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 px-4 rounded-lg font-semibold shadow-md transition-all flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    isSignIn ? 'Sign in' : 'Create account'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-indigo-200">
                {isSignIn ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={toggleMode}
                  className="text-indigo-300 hover:text-white font-medium transition"
                >
                  {isSignIn ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            {/* {isSignIn && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-indigo-500/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-indigo-900/50 text-indigo-300">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="w-full flex justify-center py-2 px-4 border border-indigo-500/30 rounded-md shadow-sm bg-white/5 text-sm font-medium text-white hover:bg-white/10 transition"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
                  </svg>
                </button>

                <button
                  type="button"
                  className="w-full flex justify-center py-2 px-4 border border-indigo-500/30 rounded-md shadow-sm bg-white/5 text-sm font-medium text-white hover:bg-white/10 transition"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M13.5 1A1.5 1.5 0 0012 2.5V15a1.5 1.5 0 001.5 1.5h7A1.5 1.5 0 0022 15V4.5A1.5 1.5 0 0020.5 3h-5.379a1.5 1.5 0 00-1.06.44L13.5 4z"></path>
                    <path d="M2 4.5A1.5 1.5 0 013.5 3h5.379a1.5 1.5 0 011.06.44L10.5 4 9.939 3.44a1.5 1.5 0 00-1.06-.44H3.5A1.5 1.5 0 002 4.5v10.15l3.372-3.372a.75.75 0 011.061 0l.203.203a.75.75 0 001.06 0l4.244-4.243a.75.75 0 011.06 0l6 6V4.5A1.5 1.5 0 0017.5 3h-5.379a1.5 1.5 0 00-1.06.44L10.5 4l-.561-.56a1.5 1.5 0 00-1.06-.44H3.5A1.5 1.5 0 002 4.5v6.879l3.372-3.372a.75.75 0 011.061 0l.203.203a.75.75 0 001.06 0l4.244-4.243a.75.75 0 011.06 0l6 6v2.121l-6-6a.75.75 0 00-1.06 0l-4.244 4.243a.75.75 0 01-1.06 0l-.203-.203a.75.75 0 00-1.061 0L2 13.621V15a1.5 1.5 0 001.5 1.5h2.25a.75.75 0 110 1.5H3.5A3 3 0 01.5 15V4.5A3 3 0 013.5 2h5.25a3 3 0 012.122.879L11.5 3.5l.628-.628A3 3 0 0114.25 2h5.25a3 3 0 013 3V15a3 3 0 01-3 3h-3.75a.75.75 0 010-1.5h3.75A1.5 1.5 0 0020.5 15V7.621l-5.5-5.5V15a1.5 1.5 0 001.5 1.5H17a.75.75 0 110 1.5h-.75A3 3 0 0113.5 15V4.5c0-.385.056-.758.16-1.109a3 3 0 01-.16-1.391V2z"></path>
                  </svg>
                </button>
              </div>
            </div>
          )} */}
          </div>

          {/* Terms */}
          <div className="mt-6 text-center text-xs text-indigo-200/70">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-indigo-300 hover:text-white transition">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-indigo-300 hover:text-white transition">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}