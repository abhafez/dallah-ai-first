"use client";

import React from "react";
import { Header } from "@/components/layout/header";

export default function DemoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <section className="text-center space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              Layout Demo
            </h1>
            <p className="text-xl text-muted-foreground">
              This page demonstrates the new Header and Footer components with
              the provided logo.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl border bg-card shadow-sm space-y-4">
              <h2 className="text-2xl font-bold">Header Features</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Sticky positioning</li>
                <li>Glassmorphism (backdrop-blur)</li>
                <li>Logo integration</li>
                <li>Language switcher</li>
                <li>Theme toggle</li>
                <li>Responsive navigation</li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl border bg-card shadow-sm space-y-4">
              <h2 className="text-2xl font-bold">Footer Features</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Clean hierarchical layout</li>
                <li>Logo and branding</li>
                <li>Social links placeholders</li>
                <li>Legal links and copyright</li>
                <li>Responsive grid system</li>
              </ul>
            </div>
          </div>

          <section className="p-8 rounded-2xl border bg-muted/50 text-center">
            <p className="font-medium">Scroll down to see the footer!</p>
          </section>

          {/* Add some vertical space to test sticky header and see footer */}
          <div className="h-[100vh]" />
        </div>
      </main>
    </div>
  );
}
