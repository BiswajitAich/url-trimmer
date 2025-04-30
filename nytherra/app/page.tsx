'use client';
import Link from "next/link";
import { useState } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { ChartNoAxesCombined, Link as LinkIcon, QrCode } from "lucide-react";

interface Features {
  id: string,
  title?: string,
  description?: string,
  icon?: React.ElementType,
  path: string,
  color?: string,
  hoverColor?: string
}
export default function Home() {
  const [hoverCard, setHoverCard] = useState<any>(null);

  const features: Features[] = [
    {
      id: "url",
      title: "URL Shortener",
      description: "Transform long URLs into concise, shareable links instantly.",
      icon: LinkIcon,
      path: "./trimurl",
      color: "from-purple-600 to-indigo-600",
      hoverColor: "from-purple-500 to-indigo-500"
    },
    {
      id: "qr",
      title: "QR Code Generator",
      description: "Create custom QR codes for any content with personalized colors.",
      icon: QrCode,
      path: "./qrcode",
      color: "from-indigo-600 to-blue-600",
      hoverColor: "from-indigo-500 to-blue-500"
    },
    {
      id: "analytics",
      title: "Analytics of your short url",
      description: "Analyse the short url live.",
      icon: ChartNoAxesCombined,
      path: "./analytics",
      color: "from-indigo-600 to-blue-600",
      hoverColor: "from-indigo-500 to-blue-500"
    }
    // {
    //   id: "chatWithUrl",
    //   title: "Chat with url",
    //   description: "Upload url to chat on the url context.",
    //   icon: "💬",
    //   path: "./chatWithUrl",
    //   color: "from-indigo-600 to-blue-600",
    //   hoverColor: "from-indigo-500 to-blue-500"
    // }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-indigo-900 to-purple-950">
      <Header />

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Web Utilities <span className="text-indigo-400">Simplified</span>
            </h2>
            <p className="text-lg text-indigo-200 max-w-2xl mx-auto">
              Streamline your digital experience with our suite of powerful web tools.
              Create shortened URLs and dynamic QR codes in seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {features.map((feature) => (
              <Link
                href={feature.path}
                key={feature.id}
                onMouseEnter={() => setHoverCard(feature.id)}
                onMouseLeave={() => setHoverCard(null)}
              >
                <div className={`
                  h-full bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-indigo-500/50
                  hover:bg-white/15 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20
                  hover:border-indigo-400 hover:scale-105 cursor-pointer
                `}>
                  {feature.icon && <feature.icon className={`
                    w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} mb-6
                    flex items-center justify-center text-2xl
                  `} />
                  }


                  <h3 className="text-2xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-indigo-200 mb-6">
                    {feature.description}
                  </p>

                  <div className={`
                    inline-flex items-center rounded-lg py-2 px-4 text-sm font-medium
                    bg-gradient-to-r ${hoverCard === feature.id ? feature.hoverColor : feature.color}
                    text-white transition-all duration-300
                  `}>
                    Try {feature.title} <span className="ml-2">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}