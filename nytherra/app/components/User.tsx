"use client";

import { CircleUserRound, LogIn, LogOut, X } from "lucide-react";
import { useEffect, useState } from "react";

const User = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/check', {
                    method: 'GET',
                    credentials: 'include' 
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setIsLoggedIn(data.authenticated);
                } else {
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error("Error checking auth status:", error);
                setIsLoggedIn(false);
            } finally {
                setIsLoading(false);
            }
        };
        
        checkAuth();
    }, []);

    const toggleDisplay = () => {
        setIsOpen(prev => !prev);
    };

    const handleLogOut = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include' 
            });
            
            if (response.ok) {
                setIsLoggedIn(false);
                setIsOpen(false);
                window.location.href = '/';
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    const handleSignIn = () => {
        window.location.href = "/auth";
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={toggleDisplay}
                className="focus:outline-none cursor-pointer p-2 rounded-full hover:bg-purple-900/40 transition-colors duration-200"
                aria-label={isOpen ? "Close user menu" : "Open user menu"}
            >
                {isOpen ? (
                    <X className="h-8 w-8 text-purple-300 transition-colors duration-200" />
                ) : (
                    <CircleUserRound className="h-8 w-8 text-purple-300 transition-colors duration-200" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-12 bg-gradient-to-b from-purple-900 to-blue-900 shadow-lg rounded-lg p-4 w-56 border border-purple-500 animate-fadeIn z-10">
                    {isLoading ? (
                        <div className="text-gray-300 text-center flex items-center justify-center py-2">
                            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                            loading...
                        </div>
                    ) : isLoggedIn ? (
                        <div className="flex flex-col items-center space-y-3">
                            <p className="font-semibold text-purple-200">Welcome back!</p>
                            <button
                                onClick={handleLogOut}
                                className="flex items-center space-x-2 px-4 py-2 bg-purple-800/50 hover:bg-purple-700 rounded-md transition-colors duration-200 w-full justify-center"
                            >
                                <LogOut className="h-5 w-5 text-purple-200" />
                                <span className="text-purple-100">Sign Out</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-3">
                            <p className="font-semibold text-purple-200">Guest User</p>
                            <button
                                onClick={handleSignIn}
                                className="flex items-center space-x-2 px-4 py-2 bg-purple-800/50 hover:bg-purple-700 rounded-md transition-colors duration-200 w-full justify-center"
                            >
                                <LogIn className="h-5 w-5 text-purple-200" />
                                <span className="text-purple-100">Sign In</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default User;