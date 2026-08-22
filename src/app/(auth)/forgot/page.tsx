"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthShell from "@/components/auth-shell";
import { useAppData } from "@/context/AppContext";
import axios from "axios";
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { FormEvent, useState } from "react";
import toast from "react-hot-toast";

const ForgotPage = () => {
  const [email, setemail] = useState("");
  const [btnLoading, setbtnLoading] = useState(false);
  const { isAuth } = useAppData();

  if (isAuth) return redirect("/");

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setbtnLoading(true);
    try {
      const { data } = await axios.post(`/api/auth/forgot`, {
        email,
      });

      toast.success(data.message);
      setemail("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Request failed");
    } finally {
      setbtnLoading(false);
    }
  };

  return (
    <AuthShell
      title="Forgot Password"
      subtitle="We'll send a reset link to your email"
    >
      <form onSubmit={submitHandler} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-zinc-400">Email</Label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setemail(e.target.value)}
            required
          />
        </div>
        <Button disabled={btnLoading} className="w-full" size="lg">
          {btnLoading ? "Sending…" : "Send Reset Link"}
        </Button>
      </form>
      <Link
        className="mt-4 inline-block text-sm text-orange-400 hover:text-orange-300"
        href="/login"
      >
        Back to login
      </Link>
    </AuthShell>
  );
};

export default ForgotPage;
