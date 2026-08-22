"use client";

import { AppContextType, Application, AppProviderProps, User } from "@/type";
import React, { createContext, useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  const getToken = () => Cookies.get("token");

  async function fetchUser() {
    const authToken = Cookies.get("token");

    if (!authToken || authToken === "undefined") {
      Cookies.remove("token");
      setIsAuth(false);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get(`/api/user/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setUser(data);
      setIsAuth(true);
    } catch (error) {
      console.log(error);
      Cookies.remove("token");
      setIsAuth(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfilePic(fromData: any) {
    const authToken = Cookies.get("token");
    setLoading(true);
    try {
      const { data } = await axios.put(
        `/api/user/update/pic`,
        fromData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      toast.success(data.message);
      fetchUser();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateResume(fromData: any) {
    const authToken = Cookies.get("token");
    setLoading(true);
    try {
      const { data } = await axios.put(
        `/api/user/update/resume`,
        fromData,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      toast.success(data.message);
      fetchUser();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateUser(name: string, phoneNumber: string, bio: string) {
    setBtnLoading(true);
    try {
      const { data } = await axios.put(
        `/api/user/update/profile`,
        { name, phoneNumber, bio },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      toast.success(data.message);
      fetchUser();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  }

  async function logoutUser() {
    Cookies.remove("token");
    setUser(null);
    setIsAuth(false);
    toast.success("Logged out successfully");
  }

  async function addSkill(
    skill: string,
    setSkill: React.Dispatch<React.SetStateAction<string>>
  ) {
    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `/api/user/skill/add`,
        { skillName: skill },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      toast.success(data.message);
      setSkill("");
      fetchUser();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  }

  async function removeSkill(skill: string) {
    try {
      const { data } = await axios.put(
        `/api/user/skill/delete`,
        { skillName: skill },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      toast.success(data.message);
      fetchUser();
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  }

  async function applyJob(job_id: number) {
    if (user?.role !== "jobseeker") {
      toast.error("Only job seekers can apply");
      return;
    }
    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `/api/user/apply/job`,
        { job_id },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      toast.success(data.message);
      fetchApplications();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  }

  const [applications, setApplications] = useState<Application[]>([]);

  async function fetchApplications() {
    const authToken = getToken();
    if (!authToken || authToken === "undefined") return;

    try {
      const { data } = await axios.get(
        `/api/user/application/all`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      setApplications(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchUser();
    const authToken = Cookies.get("token");
    if (authToken && authToken !== "undefined") {
      fetchApplications();
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        btnLoading,
        setUser,
        isAuth,
        setIsAuth,
        setLoading,
        logoutUser,
        updateProfilePic,
        updateResume,
        updateUser,
        addSkill,
        removeSkill,
        applyJob,
        applications,
        fetchApplications,
      }}
    >
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3200,
          style: {
            background: "#18181b",
            color: "#f4f4f5",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "12px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
          },
          success: {
            iconTheme: { primary: "#f97316", secondary: "#18181b" },
          },
          error: {
            iconTheme: { primary: "#fb7185", secondary: "#18181b" },
          },
          loading: {
            iconTheme: { primary: "#f97316", secondary: "#18181b" },
          },
        }}
      />
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within AppProvider");
  }
  return context;
};
