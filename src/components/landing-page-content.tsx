"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Quote,
    User,
    TrendingUp,
    Clock,
    MessageCircle,
    Globe,
    Mail,
    CheckCircle2
} from "lucide-react";
import { useTranslation } from "@/i18n/provider";
import { client } from "@/lib/feathers";

import { FontSizeSelector } from "@/components/font-size-selector";

export function LandingPageContent() {
    const { lang, t } = useTranslation();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        client
            .reAuthenticate()
            .then((res) => {
                setUser(res.user);
                setIsLoading(false);
            })
            .catch(() => {
                setUser(null);
                setIsLoading(false);
            });
    }, []);

    // Routing language
    const targetLangUrl = lang === "ru" ? "/" : "/ru";

    return (
        <div className="min-h-screen bg-[#faf8f6] dark:bg-background text-foreground overflow-x-hidden selection:bg-[#eb6e4b]/30">
            {/* Background Video — fixed, full screen */}
            <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-20"
                >
                    <source src="/stack.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-[#faf8f6]/50 dark:bg-background/60" />
            </div>
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#faf8f6]/70 dark:bg-background/70 backdrop-blur-xl border-b border-black/5 dark:border-white/10">
                <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3">
                        <img
                            src="/logo.svg"
                            alt="Climb AI Logo"
                            className="w-6 h-6 md:w-8 md:h-8 object-contain"
                        />
                        <span className="font-mono font-black text-xl md:text-2xl tracking-tighter text-gray-900 dark:text-white">
                            Climb AI
                        </span>
                    </div>

                    <div className="hidden lg:flex items-center gap-10 text-sm font-semibold text-gray-600 dark:text-gray-300">
                        <a
                            href="#"
                            className="hover:text-black dark:hover:text-white transition-colors"
                        >
                            {t.nav.dashboard}
                        </a>
                        <a
                            href="#"
                            className="hover:text-black dark:hover:text-white transition-colors"
                        >
                            {t.nav.solutions}
                        </a>
                        <a
                            href="#"
                            className="hover:text-black dark:hover:text-white transition-colors"
                        >
                            {t.nav.experts}
                        </a>
                        <a
                            href="#"
                            className="hover:text-black dark:hover:text-white transition-colors"
                        >
                            {t.nav.pricing}
                        </a>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <a
                            href={targetLangUrl}
                            className="flex items-center gap-1.5 md:gap-2 px-2 py-1.5 md:px-3 md:py-2 rounded-full text-xs md:text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        >
                            <img
                                src={lang === "ru" ? "/uz.svg" : "/ru.svg"}
                                className="w-4 h-4 md:w-5 md:h-5 rounded-full object-cover"
                                alt="Language Flag"
                            />
                            {lang === "ru" ? "Oʻz" : "Ру"}
                        </a>

                        <FontSizeSelector />

                        {user ? (
                            <a
                                href="/dashboard"
                                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-bold text-sm"
                            >
                                <User className="w-4 h-4" />
                                {user.firstName || "Дашборд"}
                            </a>
                        ) : (
                            <div className="flex items-center gap-2 hidden sm:flex">
                                <a
                                    href="/login"
                                    className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
                                >
                                    {t.auth.login}
                                </a>
                                
                            </div>
                        )}

                        {/* Mobile Auth Buttons */}
                        {!user ? (
                            <div className="flex sm:hidden items-center gap-1">
                                <a
                                    href="/login"
                                    className="px-2 py-1 text-xs font-bold text-gray-700 dark:text-gray-300"
                                >
                                    {t.auth.login}
                                </a>
                                <a
                                    href="/connect"
                                    className="px-2 py-1 text-xs font-bold bg-[#eb6e4b] text-white rounded-md"
                                >
                                    {t.connect ? t.connect.badge : "Заявка"}
                                </a>
                            </div>
                        ) : (
                            <div className="flex sm:hidden items-center gap-1">
                                <a
                                    href="/dashboard"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-bold text-xs"
                                >
                                    {user.firstName || "Дашборд"}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 md:pt-60 md:pb-32 px-4 md:px-6">
                <div className="container mx-auto max-w-5xl text-center space-y-6 md:space-y-10 relative z-10 w-full overflow-hidden">
                    <h1
                        className="leading-[1.1] text-gray-900 dark:text-white font-mono font-extrabold tracking-tight text-balance animate-in slide-in-from-bottom-8 fade-in duration-1000"
                        style={{ fontSize: "clamp(40px, 8vw, 88px)" }}
                    >
                        {t.hero.headlinePre}
                        <span className="text-[#eb6e4b]">
                            {t.hero.headlineHighlight}
                        </span>
                        {t.hero.headlinePost}
                    </h1>
                    <p className="text-lg sm:text-xl md:text-[1.4rem] text-gray-600 dark:text-gray-400 font-medium max-w-3xl mx-auto md:leading-relaxed text-balance break-words animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-150">
                        {t.hero.subhead}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-6 md:pt-8 animate-in slide-in-from-bottom-12 fade-in duration-1000 delay-300">
                        <Button
                            size="lg"
                            className="h-14 px-8 text-lg font-bold rounded-xl w-full sm:w-auto shadow-[0_10px_40px_-10px_rgba(235,110,75,0.5)] transform hover:-translate-y-1 hover:shadow-[0_20px_50px_-10px_rgba(235,110,75,0.6)] transition-all bg-[#eb6e4b] hover:bg-[#d45e3c] text-white border-none"
                            asChild
                        >
                            <a href="/connect">{t.hero.btnPrimary}</a>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-14 px-8 text-lg font-bold rounded-xl w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500 bg-transparent text-gray-800 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition-all transform hover:-translate-y-1"
                            asChild
                        >
                            <a href="/connect">{t.hero.btnExpert}</a>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative z-10 py-16 md:py-20">
                <div className="container mx-auto px-6 md:px-12 max-w-5xl">
                    <div className="grid grid-cols-3 gap-4 md:gap-8">
                        <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                            <span className="block text-4xl sm:text-5xl md:text-7xl font-mono font-black text-[#eb6e4b] tracking-tighter">
                                {t.stats.speed}
                            </span>
                            <span className="block text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-semibold">
                                {t.stats.speedLabel}
                            </span>
                        </div>
                        <div className="text-center space-y-2 relative animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                            <div className="absolute inset-y-0 -left-2 w-px bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
                            <div className="absolute inset-y-0 -right-2 w-px bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
                            <span className="block text-4xl sm:text-5xl md:text-7xl font-mono font-black text-gray-900 dark:text-white tracking-tighter">
                                {t.stats.time}
                            </span>
                            <span className="block text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-semibold">
                                {t.stats.timeLabel}
                            </span>
                        </div>
                        <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                            <span className="block text-4xl sm:text-5xl md:text-7xl font-mono font-black text-[#eb6e4b] tracking-tighter">
                                {t.stats.roles}
                            </span>
                            <span className="block text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-semibold">
                                {t.stats.rolesLabel}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Mission Section */}
            <section className="relative py-24 md:py-36 px-6 md:px-12 z-10">
                <div className="container mx-auto max-w-4xl text-center space-y-8 md:space-y-12">
                    <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] text-gray-900 dark:text-white font-mono font-extrabold mb-8 md:mb-16 animate-in slide-in-from-bottom-10 fade-in duration-1000">
                        {t.mission.title}
                    </h2>

                    <div className="relative group mx-2 sm:mx-0">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#eb6e4b]/20 to-[#f9a88b]/20 rounded-[2rem] md:rounded-[3rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 w-full h-full"></div>
                        <div className="relative p-6 sm:p-10 md:p-16 rounded-[1.5rem] md:rounded-[2.5rem] bg-[#fefdfb] dark:bg-[#111] border border-orange-100 dark:border-orange-950 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-1000 delay-200">
                            {/* Quote icon watermark */}
                            <div className="absolute p-4 -top-4 -left-4 md:-top-6 md:-left-6 text-[#eb6e4b]/10 dark:text-[#eb6e4b]/5">
                                <Quote
                                    fill="currentColor"
                                    stroke="none"
                                    className="w-20 h-20 sm:w-32 sm:h-32 md:w-48 md:h-48 rotate-180"
                                />
                            </div>

                            <p 
                                className="text-lg sm:text-2xl md:text-3xl font-medium leading-relaxed md:leading-[1.7] relative z-10 text-gray-700 dark:text-gray-300 text-balance"
                                dangerouslySetInnerHTML={{ __html: t.mission.text }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section className="relative z-10 py-20 md:py-28 px-6 md:px-12">
                <div className="container mx-auto max-w-6xl relative">
                    <h2 className="text-3xl md:text-5xl font-mono font-extrabold text-center mb-16 md:mb-20 text-gray-900 dark:text-white animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {t.howItWorks.title}
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                        {/* Step 1 */}
                        <div className="group relative bg-white/80 dark:bg-[#111]/80 backdrop-blur-sm border border-orange-100 dark:border-orange-950 rounded-3xl p-8 md:p-10 shadow-lg hover:shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-100">
                            <div className="w-14 h-14 bg-[#eb6e4b]/10 text-[#eb6e4b] rounded-2xl flex items-center justify-center font-mono font-black text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                1
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold mb-3 font-mono tracking-tight text-gray-900 dark:text-white">
                                {t.howItWorks.step1Title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm md:text-base">
                                {t.howItWorks.step1Desc}
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="group relative bg-white/80 dark:bg-[#111]/80 backdrop-blur-sm border border-orange-100 dark:border-orange-950 rounded-3xl p-8 md:p-10 shadow-lg hover:shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
                            <div className="w-14 h-14 bg-[#eb6e4b]/10 text-[#eb6e4b] rounded-2xl flex items-center justify-center font-mono font-black text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                2
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold mb-3 font-mono tracking-tight text-gray-900 dark:text-white">
                                {t.howItWorks.step2Title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm md:text-base">
                                {t.howItWorks.step2Desc}
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="group relative bg-white/80 dark:bg-[#111]/80 backdrop-blur-sm border border-orange-100 dark:border-orange-950 rounded-3xl p-8 md:p-10 shadow-lg hover:shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
                            <div className="w-14 h-14 bg-[#eb6e4b]/10 text-[#eb6e4b] rounded-2xl flex items-center justify-center font-mono font-black text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                3
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold mb-3 font-mono tracking-tight text-gray-900 dark:text-white">
                                {t.howItWorks.step3Title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm md:text-base">
                                {t.howItWorks.step3Desc}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Experts Section */}
            <section className="relative z-10 py-24 md:py-32 bg-[#1a1514]/80 backdrop-blur-2xl text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#eb6e4b]/10 to-transparent"></div>
                <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Text Content */}
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
                            <div>
                                <h2 className="text-4xl md:text-5xl lg:text-5xl font-mono font-black mb-4 leading-tight text-white">
                                    {t.expertsSection.title}
                                </h2>
                                <span className="inline-block py-1 pr-4 text-[#eb6e4b] font-mono font-bold tracking-widest uppercase text-sm mb-4">
                                    {t.expertsSection.subtitle}
                                </span>
                                <p className="text-gray-400 text-lg leading-relaxed">
                                    {t.expertsSection.description}
                                </p>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-white/10">
                                <div className="flex gap-4">
                                    <div className="mt-1 shrink-0 bg-[#eb6e4b]/20 p-3 h-12 rounded-xl text-[#eb6e4b]">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2 text-white">
                                            {t.expertsSection.feature1Title}
                                        </h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            {t.expertsSection.feature1Desc}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="mt-1 shrink-0 h-12 bg-[#eb6e4b]/20 p-3 rounded-xl text-[#eb6e4b]">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2 text-white">
                                            {t.expertsSection.feature2Title}
                                        </h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            {t.expertsSection.feature2Desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Videos Grid */}
                        <div className="relative animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
                            <div className="absolute -inset-4 bg-gradient-to-tr from-[#eb6e4b]/20 blur-3xl opacity-50 rounded-full"></div>
                            <div className="relative bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-sm">
                                <h3 className="text-2xl font-mono font-bold text-center lg:text-left mb-6 text-white">
                                    {t.expertsSection.domainsTitle}
                                </h3>

                                <div className="flex flex-col gap-4">
                                    {/* Sales Course */}
                                    <div className="bg-black/20 border border-white/5 p-3 rounded-2xl flex items-center flex-col sm:flex-row gap-4 hover:bg-white/5 transition-all duration-300 group cursor-pointer">
                                        <div className="w-full sm:w-40 h-28 shrink-0 rounded-xl overflow-hidden bg-black relative border border-white/10 group-hover:border-[#eb6e4b]/50 transition-colors">
                                            <video
                                                src="/for-sales-managers.mp4"
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                            />
                                        </div>
                                        <div className="flex-1 w-full text-center sm:text-left flex flex-col justify-center">
                                            <h4 className="font-bold text-lg mb-3 text-white">
                                                {t.expertsSection.sales.title}
                                            </h4>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-[#eb6e4b] text-[#eb6e4b] hover:bg-[#eb6e4b] hover:text-white bg-transparent transition-colors sm:self-start self-center w-full sm:w-auto"
                                            >
                                                {t.expertsSection.sales.btn}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Finance Course */}
                                    <div className="bg-black/20 border border-white/5 p-3 rounded-2xl flex items-center flex-col sm:flex-row gap-4 hover:bg-white/5 transition-all duration-300 group cursor-pointer">
                                        <div className="w-full sm:w-40 h-28 shrink-0 rounded-xl overflow-hidden bg-black relative border border-white/10 group-hover:border-[#eb6e4b]/50 transition-colors">
                                            <video
                                                src="/finice-tranings.mp4"
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                            />
                                        </div>
                                        <div className="flex-1 w-full text-center sm:text-left flex flex-col justify-center">
                                            <h4 className="font-bold text-lg mb-3 text-white">
                                                {t.expertsSection.finance.title}
                                            </h4>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-[#eb6e4b] text-[#eb6e4b] hover:bg-[#eb6e4b] hover:text-white bg-transparent transition-colors sm:self-start self-center w-full sm:w-auto"
                                            >
                                                {t.expertsSection.finance.btn}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* HR Course */}
                                    <div className="bg-black/20 border border-white/5 p-3 rounded-2xl flex items-center flex-col sm:flex-row gap-4 hover:bg-white/5 transition-all duration-300 group cursor-pointer">
                                        <div className="w-full sm:w-40 h-28 shrink-0 rounded-xl overflow-hidden bg-black relative border border-white/10 group-hover:border-[#eb6e4b]/50 transition-colors">
                                            <video
                                                src="/hr-manager-looking-for-resume.mp4"
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                            />
                                        </div>
                                        <div className="flex-1 w-full text-center sm:text-left flex flex-col justify-center">
                                            <h4 className="font-bold text-lg mb-3 text-white">
                                                {t.expertsSection.hr.title}
                                            </h4>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-[#eb6e4b] text-[#eb6e4b] hover:bg-[#eb6e4b] hover:text-white bg-transparent transition-colors sm:self-start self-center w-full sm:w-auto"
                                            >
                                                {t.expertsSection.hr.btn}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="relative z-10 py-16 md:py-32 bg-[#faf8f6] dark:bg-background overflow-hidden relative">
                {/* Background decorative elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-[#eb6e4b]/5 to-transparent rounded-full opacity-50 pointer-events-none blur-3xl hidden md:block"></div>
                
                <div className="container mx-auto px-4 md:px-12 max-w-6xl relative z-10">
                    <div className="text-center space-y-4 mb-12 md:mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <span className="inline-block py-1 px-4 rounded-full bg-[#eb6e4b]/10 text-[#eb6e4b] font-mono font-bold tracking-widest uppercase text-xs md:text-sm mb-2 md:mb-4">
                            Select Your Path
                        </span>
                        <h2 className="text-3xl md:text-6xl font-mono font-black text-gray-900 dark:text-white tracking-tighter">
                            {t.pricingSection.title}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
                            {t.pricingSection.subtitle}
                        </p>
                    </div>

                    {/* Asymmetrical Bento Grid Pricing */}
                    <div className="grid lg:grid-cols-12 gap-6 md:gap-8 items-center max-w-5xl mx-auto">
                        
                        {/* Individual Plan (Left, smaller, elegant) */}
                        <div className="lg:col-span-5 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-xl hover:-translate-y-1 transition-transform duration-500 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none hidden md:block">
                                <User className="w-32 h-32" />
                            </div>
                            <div className="relative z-10 flex flex-col h-full">
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.pricingSection.individualTitle}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mb-6 max-w-[250px]">{t.pricingSection.individualDesc}</p>
                                
                                <div className="flex items-start gap-1 mb-8 border-b border-gray-100 dark:border-white/10 pb-6 md:pb-8">
                                    <span className="text-5xl md:text-6xl font-black tracking-tighter text-gray-900 dark:text-white">{t.pricingSection.individualPrice}</span>
                                    <span className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium mt-2 max-w-[70px] leading-tight">{t.pricingSection.individualUnit}</span>
                                </div>
                                
                                <ul className="space-y-4 mb-8 flex-1">
                                    {t.pricingSection.individualFeatures.map((feature: string, i: number) => (
                                        <li key={i} className="flex items-center gap-3 md:gap-4 text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                                                <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-900 dark:text-white" />
                                            </div>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button asChild size="lg" className="w-full bg-transparent border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black rounded-xl md:rounded-2xl h-12 md:h-14 font-bold text-base md:text-lg transition-all duration-300 mt-auto">
                                    <a href="/connect">{t.pricingSection.individualBtn}</a>
                                </Button>
                            </div>
                        </div>

                        {/* Enterprise Plan (Right, massive, glowing) */}
                        <div className="lg:col-span-7 bg-[#0a0a0a] rounded-[2rem] md:rounded-[3rem] p-6 md:p-14 shadow-2xl relative overflow-hidden group border border-[#eb6e4b]/20 hover:border-[#eb6e4b]/50 transition-colors duration-500">
                            {/* Animated glowing orb behind */}
                            <div className="absolute -top-32 -right-32 w-72 h-72 md:w-96 md:h-96 bg-[#eb6e4b]/20 blur-[80px] md:blur-[100px] rounded-full group-hover:bg-[#eb6e4b]/40 transition-colors duration-700 pointer-events-none"></div>
                            <div className="absolute -bottom-32 -left-32 w-72 h-72 md:w-96 md:h-96 bg-[#eb6e4b]/10 blur-[80px] md:blur-[100px] rounded-full pointer-events-none"></div>
                            
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center space-x-3 mb-3 md:mb-4">
                                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">{t.pricingSection.enterpriseTitle}</h3>
                                    <span className="px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-black bg-gradient-to-r from-[#eb6e4b] to-orange-400 text-white uppercase tracking-widest shadow-[0_0_20px_rgba(235,110,75,0.4)]">Pro</span>
                                </div>
                                <p className="text-gray-400 text-xs sm:text-base md:text-lg mb-6 md:mb-8 max-w-[280px] sm:max-w-sm">{t.pricingSection.enterpriseDesc}</p>
                                
                                <div className="flex items-center gap-1 mb-6 md:mb-10 border-b border-white/10 pb-6 md:pb-8">
                                    <span className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{t.pricingSection.enterprisePrice}</span>
                                </div>
                                
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12 flex-1">
                                    {t.pricingSection.enterpriseFeatures.map((feature: string, i: number) => (
                                        <li key={i} className="flex items-center gap-3 md:gap-4 text-xs md:text-sm font-bold text-gray-200">
                                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-gradient-to-br from-[#eb6e4b] to-orange-600 flex items-center justify-center shrink-0 shadow-lg shadow-[#eb6e4b]/20">
                                                <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-white" />
                                            </div>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button asChild size="lg" className="w-full bg-[#eb6e4b] hover:bg-[#d45e3c] text-white rounded-xl md:rounded-2xl h-12 md:h-16 text-base md:text-lg font-black tracking-wide shadow-[0_0_20px_rgba(235,110,75,0.3)] md:shadow-[0_0_40px_rgba(235,110,75,0.3)] hover:shadow-[0_0_60px_rgba(235,110,75,0.5)] transition-all duration-300 translate-y-0 hover:-translate-y-1 mt-auto">
                                    <a href="/connect">{t.pricingSection.enterpriseBtn}</a>
                                </Button>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-white/10 pt-16 pb-8">
                <div className="container mx-auto px-6 md:px-12 max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
                        {/* Brand */}
                        <div className="md:col-span-1 space-y-4">
                            <div className="flex items-center gap-2 md:gap-3">
                                <img
                                    src="/logo.svg"
                                    alt="Climb AI Logo"
                                    className="w-8 h-8 object-contain"
                                />
                                <span className="font-mono font-black text-2xl tracking-tighter text-gray-900 dark:text-white">
                                    Climb AI
                                </span>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                {t.footer.description}
                            </p>
                            <div className="flex items-center gap-4 pt-2">
                                <a
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-[#eb6e4b] hover:text-white transition-colors"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                </a>
                                <a
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-[#eb6e4b] hover:text-white transition-colors"
                                >
                                    <Globe className="w-4 h-4" />
                                </a>
                                <a
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-[#eb6e4b] hover:text-white transition-colors"
                                >
                                    <Mail className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Links 1 */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-gray-900 dark:text-white">
                                {t.footer.product}
                            </h4>
                            <ul className="space-y-3">
                                <li>
                                    <a
                                        href="#"
                                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#eb6e4b] transition-colors"
                                    >
                                        {t.footer.features}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#eb6e4b] transition-colors"
                                    >
                                        {t.footer.pricing}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#eb6e4b] transition-colors"
                                    >
                                        {t.footer.experts}
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Links 2 */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-gray-900 dark:text-white">
                                {t.footer.company}
                            </h4>
                            <ul className="space-y-3">
                                <li>
                                    <a
                                        href="#"
                                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#eb6e4b] transition-colors"
                                    >
                                        {t.footer.about}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#eb6e4b] transition-colors"
                                    >
                                        {t.footer.contact}
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Links 3 */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-gray-900 dark:text-white">
                                {t.footer.legal}
                            </h4>
                            <ul className="space-y-3">
                                <li>
                                    <a
                                        href="#"
                                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#eb6e4b] transition-colors"
                                    >
                                        {t.footer.privacy}
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#eb6e4b] transition-colors"
                                    >
                                        {t.footer.terms}
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
                            © {new Date().getFullYear()} Climb AI.{" "}
                            {t.footer.rights}
                        </p>
                        <div className="flex items-center gap-2">

                            <span className="text-xs font-mono font-bold text-gray-400">
                                All systems operational
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
