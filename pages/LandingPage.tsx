import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Cpu, 
  Globe, 
  Lock, 
  Zap, 
  BarChart3, 
  CheckCircle2, 
  ArrowRight,
  ChevronRight,
  Users,
  Search,
  FileCheck,
  Calendar,
  MessageSquare,
  Star,
  Layers,
  Award,
  BookOpen,
  PieChart,
  HardDrive
} from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

// --- Components ---

const SatelliteEarth: React.FC = () => {
    return (
        <div className="relative w-80 h-80 md:w-[500px] md:h-[500px] flex items-center justify-center">
            {/* Atmosphere Glow */}
            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-[60px] animate-pulse"></div>
            <div className="absolute inset-0 rounded-full bg-indigo-600/10 blur-[100px]"></div>

            {/* Orbital Rings */}
            {[
                { rotateX: 60, rotateY: 30, duration: 20 },
                { rotateX: 60, rotateY: -30, duration: 25 },
                { rotateX: 0, rotateY: 90, duration: 22 },
                { rotateX: 80, rotateY: 10, duration: 18 }
            ].map((ring, i) => (
                <motion.div
                    key={i}
                    animate={{ rotateZ: 360 }}
                    transition={{ duration: ring.duration, repeat: Infinity, ease: "linear" }}
                    className="absolute w-full h-full rounded-full border border-blue-400/20 pointer-events-none"
                    style={{
                        transform: `rotateX(${ring.rotateX}deg) rotateY(${ring.rotateY}deg)`,
                    }}
                >
                    {/* Satellite Dot */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa] animate-pulse"></div>
                </motion.div>
            ))}

            {/* The Earth Sphere */}
            <motion.div 
                animate={{ rotateY: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="relative w-2/3 h-2/3 rounded-full overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.4)] border border-blue-500/30"
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* realistic earth texture background */}
                <div 
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center animate-[scroll_120s_linear_infinite]"
                    style={{ backgroundSize: '200% 100%' }}
                ></div>
                {/* Night overlay for city lights feel */}
                <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-transparent"></div>
                {/* Inner Glow */}
                <div className="absolute inset-0 rounded-full shadow-[inset_0_0_40px_rgba(59,130,246,0.6)]"></div>
            </motion.div>

            {/* Data Points / Pulsing markers */}
            {[0, 90, 180, 270].map((deg) => (
                <div 
                    key={deg}
                    className="absolute w-4 h-4"
                    style={{
                        transform: `rotate(${deg}deg) translateY(-140px) md:translateY(-180px)`
                    }}
                >
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
            ))}
        </div>
    );
};

const TiltCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
    const x = useSpring(0, { stiffness: 100, damping: 30 });
    const y = useSpring(0, { stiffness: 100, damping: 30 });

    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = (mouseX / width - 0.5) * 20;
        const yPct = (mouseY / height - 0.5) * -20;
        x.set(xPct);
        y.set(yPct);
    };

    const onMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            style={{
                rotateX: y,
                rotateY: x,
                transformStyle: "preserve-3d",
            }}
            className={className}
        >
            <div style={{ transform: "translateZ(50px)" }} className="h-full w-full">
                {children}
            </div>
        </motion.div>
    );
};

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start end", "end start"]
    });

    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [0.8, 1]);

    const fadeIn = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.8, ease: "easeOut" }
    };

    return (
        <div className="min-h-screen bg-[#010413] text-white selection:bg-blue-500/30 font-sans overflow-x-hidden relative">
            {/* Starfield Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
                {[...Array(50)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute w-px h-px bg-white rounded-full animate-pulse"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`
                        }}
                    ></div>
                ))}
            </div>
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-[100] bg-slate-950/20 backdrop-blur-xl border-b border-white/5 px-8 py-5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 group cursor-pointer"
                    >
                        <ShieldCheck className="w-8 h-8 text-blue-500" />
                        <span className="font-black text-2xl tracking-[0.2em] uppercase">Sentinel <span className="text-blue-500">AI</span></span>
                    </motion.div>
                    
                    <div className="hidden lg:flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
                        {['Explore', 'Features', 'Workflow', 'Security', 'Pricing'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-blue-400 transition-all relative group">
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-px bg-blue-500 group-hover:w-full transition-all duration-300"></span>
                            </a>
                        ))}
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/login')}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                    >
                        Sign In
                    </motion.button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 px-8 overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10 w-full grid lg:grid-cols-2 gap-20 items-center">
                    <div className="text-left py-20 relative">
                        {/* Decorative Line from Image */}
                        <div className="absolute top-0 left-0 w-16 h-px bg-white/20"></div>
                        <div className="absolute top-0 left-0 w-px h-64 bg-gradient-to-b from-white/20 to-transparent"></div>
                        <div className="absolute top-64 left-0 w-16 h-px bg-white/20"></div>

                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="pl-8"
                        >
                            <h2 className="text-4xl md:text-8xl font-black tracking-[0.1em] mb-12 uppercase leading-none">
                                Sentinel <br /> <span className="text-blue-500">AI</span>
                            </h2>
                            
                            <div className="mb-12 border-l-2 border-blue-500/50 pl-6">
                                <h3 className="text-indigo-400 font-black tracking-[0.3em] uppercase text-xs mb-4">In Low Orbit</h3>
                                <p className="text-slate-400 text-sm max-w-sm font-medium leading-relaxed uppercase tracking-wider">
                                    Global scale assessment network. Automate integrity with multi-layered AI verification.
                                </p>
                            </div>

                            <motion.button 
                                whileHover={{ x: 10 }}
                                onClick={() => navigate('/login')}
                                className="flex items-center gap-3 text-white font-black text-xs uppercase tracking-[0.4em] hover:text-blue-400 transition-colors group"
                            >
                                Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </motion.button>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5 }}
                        className="flex justify-center items-center"
                    >
                        <SatelliteEarth />
                    </motion.div>
                </div>
            </section>

            {/* Feature List Section: "Unified Platform" */}
            <section id="features" className="py-32 px-8 bg-slate-950/20 border-y border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-12">
                        <div className="max-w-2xl">
                            <h2 className="text-blue-500 font-black tracking-[0.4em] uppercase text-xs mb-6">Core Engine</h2>
                            <h3 className="text-4xl md:text-6xl font-black uppercase leading-tight">One Platform. <br /> Maximum Capabilities.</h3>
                        </div>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.2em] lg:text-right max-w-xs">
                            Unified assessment stack for modern enterprise engineering.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { title: "AI Proctoring", desc: "Computer vision and NLP for 100% test integrity.", icon: <ShieldCheck className="w-8 h-8" /> },
                            { title: "Coding Sandbox", desc: "Full-stack development environments in browser.", icon: <Cpu className="w-8 h-8" /> },
                            { title: "Aptitude Tests", desc: "Cognitive assessment models for all roles.", icon: <Zap className="w-8 h-8" /> },
                            { title: "Talent CRM", desc: "End-to-end candidate lifecycle management.", icon: <Users className="w-8 h-8" /> },
                            { title: "Verification", desc: "Sovereign identity and document validation.", icon: <Award className="w-8 h-8" /> },
                            { title: "Analytics Hub", desc: "Deep performance insights and ROI tracking.", icon: <BarChart3 className="w-8 h-8" /> }
                        ].map((item, i) => (
                            <TiltCard key={i} className="group p-10 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/50 transition-all overflow-hidden cursor-pointer">
                                <div className="p-4 bg-blue-500/10 rounded-2xl w-fit text-blue-500 mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xl">
                                    {item.icon}
                                </div>
                                <h4 className="text-2xl font-black uppercase mb-4 tracking-tighter">{item.title}</h4>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed group-hover:text-slate-300 transition-colors uppercase tracking-wide">{item.desc}</p>
                            </TiltCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* Workflow Section */}
            <section id="workflow" className="py-32 px-8 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-blue-500 font-black tracking-[0.4em] uppercase text-xs mb-6">Process Flow</h2>
                        <h3 className="text-4xl md:text-6xl font-black uppercase">How it works</h3>
                    </div>

                    <div className="grid md:grid-cols-4 gap-12 relative">
                        <div className="absolute top-1/2 left-0 w-full h-px bg-blue-500/10 hidden md:block"></div>
                        {[
                            { step: "01", label: "Configure", icon: <Layers className="w-6 h-6" /> },
                            { step: "02", label: "Invite", icon: <Users className="w-6 h-6" /> },
                            { step: "03", label: "Execute", icon: <ShieldCheck className="w-6 h-6" /> },
                            { step: "04", label: "Review", icon: <BarChart3 className="w-6 h-6" /> }
                        ].map((item, i) => (
                            <div key={i} className="relative z-10 flex flex-col items-center">
                                <div className="mb-6 w-20 h-20 rounded-[2rem] bg-slate-900 border border-white/10 flex items-center justify-center text-blue-400 shadow-2xl group hover:border-blue-500 transition-all duration-300">
                                    {item.icon}
                                </div>
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-2">{item.step}</p>
                                <h5 className="font-black text-xl uppercase tracking-widest">{item.label}</h5>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Security Section */}
            <section id="security" className="py-32 px-8 bg-blue-600 rounded-[3rem] mx-4 mb-32 relative overflow-hidden shadow-3xl">
                <div className="absolute inset-0 bg-blue-500/20 mix-blend-overlay"></div>
                <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <h2 className="text-white/80 font-black tracking-[0.5em] uppercase text-[10px] mb-8">Security Layer</h2>
                        <h3 className="text-5xl md:text-8xl font-black uppercase leading-[0.85] mb-12">Bank-Grade <br /> Architecture.</h3>
                        <div className="flex gap-12">
                             <div className="flex items-center gap-3 text-white font-black text-2xl tracking-tighter uppercase">
                                <CheckCircle2 className="w-8 h-8" /> GDPR
                             </div>
                             <div className="flex items-center gap-3 text-white font-black text-2xl tracking-tighter uppercase">
                                <CheckCircle2 className="w-8 h-8" /> SOC2
                             </div>
                        </div>
                    </div>
                    <div className="p-12 bg-white/10 backdrop-blur-2xl rounded-[3rem] border border-white/20">
                         <div className="space-y-8">
                            {[
                                { title: "End-to-End Encryption", icon: <Lock className="w-6 h-6" /> },
                                { title: "Automated Compliance", icon: <FileCheck className="w-6 h-6" /> },
                                { title: "Sovereign Identity", icon: <Users className="w-6 h-6" /> }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-6 group cursor-pointer">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 group-hover:rotate-12 transition-transform">
                                        {item.icon}
                                    </div>
                                    <h6 className="font-black text-2xl uppercase tracking-tighter">{item.title}</h6>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            </section>

            {/* Live Real-time Reviews */}
            <section className="py-32 px-8 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-16">
                        <div>
                             <h2 className="text-blue-500 font-black tracking-[0.4em] uppercase text-xs mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div> Live Real-time Feed
                             </h2>
                             <h3 className="text-4xl md:text-6xl font-black uppercase">Candidate Feedback</h3>
                        </div>
                        <div className="hidden md:block text-right">
                             <p className="text-3xl font-black text-white leading-none">4.3</p>
                             <div className="flex gap-1 justify-end mt-1 text-blue-500">
                                {[1,2,3,4].map(s => <Star key={s} className="w-3 h-3 fill-current" />)}
                             </div>
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 whitespace-nowrap">Average rating from 20+ reviews</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { 
                                name: "Shreyas Hiru Vanage", 
                                rating: 5, 
                                date: "27/01/2026", 
                                text: "Exam questions was really great and it will help in future career.",
                                initial: "S"
                            },
                            { 
                                name: "Himanshu Kumar", 
                                rating: 5, 
                                date: "25/01/2026", 
                                text: "The questions were clear and easy to understand. The overall experience was smooth, and I did not face any technical issues.",
                                initial: "H"
                            },
                            { 
                                name: "Rutuja Maroti Dadge", 
                                rating: 5, 
                                date: "25/01/2026", 
                                text: "The exam had moderate difficulty, the questions were clear, and there were no technical issues.",
                                initial: "R"
                            }
                        ].map((rev, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5 relative group hover:bg-white/10 transition-all"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-xl">
                                            {rev.initial}
                                        </div>
                                        <div>
                                            <p className="font-black text-white uppercase text-sm tracking-widest">{rev.name}</p>
                                            <p className="text-[10px] font-bold text-slate-500">{rev.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-blue-500">
                                        <span className="font-black text-sm mr-1">{rev.rating}</span>
                                        <Star className="w-4 h-4 fill-current" />
                                    </div>
                                </div>
                                <p className="text-slate-400 text-lg font-medium leading-relaxed italic">"{rev.text}"</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Final */}

            <section className="py-40 px-8 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-blue-500/20"></div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <h3 className="text-5xl md:text-[8rem] font-black uppercase leading-[0.85] mb-16 tracking-tighter">Ready to <br /> Verify?</h3>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        onClick={() => navigate('/login')}
                        className="bg-white text-slate-950 px-20 py-8 rounded-full font-black text-xl uppercase tracking-[0.2em] shadow-3xl hover:bg-blue-500 hover:text-white transition-all duration-500"
                    >
                        Initiate Now
                    </motion.button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-24 px-8 border-t border-white/5 bg-[#010413]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 opacity-50">
                    <div className="flex items-center gap-3 grayscale">
                        <ShieldCheck className="w-6 h-6" />
                        <span className="font-black text-xl uppercase tracking-widest text-white">Sentinel AI</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center">© 2024 SENTINEL AI PLATFORM. DEVELOPED AS A SECURE ENTERPRISE LAYER.</p>
                    <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.3em]">
                        <span className="cursor-pointer hover:text-blue-500 transition-colors">Privacy</span>
                        <span className="cursor-pointer hover:text-blue-500 transition-colors">Legal</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};
