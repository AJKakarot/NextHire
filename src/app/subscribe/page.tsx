"use client";
import useRazorpay from "@/components/scriptLoader";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useAppData } from "@/context/AppContext";
import toast from "react-hot-toast";
import PageBackground from "@/components/page-background";
import Link from "next/link";
import RecruiterAway from "@/components/recruiter-away";

function RazorpayMark({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center font-bold tracking-tight ${className ?? ""}`}
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <span className="text-sky-400">razor</span>
      <span className="text-white">pay</span>
    </span>
  );
}

const SubscriptionPage = () => {
  const razorpayLoaded = useRazorpay();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const { setUser, user, isAuth } = useAppData();

  const isPro = Boolean(
    user?.subscription && new Date(user.subscription).getTime() > Date.now()
  );

  const handleSubscribe = async () => {
    if (!isAuth) {
      router.push("/login");
      return;
    }
    if (isPro) {
      toast.success("You're already on Pro");
      router.push("/account");
      return;
    }

    const token = Cookies.get("token");
    setBusy(true);
    try {
      const {
        data: { order },
      } = await axios.post(
        `/api/payment/checkout`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const options = {
        key:
          process.env.NEXT_PUBLIC_RAZORPAY_KEY ||
          process.env.Razorpay_Key ||
          "rzp_test_RaL8PDo9YBejEW",
        amount: order.amount,
        currency: "INR",
        name: "nextHire",
        description: "Pro subscription",
        order_id: order.id,
        handler: async function (response: any) {
          const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            response;
          try {
            const { data } = await axios.post(
              `/api/payment/verify`,
              { razorpay_order_id, razorpay_payment_id, razorpay_signature },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(data.message);
            setUser(data.updatedUser);
            router.push(`/payment/success/${razorpay_payment_id}`);
          } catch (error: any) {
            toast.error(error.response?.data?.message || "Payment failed");
          } finally {
            setBusy(false);
          }
        },
        theme: { color: "#0ea5e9" },
      };
      if (!razorpayLoaded) {
        toast.error("Razorpay failed to load");
        setBusy(false);
        return;
      }
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setBusy(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Checkout failed");
      setBusy(false);
    }
  };

  return (
    <div className="relative bg-black">
      <PageBackground />
      <section className="relative border-t border-white/[0.04] py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-3 sm:px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl lg:text-4xl">
              Simple pricing
            </h1>
            <p className="mt-3 text-sm text-zinc-400 sm:mt-4 sm:text-base">
              Start free. Upgrade when you&apos;re ready to move faster.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-5 sm:mt-12 sm:gap-6 md:grid-cols-2">
            <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 transition-all duration-300 hover:border-white/[0.12] sm:p-8">
              <h2 className="text-lg font-semibold text-white">Free</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                ₹0
                <span className="text-base font-normal text-zinc-500">/mo</span>
              </p>
              <ul className="mt-8 flex flex-col gap-3 text-sm text-zinc-400">
                <li className="flex gap-2">
                  <span className="text-orange-500/90">✓</span> Browse and apply
                  to jobs
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500/90">✓</span> Resume ATS score
                  &amp; summary
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500/90">✓</span> AI career guide
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500/90">✓</span> Recruiter: post
                  jobs &amp; companies
                </li>
              </ul>
              <Link
                href={isAuth ? "/jobs" : "/register"}
                className="mt-8 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-white/15 text-sm font-medium text-white transition-all duration-300 hover:border-orange-500/40 hover:bg-orange-500/[0.08] sm:mt-10"
              >
                {isAuth ? "Open app" : "Get started"}
              </Link>
            </div>

            <div className="relative flex flex-col rounded-2xl border border-orange-500/40 bg-gradient-to-b from-orange-500/[0.08] to-transparent p-6 shadow-[0_0_50px_-18px_rgba(249,115,22,0.35)] transition-all duration-300 hover:border-orange-400/55 sm:p-8">
              <span className="mb-2 w-fit rounded-full bg-orange-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black">
                Popular
              </span>
              <h2 className="text-lg font-semibold text-white">Pro</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                ₹119
                <span className="text-base font-normal text-zinc-500">/mo</span>
              </p>
              <ul className="mt-8 flex flex-col gap-3 text-sm text-zinc-300">
                <li className="flex gap-2">
                  <span className="text-orange-400">✓</span> Everything in Free
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-400">✓</span> Priority
                  application visibility
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-400">✓</span> Premium support
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-400">✓</span> Advanced career
                  insights
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-400">✓</span> Gemini polish
                </li>
              </ul>

              <button
                type="button"
                onClick={handleSubscribe}
                disabled={busy}
                className={
                  isPro && isAuth
                    ? "mt-6 min-h-[48px] w-full rounded-xl border border-emerald-500/45 bg-emerald-500/15 px-3 text-sm font-semibold text-emerald-100 transition-all hover:bg-emerald-500/25 disabled:opacity-60 sm:mt-8"
                    : "mt-6 min-h-[48px] w-full rounded-xl border border-sky-500/40 bg-sky-500/15 px-3 text-sm font-semibold text-sky-100 transition-all hover:bg-sky-500/25 disabled:opacity-60 sm:mt-8"
                }
              >
                {busy ? (
                  "Opening…"
                ) : isPro && isAuth ? (
                  "Continue — you're on Pro"
                ) : (
                  <span className="inline-flex items-center justify-center gap-2">
                    Pay with <RazorpayMark className="text-base" />
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default function SubscribeRoute() {
  return (
    <RecruiterAway>
      <SubscriptionPage />
    </RecruiterAway>
  );
}
