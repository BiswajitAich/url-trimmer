import Image from "next/image";
import User from "./User";
import Link from "next/link";


const Header = () => {
    return (
        <header className="bg-gradient-to-r from-black to-purple-900 drop-shadow-xl">
            <div className="container mx-auto flex items-center justify-between py-4 px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center space-x-4">
                    <div className="logo-image">
                        <Image
                            src="/image_logo.png"
                            alt="Nytherra Logo"
                            width={70}
                            height={70}
                            className="rounded-md"
                            priority
                        />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300 transition-all duration-300 hover:from-indigo-300 hover:to-purple-400">
                            Nytherra
                        </h1>
                        <p className="flex-1 flex items-center justify-end space-x-6 sm:flex sm:space-x-6">
                            Where the Web Awakens
                        </p>
                    </div>
                </Link>
                <div className="absolute right-2 top-2"> <User /> </div>
            </div>
            <style jsx>{`
                @media (max-width: 300px) {
                    .logo-image {
                        display: none;
                    }
                }
            `}</style>
        </header>
    );
};

export default Header;

