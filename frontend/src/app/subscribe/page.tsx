"use client";
import useRazorpay from "@/components/scriptLoader";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { payment_service, useAppData } from "@/context/AppContext";
import toast from "react-hot-toast";
import Loading from "@/components/loading";
import { CheckCircle, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageBackground from "@/components/page-background";
import { glassCardSm } from "@/lib/brand";
import { cn } from "@/lib/utils";

const SubscriptionPage = () => {
  const razorpayLoaded = useRazorpay();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { setUser } = useAppData();

  const handleSubscribe = async () => {
    const token = Cookies.get("token");
    setLoading(true);
    try {
      const {
        data: { order },
      } = await axios.post(
        `${payment_service}/api/payment/checkout`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const options = {
        key: "rzp_test_RaL8PDo9YBejEW",
        amount: order.id,
        currency: "INR",
        name: "nextHire",
        description: "Pro subscription",
        order_id: order.id,
        handler: async function (response: any) {
          const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            response;
          try {
            const { data } = await axios.post(
              `${payment_service}/api/payment/verify`,
              { razorpay_order_id, razorpay_payment_id, razorpay_signature },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(data.message);
            setUser(data.updatedUser);
            router.push(`/payment/success/${razorpay_payment_id}`);
          } catch (error: any) {
            toast.error(error.response?.data?.message || "Payment failed");
          } finally {
            setLoading(false);
          }
        },
        theme: { color: "#0ea5e9" },
      };
      if (!razorpayLoaded) toast.error("Razorpay failed to load");
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Checkout failed");
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  const features = [
    "Priority application visibility",
    "Premium support",
    "Advanced career insights",
  ];

  return (
    <div className="relative min-h-screen py-16">
      <PageBackground />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
        
          <h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">
            Choose your plan
          </h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className={cn(glassCardSm, "p-8")}>
            <h2 className="text-xl font-semibold text-white">Free</h2>
            <p className="mt-4 text-4xl font-bold text-zinc-100">₹0</p>
            <p className="text-sm text-zinc-500">/ month</p>
            <ul className="mt-6 space-y-3 text-sm text-zinc-400">
              <li className="flex gap-2">
                <CheckCircle className="text-orange-400" size={18} /> Browse jobs
              </li>
              <li className="flex gap-2">
                <CheckCircle className="text-orange-400" size={18} /> Resume
                analyzer
              </li>
              <li className="flex gap-2">
                <CheckCircle className="text-orange-400" size={18} /> Career
                guide
              </li>
            </ul>
          </div>

          <div
            className={cn(
              glassCardSm,
              "relative border-orange-500/40 p-8 shadow-lg shadow-orange-500/10"
            )}
          >
            <span className="absolute -top-3 right-6 rounded-full bg-orange-500 px-3 py-1 text-xs font-medium text-black">
              Popular
            </span>
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
              <Crown className="text-orange-400" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-white">Pro</h2>
            <p className="mt-4 text-4xl font-bold text-orange-400">₹119</p>
            <p className="text-sm text-zinc-500">/ month</p>
            <ul className="mt-6 space-y-3 text-sm text-zinc-300">
              {features.map((f) => (
                <li key={f} className="flex gap-2">
                  <CheckCircle className="shrink-0 text-orange-400" size={18} />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              onClick={handleSubscribe}
              className="mt-8 w-full gap-2 bg-sky-500 text-white hover:bg-sky-400"
              size="lg"
            >
              <Crown size={18} /> Pay with Razorpay
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
