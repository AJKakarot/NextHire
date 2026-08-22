"use client";
import { auth_service, useAppData } from "@/context/AppContext";
import axios from "axios";
import { redirect } from "next/navigation";
import React, { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { Label } from "@/components/ui/label";
import { ArrowRight, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loading from "@/components/loading";
import AuthShell from "@/components/auth-shell";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  const { isAuth, setUser, loading, setIsAuth, fetchApplications } =
    useAppData();

  if (loading) return <Loading />;

  if (isAuth) return redirect("/");

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setBtnLoading(true);
    try {
      const { data } = await axios.post(`${auth_service}/api/auth/login`, {
        email,
        password,
      });

      toast.success(data.message);

      Cookies.set("token", data.token, {
        expires: 15,
        secure: false,
        path: "/",
      });
      setUser(data.userObject);
      setIsAuth(true);
      fetchApplications();
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Login failed");
      setIsAuth(false);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your journey"
    >
      <form onSubmit={submitHandler} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-400">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="icon-style" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-zinc-400">
            Password
          </Label>
          <div className="relative">
            <Lock className="icon-style" />
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Link
            href="/forgot"
            className="text-sm text-orange-400 transition-colors hover:text-orange-300"
          >
            Forgot Password?
          </Link>
        </div>

        <Button disabled={btnLoading} className="w-full" size="lg">
          {btnLoading ? "Signing in..." : "Sign In"}
          <ArrowRight size={18} />
        </Button>
      </form>

      <div className="mt-6 border-t border-white/10 pt-6">
        <p className="text-center text-sm text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-orange-400 hover:text-orange-300"
          >
            Create account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default LoginPage;
