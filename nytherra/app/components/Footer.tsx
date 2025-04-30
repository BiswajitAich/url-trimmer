import { Github, Linkedin, Mail, Star } from "lucide-react";
import Link from "next/link";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full py-10 px-6 bg-gradient-to-r from-black to-purple-900 text-indigo-200">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-bettrimn items-center gap-6">
                    <div className="text-center md:text-left">
                        <div className="mb-2">
                            <span className="text-indigo-300 font-semibold text-lg">Nytherra</span>
                            <span className="text-indigo-200/70"> © {currentYear}</span>
                        </div>
                        <p className="text-sm text-indigo-200/60">
                            Simple tools for a complex web
                        </p>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-4">


                        <div className="flex gap-6 mt-2">
                            <Link
                                href="https://www.linkedin.com/in/biswajitaich"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-indigo-300 hover:text-white transition-colors group"
                                aria-label="LinkedIn Profile"
                            >
                                <span className="text-sm">LinkedIn</span>
                                <Linkedin className="h-5 w-5 group-hover:text-blue-400 transition-colors" />
                            </Link>

                            <Link
                                href="https://github.com/BiswajitAich"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-indigo-300 hover:text-white transition-colors group"
                                aria-label="GitHub"
                            >
                                <span className="text-sm flex items-center">Star on <Github className="h-5 w-5 ml-1 group-hover:text-gray-300 transition-colors" /></span>
                                <Star className="h-4 w-4 text-amber-300 group-hover:text-amber-200 transition-colors" />
                            </Link>
                            <Link
                                href="mailto:biswajitaichofficial@gmail.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-indigo-300 hover:text-white transition-colors group"
                                aria-label="gmail"
                            >
                                <span className="text-sm flex items-center"> email us <Mail className="h-5 w-5 ml-1 group-hover:text-gray-300 transition-colors" /></span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;