import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, User as UserIcon, KeyRound } from "lucide-react";
import api from "../lib/api";
import { useAuthStore } from "../store/authStore";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [profileMsg, setProfileMsg] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (user) setFullName(user.fullName);
  }, [user]);

  const profileMutation = useMutation({
    mutationFn: async () => (await api.put("/users/me", { fullName })).data,
    onSuccess: (data) => {
      // Keep the persisted store in sync so the header updates immediately.
      if (user) setUser({ ...user, fullName: data.fullName });
      setProfileMsg("Profile updated.");
    },
    onError: (err: any) =>
      setProfileMsg(err?.response?.data?.message ?? "Update failed."),
  });

  const passwordMutation = useMutation({
    mutationFn: async () =>
      api.put("/users/me/password", { currentPassword, newPassword }),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setPwMsg({ ok: true, text: "Password changed." });
    },
    onError: (err: any) =>
      setPwMsg({
        ok: false,
        text: err?.response?.data?.message ?? "Password change failed.",
      }),
  });

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>

      {/* Profile info */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="flex items-center font-semibold text-slate-800">
          <UserIcon className="w-5 h-5 mr-2 text-indigo-600" /> Account
        </h2>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            value={user?.email ?? ""}
            disabled
            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Full Name
          </label>
          <input
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setProfileMsg("");
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {profileMsg && <p className="text-sm text-slate-600">{profileMsg}</p>}
        <button
          onClick={() => fullName.trim() && profileMutation.mutate()}
          disabled={!fullName.trim() || profileMutation.isPending}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
        >
          {profileMutation.isPending && (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          )}
          Save
        </button>
      </section>

      {/* Change password */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="flex items-center font-semibold text-slate-800">
          <KeyRound className="w-5 h-5 mr-2 text-indigo-600" /> Change Password
        </h2>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Current Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              setPwMsg(null);
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            New Password (min 6 chars)
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setPwMsg(null);
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {pwMsg && (
          <p className={pwMsg.ok ? "text-sm text-emerald-600" : "text-sm text-red-600"}>
            {pwMsg.text}
          </p>
        )}
        <button
          onClick={() =>
            currentPassword && newPassword.length >= 6 && passwordMutation.mutate()
          }
          disabled={
            !currentPassword ||
            newPassword.length < 6 ||
            passwordMutation.isPending
          }
          className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium disabled:opacity-50"
        >
          {passwordMutation.isPending && (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          )}
          Update Password
        </button>
      </section>
    </div>
  );
}
