"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dashy from "./assets/Dashy-All-Logo-White.png";
import { Button } from "@/app/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/Card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/Accordion";
import { ArrowRight, BarChart2, Lock, Zap } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "hero",
        "features",
        "how-it-works",
        "testimonials",
        "faq",
        "cta",
      ];
      const currentSection = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md">
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Image src={dashy} alt="Dashy" width={135} height={40} />
          <div className="flex space-x-4">
            <Link href="/dashboard">
              <Button className="bg-[var(--accent-color)] text-[var(--text-color-dark)] hover:bg-[var(--accent-hover-color)] hover:text-[#003628] uppercase font-bold">
                Launch App
              </Button>
            </Link>
            <Link
              href="https://youtu.be/YHcSe2FCF8M"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[var(--button-hover-bg)]"
              >
                Product Demo
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <section
          id="hero"
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-[#161B19]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#009770]/20 to-transparent" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center space-y-8"
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tighter">
              Welcome to{" "}
              <span className="text-[var(--accent-hover-color)]">Dashy</span>
            </h1>
            <p className="text-xl sm:text-2xl text-[var(--text-color-muted)] max-w-2xl mx-auto">
              Manage your entire Solana portfolio with ease while preventing
              intermixing of your wallet clusters
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/dashboard">
                <Button className="bg-[var(--accent-color)] text-[var(--text-color-dark)] hover:bg-[var(--accent-hover-color)] hover:text-[#003628] px-8 py-3 text-lg">
                  Get Started
                  <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border-[var(--accent-color)] text-[var(--accent-color)] hover:bg-[var(--button-hover-bg)] px-8 py-3 text-lg"
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </section>

        <section id="features" className="py-24 bg-[var(--bg-secondary)]">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16">
              Why Choose Dashy?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: BarChart2,
                  title: "Prevent Cross-mixing",
                  description:
                    "Manage your portfolio across different wallets based on their purpose while ensuring your funds don't intermix.",
                },
                {
                  icon: Lock,
                  title: "Secure Management",
                  description:
                    "Everything is stored within browser's local storage, ensuring that only you have full control over your settings and wallet details.",
                },
                {
                  icon: Zap,
                  title: "Customize & Personalize",
                  description:
                    "Organize your cluster with personalized tags and a drag-and-drop feature.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full bg-[var(--bg-primary-transparent)] border-none drop-shadow-lg backdrop-blur-lg bg-opacity-80 hover:shadow-lg hover:shadow-[var(--accent-color)]/20 transition-all duration-300">
                    <CardHeader>
                      <feature.icon className="w-12 h-12 text-[var(--accent-color)] mb-4" />
                      <CardTitle className="text-2xl font-bold">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[var(--text-color-muted)]">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-24 bg-[var(--bg-primary)]">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: 1,
                  title: "Create a Wallet Cluster",
                  description:
                    "Set up a cluster for your wallet group and enter your wallet addresses to manage your assets.",
                },
                {
                  step: 2,
                  title: "Personalize Your Cluster",
                  description:
                    "Organize your cluster using personalized tags and intuitive drag-and-drop features.",
                },
                {
                  step: 3,
                  title: "Whitelist Receiver Address",
                  description:
                    "Secure your transactions by adding a receiver address to your cluster, ensuring that you never send funds to the wrong wallet.",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] text-[var(--bg-primary)] flex items-center justify-center text-2xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-[var(--text-color-muted)]">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-24 bg-[var(--bg-secondary)]">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16">
              What Our Users Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  name: "John D.",
                  role: "Solana Enthusiast",
                  quote:
                    "Dashy has revolutionized how I manage my Solana assets. The insights are invaluable!",
                },
                {
                  name: "Sarah M.",
                  role: "Crypto Investor",
                  quote:
                    "I love how easy it is to use Dashy. It's both powerful and intuitive - perfect for beginners and pros alike.",
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full bg-[var(--bg-primary-transparent)] border-none drop-shadow-lg backdrop-blur-lg bg-opacity-80 hover:shadow-lg hover:shadow-[var(--accent-color)]/20 transition-all duration-300">
                    <CardContent className="p-6">
                      <p className="text-xl mb-4">
                        &quot;{testimonial.quote}&quot;
                      </p>
                      <p className="font-bold">{testimonial.name}</p>
                      <p className="text-sm text-[var(--text-color-muted)]">
                        {testimonial.role}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="py-24 bg-[var(--bg-primary)]">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-16">
              Frequently Asked Questions
            </h2>
            <Accordion
              type="single"
              collapsible
              className="w-full max-w-3xl mx-auto"
            >
              {[
                {
                  question: "Is Dashy free to use?",
                  answer:
                    "Yes, Dashy offers a free tier that provides basic features for users. Additionally, we have premium plans available for advanced users, which will be introduced in the future.",
                },
                {
                  question: "How secure is Dashy?",
                  answer:
                    "Dashy prioritizes your security and privacy. Your wallet configurations are stored locally in your browser, ensuring only you have control over your settings and details.",
                },
                {
                  question:
                    "How does Dashy help me manage my wallets and avoid confusion?",
                  answer:
                    "Dashy allows you to whitelist specific wallets for sending or receiving funds. This feature minimizes the risk of using the wrong wallet and helps maintain your privacy by preventing cross-referencing of different wallets.",
                },
                {
                  question: "Does Dashy offer the option to export settings?",
                  answer:
                    "Yes, Dashy provides the capability to export your settings in JSON format. This feature facilitates the seamless transfer of your configurations to another browser, allowing you to continue your work without interruption.",
                },
              ].map((item, index) => (
                <AccordionItem key={index} value={`item-${index + 1}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section id="cta" className="py-24 bg-[var(--bg-secondary)]">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-8">
              <h2 className="text-4xl font-bold">
                Ready to Take Control of Your Solana Assets?
              </h2>
              <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                Join thousands of users who are already benefiting from
                Dashy&apos;s powerful features.
              </p>
              <Link href="/dashboard">
                <Button className="mt-4 bg-[var(--bg-primary-transparent)] text-[var(--accent-color)] border-none drop-shadow-lg backdrop-blur-lg bg-opacity-80 hover:bg-[var(--accent-color)] hover:text-[var(--bg-primary)] px-8 py-3 text-lg">
                  Get Started
                  <ArrowRight className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[var(--bg-primary)] py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <p className="text-sm text-gray-400">
              © 2024 Dashy. All rights reserved.
            </p>
            <Link
              href="https://x.com/LetsDashy"
              target="_blank"
              className="text-[var(--text-color-muted)] hover:text-[var(--accent-color)] transition-colors"
            >
              <FontAwesomeIcon icon={faXTwitter} className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
