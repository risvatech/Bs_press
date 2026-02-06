import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from "next/link";

// ============================================================================
// PROFESSIONAL HYDRAULIC PRESS ANIMATION
// ============================================================================
const ProfessionalHydraulicPress = () => {
    const [cycle, setCycle] = useState(0);
    const [pressState, setPressState] = useState<'idle' | 'loading' | 'pressing' | 'holding' | 'releasing' | 'ejecting'>('idle');

    useEffect(() => {
        const runCycle = async () => {
            // Idle state
            setPressState('idle');
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Loading sheet
            setPressState('loading');
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Pressing down
            setPressState('pressing');
            await new Promise(resolve => setTimeout(resolve, 1800));

            // Holding pressure
            setPressState('holding');
            await new Promise(resolve => setTimeout(resolve, 800));

            // Releasing pressure
            setPressState('releasing');
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Ejecting part
            setPressState('ejecting');
            await new Promise(resolve => setTimeout(resolve, 2000));

            setCycle(c => c + 1);
        };

        runCycle();
        const interval = setInterval(runCycle, 8600);
        return () => clearInterval(interval);
    }, []);

    // FIXED: Press goes down just to touch the top of the plate
    const pressPosition =
        pressState === 'idle' ? 0 :
            pressState === 'loading' ? 0 :
                pressState === 'pressing' ? 115 :  // Just touches the top of the plate
                    pressState === 'holding' ? 115 :   // Stays touching the plate
                        pressState === 'releasing' ? 60 :  // Moves up part way
                            pressState === 'ejecting' ? 0 :    // Fully retracted
                                0;

    // FIXED: Raw plate disappears when pressing starts
    const sheetPosition =
        pressState === 'idle' ? -200 :     // Off-screen
            pressState === 'loading' ? 0 :     // In position
                pressState === 'pressing' ? 0 :    // Being pressed (will disappear)
                    pressState === 'holding' ? 0 :     // Already pressed (raw plate gone)
                        pressState === 'releasing' ? 0 :   // Raw plate is gone, formed part appears
                            pressState === 'ejecting' ? 200 :  // Formed part moves off-screen
                                0;

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 800 600" className="w-full h-full max-w-4xl">
                <defs>
                    {/* Gradients for realistic metal */}
                    <linearGradient id="steelFrame" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#e2e8f0" />
                        <stop offset="50%" stopColor="#cbd5e1" />
                        <stop offset="100%" stopColor="#94a3b8" />
                    </linearGradient>

                    <linearGradient id="pressHead" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#475569" />
                        <stop offset="50%" stopColor="#334155" />
                        <stop offset="100%" stopColor="#1e293b" />
                    </linearGradient>

                    <linearGradient id="hydraulicCylinder" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#1e40af" />
                    </linearGradient>

                    <linearGradient id="metalSheet" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f1f5f9" />
                        <stop offset="50%" stopColor="#e2e8f0" />
                        <stop offset="100%" stopColor="#cbd5e1" />
                    </linearGradient>

                    <linearGradient id="yellowDie" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>

                    {/* Shadow filter */}
                    <filter id="dropShadow">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
                        <feOffset dx="0" dy="6" result="offsetblur"/>
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.3"/>
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>

                    {/* Glow effect */}
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                {/* Floor/Base */}
                <rect x="100" y="500" width="600" height="80" fill="#64748b" />
                <rect x="100" y="500" width="600" height="10" fill="#94a3b8" />

                {/* Machine Base Platform */}
                <rect x="200" y="420" width="400" height="80" fill="url(#steelFrame)" stroke="#64748b" strokeWidth="3" />
                <rect x="200" y="420" width="400" height="8" fill="#f1f5f9" opacity="0.6" />

                {/* Control Panel */}
                <g>
                    <rect x="630" y="380" width="80" height="120" fill="#1e293b" stroke="#0f172a" strokeWidth="2" rx="4" />
                    <rect x="640" y="390" width="60" height="40" fill="#1e40af" opacity="0.2" stroke="#3b82f6" strokeWidth="1" />

                    {/* Display */}
                    <text x="670" y="415" fontSize="16" fill="#60a5fa" textAnchor="middle" fontFamily="monospace">
                        {cycle.toString().padStart(4, '0')}
                    </text>

                    {/* Status Indicators */}
                    <motion.circle
                        cx="650" cy="450" r="6"
                        animate={{
                            fill: pressState === 'idle' || pressState === 'loading' ? '#10b981' : '#334155',
                            filter: pressState === 'idle' || pressState === 'loading' ? 'url(#glow)' : 'none'
                        }}
                    />
                    <motion.circle
                        cx="670" cy="450" r="6"
                        animate={{
                            fill: pressState === 'pressing' || pressState === 'holding' ? '#f59e0b' : '#334155',
                            filter: pressState === 'pressing' || pressState === 'holding' ? 'url(#glow)' : 'none'
                        }}
                    />
                    <motion.circle
                        cx="690" cy="450" r="6"
                        animate={{
                            fill: pressState === 'releasing' || pressState === 'ejecting' ? '#3b82f6' : '#334155',
                            filter: pressState === 'releasing' || pressState === 'ejecting' ? 'url(#glow)' : 'none'
                        }}
                    />

                    {/* Buttons */}
                    <rect x="645" y="470" width="25" height="20" fill="#ef4444" rx="3" />
                    <rect x="675" y="470" width="25" height="20" fill="#10b981" rx="3" />
                </g>

                {/* Left Support Column */}
                <g>
                    <rect x="250" y="140" width="40" height="280" fill="url(#steelFrame)" stroke="#64748b" strokeWidth="3" />
                    <rect x="252" y="142" width="8" height="276" fill="#f1f5f9" opacity="0.4" />
                    {/* Bolts */}
                    <circle cx="270" cy="160" r="5" fill="#475569" stroke="#334155" strokeWidth="1" />
                    <circle cx="270" cy="200" r="5" fill="#475569" stroke="#334155" strokeWidth="1" />
                    <circle cx="270" cy="400" r="5" fill="#475569" stroke="#334155" strokeWidth="1" />
                </g>

                {/* Right Support Column */}
                <g>
                    <rect x="510" y="140" width="40" height="280" fill="url(#steelFrame)" stroke="#64748b" strokeWidth="3" />
                    <rect x="540" y="142" width="8" height="276" fill="#f1f5f9" opacity="0.4" />
                    {/* Bolts */}
                    <circle cx="530" cy="160" r="5" fill="#475569" stroke="#334155" strokeWidth="1" />
                    <circle cx="530" cy="200" r="5" fill="#475569" stroke="#334155" strokeWidth="1" />
                    <circle cx="530" cy="400" r="5" fill="#475569" stroke="#334155" strokeWidth="1" />
                </g>

                {/* Top Frame */}
                <g>
                    <rect x="240" y="100" width="320" height="40" fill="url(#steelFrame)" stroke="#64748b" strokeWidth="3" />
                    <rect x="242" y="102" width="316" height="8" fill="#f1f5f9" opacity="0.6" />
                    {/* Mounting bolts */}
                    <circle cx="260" cy="120" r="6" fill="#475569" stroke="#334155" strokeWidth="2" />
                    <circle cx="540" cy="120" r="6" fill="#475569" stroke="#334155" strokeWidth="2" />
                </g>

                {/* Hydraulic Cylinders - Left */}
                <motion.g
                    animate={{ y: pressPosition }}
                    transition={{
                        duration: pressState === 'pressing' ? 1.8 :
                            pressState === 'releasing' ? 1.5 :
                                pressState === 'ejecting' ? 2.0 : 1.0,
                        ease: pressState === 'pressing' ? [0.43, 0.13, 0.23, 0.96] : 'easeInOut'
                    }}
                >
                    {/* Left cylinder rod */}
                    <rect x="295" y="140" width="20" height="100" fill="#94a3b8" stroke="#64748b" strokeWidth="2" />
                    {/* Left cylinder body */}
                    <rect x="290" y="100" width="30" height="40" fill="url(#hydraulicCylinder)" stroke="#1e40af" strokeWidth="2" rx="4" />
                    <rect x="292" y="102" width="26" height="8" fill="#60a5fa" opacity="0.6" />
                </motion.g>

                {/* Hydraulic Cylinders - Right */}
                <motion.g
                    animate={{ y: pressPosition }}
                    transition={{
                        duration: pressState === 'pressing' ? 1.8 :
                            pressState === 'releasing' ? 1.5 :
                                pressState === 'ejecting' ? 2.0 : 1.0,
                        ease: pressState === 'pressing' ? [0.43, 0.13, 0.23, 0.96] : 'easeInOut'
                    }}
                >
                    {/* Right cylinder rod */}
                    <rect x="485" y="140" width="20" height="100" fill="#94a3b8" stroke="#64748b" strokeWidth="2" />
                    {/* Right cylinder body */}
                    <rect x="480" y="100" width="30" height="40" fill="url(#hydraulicCylinder)" stroke="#1e40af" strokeWidth="2" rx="4" />
                    <rect x="482" y="102" width="26" height="8" fill="#60a5fa" opacity="0.6" />
                </motion.g>

                {/* Press Head Assembly */}
                <motion.g
                    animate={{ y: pressPosition }}
                    transition={{
                        duration: pressState === 'pressing' ? 1.8 :
                            pressState === 'releasing' ? 1.5 :
                                pressState === 'ejecting' ? 2.0 : 1.0,
                        ease: pressState === 'pressing' ? [0.43, 0.13, 0.23, 0.96] : 'easeInOut'
                    }}
                >
                    {/* Main press head body */}
                    <rect x="280" y="240" width="240" height="60" fill="url(#pressHead)" stroke="#0f172a" strokeWidth="3" rx="4" />
                    <rect x="282" y="242" width="236" height="12" fill="#64748b" opacity="0.4" />

                    {/* Pressure gauge */}
                    <circle cx="500" cy="260" r="18" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                    <circle cx="500" cy="260" r="14" fill="#0f172a" />
                    <motion.line
                        x1="500" y1="260" x2="500" y2="250"
                        stroke="#ef4444"
                        strokeWidth="2"
                        animate={{
                            rotate: pressState === 'pressing' || pressState === 'holding' ? 45 : -45
                        }}
                        transition={{ duration: 0.5 }}
                        style={{ originX: '500px', originY: '260px' }}
                    />

                    {/* Die mounting plate - Yellow/Orange */}
                    <rect x="300" y="300" width="200" height="30" fill="url(#yellowDie)" stroke="#b45309" strokeWidth="3" />
                    <rect x="302" y="302" width="196" height="8" fill="#fde68a" opacity="0.6" />

                    {/* Die shape (contoured) - Just touches the plate */}
                    <path
                        d="M 320 330 L 480 330 L 470 350 Q 400 360 330 350 Z"
                        fill="#78350f"
                        stroke="#451a03"
                        strokeWidth="2"
                    />

                    {/* Mounting bolts */}
                    <circle cx="310" cy="315" r="4" fill="#92400e" stroke="#78350f" strokeWidth="1" />
                    <circle cx="490" cy="315" r="4" fill="#92400e" stroke="#78350f" strokeWidth="1" />
                </motion.g>

                {/* Work Table / Bed */}
                <rect x="280" y="420" width="240" height="20" fill="#94a3b8" stroke="#64748b" strokeWidth="2" />
                <rect x="280" y="420" width="240" height="4" fill="#cbd5e1" />

                {/* Material Feed System - Raw sheet disappears when pressing starts */}
                <AnimatePresence>
                    {pressState === 'idle' || pressState === 'loading' ? (
                        <motion.g
                            key="raw-sheet"
                            initial={{ x: -200, opacity: 0 }}
                            animate={{ x: sheetPosition, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: pressState === 'loading' ? 1.5 : 0.5, ease: 'easeInOut' }}
                        >
                            {/* Steel sheet */}
                            <rect
                                x="300"
                                y="405"
                                width="200"
                                height="8"
                                fill="url(#metalSheet)"
                                stroke="#94a3b8"
                                strokeWidth="2"
                                filter="url(#dropShadow)"
                            />
                            <rect x="302" y="406" width="196" height="2" fill="#f8fafc" opacity="0.8" />
                        </motion.g>
                    ) : null}
                </AnimatePresence>

                {/* Formed Part - appears when press releases */}
                <AnimatePresence>
                    {(pressState === 'releasing' || pressState === 'ejecting') && (
                        <motion.g
                            key="formed-part"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                                x: sheetPosition,
                                opacity: pressState === 'ejecting' ? 1 : 1,
                                scale: 1
                            }}
                            exit={{ x: 300, opacity: 0 }}
                            transition={{ duration: 1.8, ease: 'easeOut' }}
                        >
                            {/* Formed automotive part - Car Door Panel with depth and curves */}

                            {/* Main body - curved top edge */}
                            <path
                                d="M 305 410 L 305 398 Q 305 388 315 388 L 360 388 Q 370 385 380 385 Q 390 385 400 388 L 445 388 Q 485 388 485 398 L 485 410 Q 485 418 475 418 L 315 418 Q 305 418 305 410 Z"
                                fill="url(#metalSheet)"
                                stroke="#94a3b8"
                                strokeWidth="2.5"
                                filter="url(#dropShadow)"
                            />

                            {/* Top surface highlight showing 3D depth */}
                            <path
                                d="M 315 390 L 360 390 Q 370 388 380 388 Q 390 388 400 390 L 445 390 Q 450 390 450 395"
                                fill="none"
                                stroke="#f8fafc"
                                strokeWidth="2"
                                opacity="0.7"
                            />

                            {/* Window frame cutout - rectangular pressed area */}
                            <rect
                                x="340"
                                y="393"
                                width="100"
                                height="16"
                                rx="3"
                                fill="#94a3b8"
                                opacity="0.4"
                                stroke="#64748b"
                                strokeWidth="1"
                            />
                            <rect
                                x="342"
                                y="395"
                                width="96"
                                height="12"
                                rx="2"
                                fill="#cbd5e1"
                                opacity="0.3"
                            />

                            {/* Door handle recess - oval pressed feature */}
                            <ellipse
                                cx="325"
                                cy="403"
                                rx="12"
                                ry="8"
                                fill="#64748b"
                                opacity="0.5"
                                stroke="#475569"
                                strokeWidth="1.5"
                            />
                            <ellipse
                                cx="325"
                                cy="403"
                                rx="7"
                                ry="5"
                                fill="#94a3b8"
                                opacity="0.4"
                            />

                            {/* Reinforcement ribs - stamped lines showing depth */}
                            <line
                                x1="310"
                                y1="400"
                                x2="330"
                                y2="400"
                                stroke="#64748b"
                                strokeWidth="1.5"
                                opacity="0.6"
                            />
                            <line
                                x1="310"
                                y1="408"
                                x2="330"
                                y2="408"
                                stroke="#64748b"
                                strokeWidth="1.5"
                                opacity="0.6"
                            />

                            {/* Mirror mounting area - circular pressed boss */}
                            <circle
                                cx="465"
                                cy="396"
                                r="8"
                                fill="#475569"
                                opacity="0.4"
                                stroke="#334155"
                                strokeWidth="1"
                            />
                            <circle
                                cx="465"
                                cy="396"
                                r="4"
                                fill="#64748b"
                                opacity="0.6"
                            />

                            {/* Bottom edge curve showing formed flange */}
                            <path
                                d="M 315 418 L 475 418 L 478 420 L 312 420 Z"
                                fill="#94a3b8"
                                opacity="0.5"
                            />

                            {/* Bolt holes - punched features */}
                            <circle cx="318" cy="405" r="3" fill="#334155" stroke="#1e293b" strokeWidth="1" />
                            <circle cx="472" cy="405" r="3" fill="#334155" stroke="#1e293b" strokeWidth="1" />

                            {/* Side curvature shadow showing 3D form */}
                            <path
                                d="M 305 398 Q 308 403 310 410"
                                fill="none"
                                stroke="#475569"
                                strokeWidth="2"
                                opacity="0.3"
                            />
                            <path
                                d="M 485 398 Q 482 403 480 410"
                                fill="none"
                                stroke="#64748b"
                                strokeWidth="1.5"
                                opacity="0.2"
                            />
                        </motion.g>
                    )}
                </AnimatePresence>

                {/* Press Contact Highlight - shows when press touches plate */}
                {pressState === 'pressing' && (
                    <motion.rect
                        x="300"
                        y="405"
                        width="200"
                        height="8"
                        fill="#fbbf24"
                        opacity={0}
                        animate={{
                            opacity: [0, 0.2, 0]
                        }}
                        transition={{
                            duration: 0.5,
                            ease: "easeOut"
                        }}
                    />
                )}

                {/* Sparks Effect during pressing */}
                {(pressState === 'pressing' || pressState === 'holding') && (
                    <g>
                        {[...Array(15)].map((_, i) => {
                            const angle = (Math.PI * 2 * i) / 15;
                            const distance = 40 + Math.random() * 40;
                            return (
                                <motion.circle
                                    key={i}
                                    cx={400}
                                    cy="405"
                                    r="2"
                                    fill="#fbbf24"
                                    initial={{ opacity: 1, scale: 1 }}
                                    animate={{
                                        x: Math.cos(angle) * distance,
                                        y: Math.sin(angle) * distance * 0.5,
                                        opacity: 0,
                                        scale: 0
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        delay: Math.random() * 0.3,
                                        repeat: Infinity,
                                        repeatDelay: 0.1
                                    }}
                                />
                            );
                        })}
                    </g>
                )}

                {/* Pressure/Steam effect */}
                {pressState === 'holding' && (
                    <motion.ellipse
                        cx="400"
                        cy="405"
                        rx="100"
                        ry="20"
                        fill="#94a3b8"
                        opacity="0.2"
                        animate={{
                            opacity: [0.2, 0.05, 0.2],
                            rx: [100, 130, 100],
                            ry: [20, 30, 20]
                        }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                )}

                {/* Pressure reading display */}
                <g>
                    <rect x="120" y="200" width="100" height="60" fill="#1e293b" stroke="#334155" strokeWidth="2" rx="4" />
                    <text x="170" y="220" fontSize="12" fill="#94a3b8" textAnchor="middle" fontFamily="sans-serif">PRESSURE</text>
                    <text x="170" y="245" fontSize="24" fill="#3b82f6" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                        {pressState === 'pressing' || pressState === 'holding' ? '2500' : '0000'}
                    </text>
                    <text x="170" y="258" fontSize="10" fill="text-primary" textAnchor="middle" fontFamily="sans-serif">TON</text>
                </g>

                {/* Cycle counter */}
                <g>
                    <rect x="580" y="520" width="120" height="40" fill="#1e293b" stroke="#334155" strokeWidth="2" rx="4" />
                    <text x="640" y="537" fontSize="11" fill="#94a3b8" textAnchor="middle" fontFamily="sans-serif">PARTS</text>
                    <text x="640" y="555" fontSize="20" fill="#10b981" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                        {cycle.toString().padStart(5, '0')}
                    </text>
                </g>

                {/* Status text */}
                <text x="400" y="80" fontSize="18" fill="text-primary" textAnchor="middle" fontFamily="sans-serif" fontWeight="600">
                    {pressState === 'idle' && 'READY'}
                    {pressState === 'loading' && 'LOADING MATERIAL'}
                    {pressState === 'pressing' && 'PRESSING'}
                    {pressState === 'holding' && 'HOLDING PRESSURE'}
                    {pressState === 'releasing' && 'RELEASING'}
                    {pressState === 'ejecting' && 'EJECTING PART'}
                </text>
            </svg>
        </div>
    );
};
// ============================================================================
// HERO SECTION
// ============================================================================
export default function HeroSection() {
    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary via-steel to-steel">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(rgba(30, 64, 175, 0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(30, 64, 175, 0.8) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }} />
            </div>

            {/* Ambient Lighting */}
            {/*<div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />*/}
            {/*<div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />*/}

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
                <div className="grid lg:grid-cols-2 gap-12 items-center w-full py-20">

                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-200 rounded-full"
                        >
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            <span className="text-blue-700 text-sm font-bold tracking-wide uppercase">Industry Leading Precision</span>
                        </motion.div>

                        {/* Main Heading */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight"
                        >
                            Precision Steel Pressing for the{' '}
                            <span className="text-white bg-clip-text">
                Automobile Industry
              </span>
                        </motion.h1>

                        {/* Subheading */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-2xl text-white font-semibold"
                        >
                            High Quality. High Strength. High Accuracy.
                        </motion.p>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-lg text-white leading-relaxed"
                        >
                            Advanced hydraulic and pneumatic press technology delivering precision-formed automotive components with tolerances down to 0.01mm. Trusted by leading automobile manufacturers worldwide.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-wrap gap-4"
                        >
                            <motion.button
                                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all text-lg"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link href="/quote">Request Quote</Link>
                            </motion.button>
                            <motion.button
                                className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl border-2 border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-all shadow-md text-lg"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link href="/services">View services</Link>
                            </motion.button>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-300"
                        >
                            <div>
                                <div className="text-4xl font-bold text-primary mb-1">25+</div>
                                <div className="text-white/80 text-sm font-medium">Years Experience</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-primary mb-1">500+</div>
                                <div className="text-white/80  text-sm font-medium">Projects Delivered</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-primary mb-1">99.9%</div>
                                <div className="text-white/80  text-sm font-medium">Quality Rate</div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Animation */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative mt-30"
                    >
                        {/* Animation Container */}
                        <div className="relative   backdrop-blur-sm ">
                            <ProfessionalHydraulicPress />
                        </div>

                        {/* Decorative Elements */}
                        {/*<div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-300/20 rounded-full blur-2xl" />*/}
                        {/*<div className="absolute -bottom-6 -left-6 w-40 h-40 bg-blue-300/20 rounded-full blur-2xl" />*/}

                        {/* Feature badges */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1 }}
                            className="absolute -left-4 top-1 bg-white px-4 py-3 rounded-xl shadow-lg border border-slate-200"
                        >
                            <div className="text-xs text-slate-500 font-semibold">Max Capacity</div>
                            <div className="text-xl font-bold text-blue-600">200 TON</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.2 }}
                            className="absolute -right-4 bottom-1/2 bg-white px-4 py-3 rounded-xl shadow-lg border border-slate-200"
                        >
                            <div className="text-xs text-slate-500 font-semibold">Tolerance</div>
                            <div className="text-xl font-bold text-blue-600">±0.01mm</div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Wave - Pushed below with negative margin */}
            {/*<div className="absolute left-0 right-0 -bottom-8 z-0">*/}
            {/*    <svg viewBox="0 0 1440 40" className="w-full h-20">*/}
            {/*        <path*/}
            {/*            fill="#ffffff"*/}
            {/*            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"*/}
            {/*        />*/}
            {/*    </svg>*/}
            {/*</div>*/}
        </div>
    );
}
