import React from "react";

// Tech Cards and Project Cards for visual punch
const TechCard = ({ title, icon, desc, accent }) => (
  <div className={`w-64 min-h-[160px] rounded-2xl border-4 p-6 m-2 spiderman-shadow flex flex-col items-center text-center ${accent}`}>
    <div className="text-5xl mb-3 drop-shadow-xl">{icon}</div>
    <h3 className="font-extrabold text-xl mb-2 uppercase tracking-tight">{title}</h3>
    <p className="text-base text-gray-100 leading-normal font-medium">{desc}</p>
  </div>
);

const ProjectCard = ({ title, color, desc, link }) => (
  <div className={`w-72 rounded-2xl ${color} p-6 m-2 spiderman-shadow flex flex-col items-center text-center`}>
    <h4 className="font-bold text-lg mb-3 uppercase tracking-wider">{title}</h4>
    <p className="text-base mb-4 text-gray-200">{desc}</p>
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className="font-bold text-white border-b-2 border-dashed border-blue-200 hover:text-red-300 transition-colors"
    >
      VIEW PROJECT
    </a>
  </div>
);

function App() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-red-900 to-blue-900 text-white font-sans relative overflow-x-hidden">
      {/* Optional Spiderman Web Overlay (you can use any semi-transparent PNG web) */}
      {/* <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: "url('https://i.ibb.co/BPsmsCq/spiderman-web.png') repeat", opacity: 0.18 }} /> */}
      {/* Main Markee/Header */}
      <header className="w-full py-12 flex flex-col items-center justify-center relative z-10">
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
          <marquee
            behavior="scroll"
            direction="left"
            className="text-5xl font-extrabold text-red-400 py-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] tracking-wide uppercase"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            Rahul Tiwari | Spider-Coder | Blockchain Engineer | President IAS | CSE @ BU | Creative Developer
          </marquee>
          <p className="text-xl text-blue-200 mt-3 px-8 text-center">
            "With great power comes great creativity." — CSE, Blockchain, Web3 & Spidey-inspired innovation!
          </p>
          <div className="flex space-x-10 mt-6">
            <a href="https://www.linkedin.com/in/rahul-tiwari-0280a2244" target="_blank" rel="noreferrer" className="text-red-400 border-b-2 border-red-500 hover:text-blue-400 font-bold text-lg">LinkedIn</a>
            <a href="https://github.com/RahulTiwari293/" target="_blank" rel="noreferrer" className="text-blue-400 border-b-2 border-red-500 hover:text-red-400 font-bold text-lg">GitHub</a>
            <a href="mailto:rahul.tiwari@example.com" className="text-white border-b-2 border-blue-500 hover:text-red-400 font-bold text-lg">Email</a>
          </div>
        </div>
      </header>

      {/* About Section */}
      <section className="w-full max-w-5xl mx-auto bg-opacity-80 bg-black py-10 px-8 rounded-3xl shadow-xl z-10 mt-8 relative backdrop-blur-md border-4 border-blue-800">
        <h2 className="text-4xl text-red-400 font-bold mb-3 text-center">Who Am I?</h2>
        <div className="text-lg leading-loose text-gray-300 text-center">
          <p>
            Hey! I'm <span className="text-red-500 font-bold">Rahul Tiwari</span>, aka the <span className="font-bold text-blue-400">Spider-Coder</span>.<br />
            President at IAS, blockchain developer, and CSE undergrad at Bennett University. I thrive on web tech, algorithms, and bringing Spidey-level energy to every challenge!
          </p>
        </div>
      </section>

      {/* Tech Creatives */}
      <section className="w-full max-w-6xl mx-auto flex flex-wrap gap-8 justify-center my-14 z-10 relative">
        <TechCard
          title="Blockchain & Web3"
          accent="bg-red-700 border-blue-500"
          icon="🕷️"
          desc="Solidity, Hardhat, Ethers.js, decentralized storage, MetaMask, and robust smart contract development."
        />
        <TechCard
          title="React & Modern UI"
          accent="bg-blue-700 border-red-600"
          icon="🕸️"
          desc="Building fast and stylish interfaces with React, Vite, and Tailwind. Web3 wallet integration for a seamless UX."
        />
        <TechCard
          title="Decentralized Cloud"
          accent="bg-gradient-to-r from-blue-900 to-pink-900 border-yellow-400"
          icon="📂"
          desc="Cloud-like apps with encrypted, distributed data—no centralized servers, just secure peer networks."
        />
        <TechCard
          title="Testing & Security"
          accent="bg-black border-red-500"
          icon="🛡️"
          desc="Hardhat test automation, contract audit, pinata/IPFS for safe, performant decentralized apps."
        />
        <TechCard
          title="Teamwork & Leadership"
          accent="bg-gradient-to-r from-red-900 to-blue-900 border-purple-400"
          icon="🚀"
          desc="President, International Affairs Society — collaboration, team mentoring, and agile project management."
        />
      </section>

      {/* Projects Marquee */}
      <section className="w-full my-10 py-6 bg-black bg-opacity-90 rounded-xl shadow-2xl z-10 relative">
        <marquee behavior="alternate" className="text-2xl text-white font-bold tracking-widest">
          FEATURED PROJECTS: DECENTRALIZED GOOGLE DRIVE • SWAROJGAR DRAFT • BLOCKCHAIN SMART CONTRACTS
        </marquee>
        <div className="flex flex-wrap justify-center mt-8 gap-7">
          <ProjectCard
            title="Decentralized Google Drive"
            color="bg-[#be3144] border-2 border-blue-400"
            desc={
              <>
                A decentralized file storage DApp: files are split, encrypted, and distributed across multiple blockchain nodes.
                Built with <b>Solidity</b>, <b>Hardhat</b>, <b>Ethers.js</b>, and <b>React</b>. Integrates MetaMask for wallet connectivity.
              </>
            }
            link="https://github.com/RahulTiwari293/Decentralized-Google-Drive"
          />
          <ProjectCard
            title="Swarojgar Draft 1"
            color="bg-[#21325e] border-2 border-red-400"
            desc="Draft and prototype for an employment/self-reliance platform. Technologies and vision in early development."
            link="https://github.com/RahulTiwari293/swarojgardraft1"
          />
          <ProjectCard
            title="Algorithm City"
            color="bg-gradient-to-r from-[#3a4750] to-[#303841] border-2 border-yellow-400"
            desc="C++/Python DSA, debugging, and competitive programming for efficient, optimized solutions."
            link="https://github.com/yourusername/algorithms"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full text-center text-gray-300 bg-black bg-opacity-80 py-6 mt-10">
        <div>
          <span className="inline-block align-middle mr-2 text-2xl">🕷️</span>
          RAHUL TIWARI • 2025 • Made with React, Tailwind, Spidey Spirit
        </div>
      </footer>

      {/* Spidey comic shadow style */}
      <style>{`
        .spiderman-shadow { box-shadow: 0 4px 45px 0 rgba(217,0,0,0.3), 0 1.5px 1.5px 0 rgba(8,28,180,0.15); }
      `}</style>
    </div>
  );
}
export default App;
