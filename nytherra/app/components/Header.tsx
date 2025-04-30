"use client";

import Image from "next/image";
import User from "./User";
import Link from "next/link";


const Header = () => {
    return (
        <header className="py-4 px-8 bg-linear-to-r from-black to-purple-900 drop-shadow-xl">
            <div className="max-w-6xl mx-auto flex items-center justify-bettrimn relative">
                <Link href="/" className="flex items-center space-x-4">
                    <Image
                        src="/image_logo.png"
                        alt="Nytherra Logo"
                        width={70}
                        height={70}
                        className="rounded-md"
                        priority
                    />
                    <div className="flex flex-col">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300 transition-all duration-300 group-hover:from-indigo-300 group-hover:to-purple-400">
                            Nytherra
                        </h1>
                        <p className="text-xs md:text-sm text-gray-400 font-medium tracking-wide">
                            Where the Web Awakens
                        </p>
                    </div>
                </Link>
                <div className="absolute right-2 top-2"> <User /> </div>
            </div>
        </header>
    );
};

export default Header;
