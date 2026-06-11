import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import "./App.css";

// ─── Constellation Canvas ────────────────────────────────────────────────────
const ConstellationCanvas = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animRef = useRef(null);
  const starsRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const STAR_COUNT = Math.min(200, Math.floor((W * H) / 6000));
    const CONNECT_DIST = 130;
    const MOUSE_DIST = 180;

    // Build stars
    starsRef.current = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.8 + 0.4,
      opacity: Math.random() * 0.7 + 0.2,
      twinkleSpeed: Math.random() * 0.015 + 0.004,
      twinkleDir: Math.random() > 0.5 ? 1 : -1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const mouse = mouseRef.current;
      const stars = starsRef.current;

      // Update stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.opacity += s.twinkleSpeed * s.twinkleDir;
        if (s.opacity >= 0.95 || s.opacity <= 0.08) s.twinkleDir *= -1;
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = W;
        if (s.x > W) s.x = 0;
        if (s.y < 0) s.y = H;
        if (s.y > H) s.y = 0;

        // Draw star glow
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3);
        grd.addColorStop(0, `rgba(200, 220, 255, ${s.opacity})`);
        grd.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Draw star core
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230, 240, 255, ${s.opacity})`;
        ctx.fill();
      }

      // Draw star-to-star lines
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.35;
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = `rgba(147, 197, 253, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Mouse constellation lines
        const dx = stars[i].x - mouse.x;
        const dy = stars[i].y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_DIST) {
          const alpha = (1 - dist / MOUSE_DIST) * 0.85;
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          // Purple-to-blue gradient line
          const lineGrd = ctx.createLinearGradient(
            stars[i].x, stars[i].y, mouse.x, mouse.y
          );
          lineGrd.addColorStop(0, `rgba(167, 139, 250, ${alpha})`);
          lineGrd.addColorStop(1, `rgba(96, 165, 250, ${alpha * 0.5})`);
          ctx.strokeStyle = lineGrd;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }

      // Mouse glow dot
      if (mouse.x > -1000) {
        const mgrd = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, 60
        );
        mgrd.addColorStop(0, "rgba(139, 92, 246, 0.25)");
        mgrd.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 60, 0, Math.PI * 2);
        ctx.fillStyle = mgrd;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    const onMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
};

// ─── Typewriter hook ─────────────────────────────────────────────────────────
const useTypewriter = (texts, speed = 75, pauseMs = 1800) => {
  const [displayed, setDisplayed] = useState("");
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (paused) return;
    const current = texts[textIdx];

    timerRef.current = setTimeout(() => {
      if (!deleting) {
        const next = charIdx + 1;
        setDisplayed(current.slice(0, next));
        setCharIdx(next);
        if (next === current.length) {
          setPaused(true);
          setTimeout(() => {
            setPaused(false);
            setDeleting(true);
          }, pauseMs);
        }
      } else {
        const next = Math.max(0, charIdx - 1);
        setDisplayed(current.slice(0, next));
        setCharIdx(next);
        if (next === 0) {
          setDeleting(false);
          setTextIdx((i) => (i + 1) % texts.length);
        }
      }
    }, deleting ? speed * 0.45 : speed);

    return () => clearTimeout(timerRef.current);
  }, [charIdx, deleting, textIdx, texts, speed, pauseMs, paused]);

  return displayed;
};

// ─── Section Heading ──────────────────────────────────────────────────────────
const SectionHeading = ({ eyebrow, title }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.65 }}
    viewport={{ once: true }}
    className="text-center mb-16"
  >
    <p className="text-violet-400 text-xs font-semibold uppercase tracking-[0.35em] mb-3">
      ✦ {eyebrow} ✦
    </p>
    <h2 className="text-4xl md:text-5xl font-black text-white">{title}</h2>
    <div className="mt-5 mx-auto w-20 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
  </motion.div>
);

// ─── Star Node (Skill) ────────────────────────────────────────────────────────
const StarNode = ({ icon, title, desc, delay, accent }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.6, y: 30 }}
    whileInView={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ delay, duration: 0.55, type: "spring", bounce: 0.35 }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.06, y: -6, transition: { duration: 0.2 } }}
    className="group relative w-60"
  >
    {/* Glow bg */}
    <div
      className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${accent.glow}`}
    />
    <div
      className={`
        relative rounded-2xl border border-white/10 p-6
        bg-gradient-to-br ${accent.bg}
        backdrop-blur-sm
        shadow-[0_4px_30px_rgba(0,0,0,0.4)]
        group-hover:border-white/20
        transition-all duration-400
        flex flex-col items-center text-center gap-3
      `}
    >
      {/* Pulsing star dot */}
      <div
        className={`w-2 h-2 rounded-full ${accent.dot} star-pulse`}
        style={{ animationDelay: `${delay}s` }}
      />
      <div className="text-4xl mt-1">{icon}</div>
      <h3 className="text-white font-bold text-sm uppercase tracking-widest leading-tight">
        {title}
      </h3>
      <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

// ─── Project Card ─────────────────────────────────────────────────────────────
const ProjectCard = ({ title, desc, link, tags, delay, accent }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.65 }}
    viewport={{ once: true }}
    whileHover={{ y: -10, transition: { duration: 0.25 } }}
    className="group relative w-80"
  >
    {/* Halo */}
    <div
      className={`absolute inset-0 rounded-2xl blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-600 ${accent.glow}`}
    />
    <div
      className={`
        relative rounded-2xl border border-white/10 overflow-hidden
        bg-gradient-to-br ${accent.bg}
        shadow-[0_8px_40px_rgba(0,0,0,0.5)]
        group-hover:border-white/20
        transition-all duration-400
      `}
    >
      {/* Top gradient bar */}
      <div className={`h-0.5 w-full ${accent.bar}`} />

      <div className="p-7 flex flex-col gap-4">
        {/* Constellation dots */}
        <div className="flex items-center gap-1.5">
          {[0, 0.2, 0.4].map((d, i) => (
            <div
              key={i}
              className={`rounded-full ${accent.dot} star-pulse`}
              style={{ width: i === 1 ? "8px" : "5px", height: i === 1 ? "8px" : "5px", animationDelay: `${d}s` }}
            />
          ))}
        </div>

        <h4 className="text-white font-bold text-base tracking-wide leading-snug">
          {title}
        </h4>
        <p className="text-white/55 text-sm leading-relaxed">{desc}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/8 text-white/60 border border-white/10"
            >
              {tag}
            </span>
          ))}
        </div>

        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className={`
            mt-1 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest
            ${accent.link}
            border ${accent.linkBorder}
            rounded-lg px-4 py-2 transition-all duration-300
            hover:bg-white/10 w-fit
          `}
        >
          View Project →
        </a>
      </div>
    </div>
  </motion.div>
);

// ─── Floating orb ─────────────────────────────────────────────────────────────
const Orb = ({ className }) => (
  <div className={`absolute rounded-full pointer-events-none ${className}`} />
);

// ─── Nav ──────────────────────────────────────────────────────────────────────
const navLinks = ["About", "Skills", "Projects", "Contact"];

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl bg-black/40 border-b border-white/8 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
          : "bg-transparent"
      }`}
    >
      <motion.span
        whileHover={{ scale: 1.05 }}
        className="text-violet-400 font-black text-lg tracking-widest cursor-default select-none"
      >
        ✦ RAHUL.DEV
      </motion.span>

      <div className="hidden md:flex gap-8">
        {navLinks.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            className="nav-link text-sm text-white/50 hover:text-white transition-colors duration-200 font-medium tracking-wide"
          >
            {link}
          </a>
        ))}
      </div>

      <a
        href="https://github.com/RahulTiwari293/"
        target="_blank"
        rel="noreferrer"
        className="
          px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest
          border border-violet-500/40 text-violet-300
          hover:bg-violet-500/15 hover:border-violet-400/70
          transition-all duration-300
        "
      >
        GitHub ↗
      </a>
    </motion.nav>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
const ROLES = [
  "Blockchain Engineer",
  "Web3 Developer",
  "React Developer",
  "President @ IAS",
  "Spider-Coder",
  "CSE @ Bennett University",
];

const SKILLS = [
  {
    icon: "⛓️",
    title: "Blockchain & Web3",
    desc: "Solidity, Hardhat, Ethers.js, OpenZeppelin, MetaMask — full DApp stack on EVM chains.",
    accent: {
      bg: "from-violet-950/80 to-purple-900/40",
      glow: "bg-violet-600",
      dot: "bg-violet-400",
    },
    delay: 0,
  },
  {
    icon: "⚛️",
    title: "React & Modern UI",
    desc: "React 19, Vite, Tailwind CSS, Framer Motion — fast, polished, animated interfaces.",
    accent: {
      bg: "from-blue-950/80 to-cyan-900/40",
      glow: "bg-blue-500",
      dot: "bg-blue-400",
    },
    delay: 0.1,
  },
  {
    icon: "📡",
    title: "Decentralized Cloud",
    desc: "IPFS, Pinata, distributed storage — trustless, censorship-resistant file systems.",
    accent: {
      bg: "from-indigo-950/80 to-blue-900/40",
      glow: "bg-indigo-500",
      dot: "bg-indigo-400",
    },
    delay: 0.2,
  },
  {
    icon: "🛡️",
    title: "Security & Testing",
    desc: "Smart contract auditing, Hardhat test suites, ReentrancyGuard, CEI patterns.",
    accent: {
      bg: "from-purple-950/80 to-pink-900/40",
      glow: "bg-purple-500",
      dot: "bg-purple-400",
    },
    delay: 0.3,
  },
  {
    icon: "🚀",
    title: "Leadership",
    desc: "President, International Affairs Society — mentoring, agile PM, cross-functional teams.",
    accent: {
      bg: "from-cyan-950/80 to-teal-900/40",
      glow: "bg-cyan-500",
      dot: "bg-cyan-400",
    },
    delay: 0.4,
  },
];

const PROJECTS = [
  {
    title: "Decentralized Google Drive",
    desc: "Files split, encrypted, and distributed across blockchain nodes. Zero central authority — full user ownership via MetaMask.",
    link: "https://github.com/RahulTiwari293/Decentralized-Google-Drive",
    tags: ["Solidity", "Hardhat", "Ethers.js", "React", "IPFS", "MetaMask"],
    accent: {
      bg: "from-violet-950/90 to-black/70",
      glow: "bg-violet-700",
      bar: "bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500",
      dot: "bg-violet-400",
      link: "text-violet-300 hover:text-white",
      linkBorder: "border-violet-500/30 hover:border-violet-400",
    },
    delay: 0,
  },
  {
    title: "Swarojgar Draft",
    desc: "Self-reliance platform prototype — connecting opportunity to individual, built with Web3 and a vision for employment equity.",
    link: "https://github.com/RahulTiwari293/swarojgardraft1",
    tags: ["Web3", "React", "Prototype", "Social Impact"],
    accent: {
      bg: "from-blue-950/90 to-black/70",
      glow: "bg-blue-700",
      bar: "bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500",
      dot: "bg-blue-400",
      link: "text-blue-300 hover:text-white",
      linkBorder: "border-blue-500/30 hover:border-blue-400",
    },
    delay: 0.12,
  },
  {
    title: "Mutual Fund DApp",
    desc: "Reward-per-share accumulator — O(1) gas-optimized distribution on Ethereum Sepolia, no loops, ReentrancyGuard secured.",
    link: "https://github.com/RahulTiwari293/",
    tags: ["Solidity", "OpenZeppelin", "Hardhat", "Sepolia", "ERC-20"],
    accent: {
      bg: "from-indigo-950/90 to-black/70",
      glow: "bg-indigo-700",
      bar: "bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500",
      dot: "bg-indigo-400",
      link: "text-indigo-300 hover:text-white",
      linkBorder: "border-indigo-500/30 hover:border-indigo-400",
    },
    delay: 0.24,
  },
  {
    title: "Algorithm City",
    desc: "DSA challenges and competitive programming in C++ / Python — optimized data structures and solutions at scale.",
    link: "https://github.com/RahulTiwari293/",
    tags: ["C++", "Python", "DSA", "Competitive Programming"],
    accent: {
      bg: "from-cyan-950/90 to-black/70",
      glow: "bg-cyan-700",
      bar: "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500",
      dot: "bg-cyan-400",
      link: "text-cyan-300 hover:text-white",
      linkBorder: "border-cyan-500/30 hover:border-cyan-400",
    },
    delay: 0.36,
  },
];

function App() {
  const role = useTypewriter(ROLES, 75, 1800);
  const { scrollYProgress } = useScroll();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="relative min-h-screen bg-[#050818] text-white overflow-x-hidden">
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 h-0.5 bg-gradient-to-r from-violet-500 via-blue-400 to-cyan-400 z-[60]"
        style={{ width: progressWidth }}
      />

      {/* Constellation canvas */}
      <ConstellationCanvas />

      {/* Nebula orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <Orb className="-top-60 -left-60 w-[700px] h-[700px] bg-violet-900/25 blur-[140px]" />
        <Orb className="top-1/2 -right-60 w-[600px] h-[600px] bg-blue-900/20 blur-[130px]" />
        <Orb className="bottom-0 left-1/3 w-[500px] h-[500px] bg-indigo-900/15 blur-[110px]" />
      </div>

      {/* Navigation */}
      <Nav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center items-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="flex flex-col items-center gap-6 max-w-4xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring", bounce: 0.5 }}
            className="
              px-5 py-1.5 rounded-full
              border border-violet-500/40 bg-violet-500/10
              text-violet-300 text-xs font-bold tracking-[0.3em] uppercase
              shadow-[0_0_20px_rgba(139,92,246,0.2)]
            "
          >
            ✦ Spider-Coder ✦ Bennett University ✦
          </motion.div>

          {/* Name */}
          <div className="leading-none">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
              className="text-7xl md:text-9xl font-black tracking-tighter"
            >
              <span className="bg-gradient-to-r from-white via-blue-100 to-violet-200 bg-clip-text text-transparent">
                Rahul
              </span>
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.7 }}
              className="text-7xl md:text-9xl font-black tracking-tighter"
            >
              <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-blue-400 bg-clip-text text-transparent shimmer-text">
                Tiwari
              </span>
            </motion.h1>
          </div>

          {/* Typewriter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="h-9 flex items-center gap-1"
          >
            <span className="text-xl md:text-2xl text-white/60 font-light tracking-wide">
              {role}
            </span>
            <span className="w-0.5 h-6 bg-violet-400 rounded-full animate-pulse" />
          </motion.div>

          {/* Quote */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="text-white/35 text-sm md:text-base italic max-w-md tracking-wide"
          >
            "With great power comes great responsibility — and great code."
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.45 }}
            className="flex flex-wrap gap-4 justify-center mt-2"
          >
            <a
              href="https://github.com/RahulTiwari293/"
              target="_blank"
              rel="noreferrer"
              className="
                px-7 py-3 rounded-xl font-bold text-sm uppercase tracking-widest
                bg-gradient-to-r from-violet-600 to-blue-600
                hover:from-violet-500 hover:to-blue-500
                shadow-[0_0_35px_rgba(139,92,246,0.45)]
                hover:shadow-[0_0_55px_rgba(139,92,246,0.65)]
                transition-all duration-300
              "
            >
              GitHub ↗
            </a>
            <a
              href="https://www.linkedin.com/in/rahul-tiwari-0280a2244"
              target="_blank"
              rel="noreferrer"
              className="
                px-7 py-3 rounded-xl font-bold text-sm uppercase tracking-widest
                border border-white/15 bg-white/5
                hover:bg-white/10 hover:border-white/35
                transition-all duration-300
              "
            >
              LinkedIn →
            </a>
            <a
              href="mailto:rahul.tiwari@example.com"
              className="
                px-7 py-3 rounded-xl font-bold text-sm uppercase tracking-widest
                border border-white/10 bg-white/[0.03]
                hover:bg-white/8 hover:border-white/25
                text-white/60 hover:text-white
                transition-all duration-300
              "
            >
              Email ✉
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 flex flex-col items-center gap-2 text-white/25 text-[10px] tracking-widest uppercase"
        >
          <span>scroll</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            className="w-px h-10 bg-gradient-to-b from-violet-500/60 to-transparent"
          />
        </motion.div>
      </section>

      {/* ── ABOUT ─────────────────────────────────────────────────────────── */}
      <section id="about" className="relative z-10 py-36 px-6">
        <div className="max-w-3xl mx-auto">
          <SectionHeading eyebrow="Origin Story" title="Who Am I?" />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75 }}
            viewport={{ once: true }}
            className="
              relative rounded-3xl p-10 md:p-14
              border border-white/10
              bg-white/[0.025] backdrop-blur-sm
              shadow-[0_0_100px_rgba(139,92,246,0.07),inset_0_0_80px_rgba(255,255,255,0.01)]
            "
          >
            {/* Corner stars */}
            {[
              "top-4 left-4", "top-4 right-4",
              "bottom-4 left-4", "bottom-4 right-4",
            ].map((pos, i) => (
              <div
                key={i}
                className={`absolute ${pos} w-1.5 h-1.5 rounded-full bg-violet-400/50 star-pulse`}
                style={{ animationDelay: `${i * 0.5}s` }}
              />
            ))}

            <p className="text-white/70 text-lg leading-loose text-center">
              Hey! I'm{" "}
              <span className="text-white font-bold">Rahul Tiwari</span>, aka the{" "}
              <span className="text-violet-400 font-bold">Spider-Coder</span> —
              navigating the constellation of{" "}
              <span className="text-blue-300">blockchain</span>,{" "}
              <span className="text-violet-300">Web3</span>, and{" "}
              <span className="text-cyan-300">modern interfaces</span> one commit at a time.
            </p>
            <p className="text-white/45 text-base leading-loose text-center mt-6">
              President at the{" "}
              <strong className="text-white/65">International Affairs Society</strong>,
              CSE undergrad at{" "}
              <strong className="text-white/65">Bennett University</strong>. I architect
              decentralized systems, ship elegant UIs, and thrive on problems that
              others call impossible — smart contracts, DSA, or the next big idea.
            </p>

            {/* Stats row */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { num: "4+", label: "DApps Built" },
                { num: "IAS", label: "President" },
                { num: "BU", label: "CSE Undergrad" },
              ].map(({ num, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 py-4 rounded-2xl border border-white/8 bg-white/[0.02]"
                >
                  <span className="text-2xl font-black text-violet-300">{num}</span>
                  <span className="text-white/40 text-xs uppercase tracking-widest">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SKILLS ────────────────────────────────────────────────────────── */}
      <section id="skills" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeading eyebrow="Constellation Map" title="Skills & Expertise" />
          <div className="flex flex-wrap justify-center gap-5">
            {SKILLS.map((s) => (
              <StarNode key={s.title} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PROJECTS ──────────────────────────────────────────────────────── */}
      <section id="projects" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeading eyebrow="Missions" title="Featured Projects" />
          <div className="flex flex-wrap justify-center gap-7">
            {PROJECTS.map((p) => (
              <ProjectCard key={p.title} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ───────────────────────────────────────────────────────── */}
      <section id="contact" className="relative z-10 py-36 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <SectionHeading eyebrow="Signal" title="Get In Touch" />

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-white/45 text-base mb-10 leading-relaxed"
          >
            Whether you want to discuss blockchain architecture, collaborate on a
            Web3 project, or just connect — I'm always open to a good conversation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="https://www.linkedin.com/in/rahul-tiwari-0280a2244"
              target="_blank"
              rel="noreferrer"
              className="
                flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-sm
                border border-blue-500/30 bg-blue-500/8
                hover:bg-blue-500/18 hover:border-blue-400/60 text-blue-300 hover:text-white
                shadow-[0_0_25px_rgba(59,130,246,0.12)]
                hover:shadow-[0_0_45px_rgba(59,130,246,0.28)]
                transition-all duration-350
              "
            >
              <span className="text-lg">💼</span> LinkedIn
            </a>
            <a
              href="https://github.com/RahulTiwari293/"
              target="_blank"
              rel="noreferrer"
              className="
                flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-sm
                border border-violet-500/30 bg-violet-500/8
                hover:bg-violet-500/18 hover:border-violet-400/60 text-violet-300 hover:text-white
                shadow-[0_0_25px_rgba(139,92,246,0.12)]
                hover:shadow-[0_0_45px_rgba(139,92,246,0.28)]
                transition-all duration-350
              "
            >
              <span className="text-lg">🐙</span> GitHub
            </a>
            <a
              href="mailto:rahul.tiwari@example.com"
              className="
                flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-sm
                border border-white/10 bg-white/[0.03]
                hover:bg-white/8 hover:border-white/25
                text-white/55 hover:text-white
                transition-all duration-350
              "
            >
              <span className="text-lg">📧</span> Email
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center">
        <p className="text-white/20 text-xs tracking-[0.25em] uppercase">
          ✦ Rahul Tiwari — 2025 — Built with React, Framer Motion & Stardust ✦
        </p>
      </footer>
    </div>
  );
}

export default App;
