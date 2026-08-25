"use client";
import { User } from "@/type";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Loading from "@/components/loading";
import Info from "../components/info";
import Skills from "../components/skills";
import PageBackground from "@/components/page-background";

const UserAccount = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { id } = useParams();

  async function fetchUser() {
    const token = Cookies.get("token");
    try {
      const { data } = await axios.get(`/api/user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, [id]);

  if (loading) return <Loading />;
  return (
    <div className="relative min-h-screen">
      <PageBackground />
      {user && (
        <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
          <Info user={user} isYourAccount={false} />
          {user.role === "jobseeker" && (
            <Skills user={user} isYourAccount={false} />
          )}
        </div>
      )}
    </div>
  );
};

export default UserAccount;
