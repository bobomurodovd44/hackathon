"use client";

import { ConnectForm } from "@/components/connect-form";
import { useTranslation, I18nProvider } from "@/i18n/provider";

function ConnectPageContent() {
    const { t } = useTranslation();

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a
                        href="/"
                        className="flex items-center gap-2 font-medium text-xl"
                    >
                        <img
                            src="/logo.svg"
                            alt="Climb AI Logo"
                            className="w-8 h-8 object-contain"
                        />
                        Climb AI
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-md">
                        <ConnectForm />
                    </div>
                </div>
            </div>
            <div className="relative hidden bg-muted lg:block">
                <img
                    src="/mega-creator.svg"
                    alt="Illustration"
                    className="absolute inset-0 h-full w-full object-contain p-12 dark:opacity-80"
                    style={{ filter: "hue-rotate(-10deg) saturate(1.5)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 to-transparent flex items-end p-12">
                    <div className="text-white relative z-10">
                        <h2 className="text-3xl font-bold mb-2 font-mono">
                            {t.connect.pageTitle}
                        </h2>
                        <p className="text-gray-300 max-w-md">
                            {t.connect.pageDesc}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ConnectPage() {
    return (
        <I18nProvider>
            <ConnectPageContent />
        </I18nProvider>
    );
}
