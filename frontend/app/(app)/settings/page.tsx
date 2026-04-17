"use client";

export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UserProfile = {
  email: string;
  auth_provider: string;
  created_at: string;
};

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setProfile({
          email: user.email ?? "",
          auth_provider: user.app_metadata?.provider ?? "email",
          created_at: user.created_at,
        });
      }
      setLoading(false);
    }

    loadProfile();
  }, [supabase]);

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
      <p className="text-gray-500 text-sm mb-8">Manage your account</p>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 divide-y divide-gray-800">
        {/* Profile section */}
        <div className="p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Profile
          </h2>

          {loading ? (
            <div className="space-y-3">
              <div className="h-4 w-48 rounded bg-gray-800 animate-pulse" />
              <div className="h-4 w-32 rounded bg-gray-800 animate-pulse" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email</label>
                <p className="text-sm text-gray-300">{profile?.email}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Sign-in method</label>
                <p className="text-sm text-gray-300 capitalize">{profile?.auth_provider}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Member since</label>
                <p className="text-sm text-gray-300">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Danger zone */}
        <div className="p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Session
          </h2>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="rounded-lg border border-red-800 bg-red-900/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </div>
  );
}
