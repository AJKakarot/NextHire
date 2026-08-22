"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthShell from "@/components/auth-shell";
import { auth_service, useAppData } from "@/context/AppContext";
import axios from "axios";
import Link from "next/link";
import { redirect, useParams } from "next/navigation";
import React, { FormEvent, useState } from "react";
import toast from "react-hot-toast";

const ResetPage = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [btnLoading, setbtnLoading] = useState(false);
  const { isAuth } = useAppData();

  if (isAuth) return redirect("/");

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setbtnLoading(true);
    try {
      const { data } = await axios.post(
        `${auth_service}/api/auth/reset/${token}`,
        { password }
      );

      toast.success(data.message);
      setPassword("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Reset failed");
    } finally {
      setbtnLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset Password"
      subtitle="Choose a new password for your account"
    >
      <form onSubmit={submitHandler} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-zinc-400">New Password</Label>
          <Input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button disabled={btnLoading} className="w-full" size="lg">
          {btnLoading ? "Updating…" : "Update Password"}
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

export default ResetPage;
