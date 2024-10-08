"use client";

import Image from "next/image";
import dashy from "./assets/Dashy-All-Logo-White.png";
import { Button } from "@/app/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
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
import Link from "next/link";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={"Loading..."}>
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <section className="w-full py-6 bg-[#161B19] flex justify-center">
            <div className="container px-4 md:px-6">
              <div className="flex items-center justify-between">
                <Image src={dashy} alt={"dashy"} width={135} />
                <div className="flex flex-row gap-4">
                  <Link href="/dashboard">
                    <Button className="custom-button-dashboard !bg-[#06d6a0] !text-[#000000] !w-32 hover:!bg-[#33e7b8] hover:!text-[#003628]">
                      Launch App
                    </Button>
                  </Link>
                  {/* TODO: ADD youtube link */}
                  <Button className="custom-button-dashboard !bg-[#06d6a0] !text-[#000000] !w-32 hover:!bg-[#33e7b8] hover:!text-[#003628]">
                    Product Demo
                  </Button>
                </div>
              </div>
            </div>
          </section>
          {/* Hero Section */}
          <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-[#161B19] flex justify-center">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center space-y-8 text-center">
                <div className="space-y-4">
                  <h1 className="text-2xl font-semibold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Welcome to{" "}
                    <span className="font-bold text-7xl text-[#009770]">
                      Dashy
                    </span>
                  </h1>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                    Manage your entire Solana portfolio with ease while <br />
                    preventing intermixing of your wallet clusters
                  </p>
                </div>
                <div className="flex flex-row gap-4">
                  <Link href="/dashboard">
                    <Button className="custom-button-dashboard p-4">
                      Get Started
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Button
                    className="border border-[#06d6a0] hover:bg-[#06402B]"
                    onClick={() =>
                      document.getElementById("faq")?.scrollIntoView()
                    }
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="w-full py-12 md:py-24 lg:py-32 bg-[#009770] flex justify-center">
            <div className="container px-4 md:px-6">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
                Why Choose Dashy?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <BarChart2 className="w-10 h-10 mb-2 text-primary" />
                    <CardTitle>Prevent Cross-mixing Between Wallets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Manage your portfolio across different wallets based on
                      their purpose while ensuring your funds don’t intermix
                      with each other.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Lock className="w-10 h-10 mb-2 text-primary" />
                    <CardTitle>Secure Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Everything is stored within browser’s local storage,
                      ensuring that only you have full control over your
                      settings and wallet details.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Zap className="w-10 h-10 mb-2 text-primary" />
                    <CardTitle>Customize & Personalize Clusters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Organize your cluster with personalized tags and a
                      drag-and-drop feature.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section
            id="faq"
            className="w-full py-12 md:py-24 lg:py-32 bg-[#161B19] flex justify-center"
          >
            <div className="container px-4 md:px-6">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
                How It Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                    1
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    Create a Wallet Cluster
                  </h3>
                  <p>
                    Set up a cluster for your wallet group and enter your wallet
                    addresses to manage your assets.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                    2
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    Personalize Your Cluster
                  </h3>
                  <p>
                    Organize your cluster using personalized tags and intuitive
                    drag-and-drop features.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                    3
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    Whitelist Receiver Address
                  </h3>
                  <p>
                    Secure your transactions by adding a receiver address to
                    your cluster, ensuring that you never send funds to the
                    wrong wallet.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="w-full py-12 md:py-24 lg:py-32 bg-[#009770]  flex justify-center">
            <div className="container px-4 md:px-6">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
                What Our Users Say
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Amazing Tool!</CardTitle>
                    <CardDescription>
                      John D., Solana Enthusiast
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      &quot;Dashy has revolutionized how I manage my Solana
                      assets. The insights are invaluable!&quot;
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>User-Friendly and Powerful</CardTitle>
                    <CardDescription>Sarah M., Crypto Investor</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      &quot;I love how easy it is to use Dashy. It&apos;s both
                      powerful and intuitive - perfect for beginners and pros
                      alike.&quot;
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="w-full py-12 md:py-24 lg:py-32 bg-[#161B19] flex justify-center">
            <div className="container px-4 md:px-6">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">
                Frequently Asked Questions
              </h2>
              <Accordion
                type="single"
                collapsible
                className="w-full max-w-3xl mx-auto"
              >
                <AccordionItem value="item-1">
                  <AccordionTrigger>Is Dashy free to use?</AccordionTrigger>
                  <AccordionContent>
                    Yes, Dashy offers a free tier that provides basic features
                    for users. Additionally, we have premium plans available for
                    advanced users, which will be introduced in the future.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>How secure is Dashy?</AccordionTrigger>
                  <AccordionContent>
                    Dashy prioritizes your security and privacy. Your wallet
                    configurations are stored locally in your browser, ensuring
                    only you have control over your settings and details.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    How does Dashy help me manage my wallets and avoid
                    confusion?
                  </AccordionTrigger>
                  <AccordionContent>
                    Dashy allows you to whitelist specific wallets for sending
                    or receiving funds. This feature minimizes the risk of using
                    the wrong wallet and helps maintain your privacy by
                    preventing cross-referencing of different wallets.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    Does Dashy offer the option to export settings?
                  </AccordionTrigger>
                  <AccordionContent>
                    Yes, Dashy provides the capability to export your settings
                    in JSON format. This feature facilitates the seamless
                    transfer of your configurations to another browser, allowing
                    you to continue your work without interruption.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </section>

          {/* CTA Section */}
          <section className="w-full py-12 md:py-24 lg:py-32 bg-[#009770] text-primary-foreground  flex justify-center">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                    Ready to Take Control of Your Solana Assets?
                  </h2>
                  <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl">
                    Join thousands of users who are already benefiting from
                    Dashy&apos;s powerful features.
                  </p>
                </div>
                <div className="space-x-4">
                  <Link href="/dashboard">
                    <Button className="custom-button-dashboard p-4">
                      Get Started
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="w-full py-6 bg-[#161B19] flex justify-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="flex gap-4 text-sm">
                <a className="underline">About</a>
                <a className="underline">Privacy Policy</a>
                <a className="underline">Terms of Service</a>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © 2024 Dashy. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Suspense>
  );
}
