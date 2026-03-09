"use client";

import React from "react";
import {ModeToggle} from "../mode-toggle";
import {LanguageSwitcher} from "../language-switcher";

export const Header: React.FC = () => {

    return (
        <header
            className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-8"></div>
                <div className="flex items-center gap-4">
                    <ModeToggle/>
                    <LanguageSwitcher/>
                </div>
            </div>
        </header>
    );
};
