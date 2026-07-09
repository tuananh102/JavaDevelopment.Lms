import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  ShieldCheck,
  UserX,
  UserCheck,
} from "lucide-react";
import api from "../../lib/api";
import { useAuthStore } from "../../store/authStore";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ManagedUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  active: boolean;
}

const ROLE_STYLE: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  INSTRUCTOR: "bg-indigo-100 text-indigo-700",
  STUDENT: "bg-slate-100 text-slate-600",
};

export default function AdminPage() {
  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <div className="flex items-center space-x-3">
        <ShieldCheck className="w-7 h-7 text-purple-600" />
        <h1 className="text-3xl font-bold text-slate-900">Admin</h1>
      </div>
      <CategoriesSection />
      <UsersSection />
    </div>
  );
}

function CategoriesSection() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(
    null,
  );

  const { data: categories = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get<Category[]>("/categories")).data,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  const onError = (err: any) =>
    alert(err?.response?.data?.message ?? "Something went wrong.");

  const createMutation = useMutation({
    mutationFn: async (name: string) => api.post("/categories", { name }),
    onSuccess: () => {
      setNewName("");
      invalidate();
    },
    onError,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) =>
      api.put(`/categories/${id}`, { name }),
    onSuccess: () => {
      setEditing(null);
      invalidate();
    },
    onError,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/categories/${id}`),
    onSuccess: invalidate,
    onError,
  });

  return (
    <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h2 className="font-semibold text-slate-800">Categories</h2>
      </div>

      <div className="p-6 space-y-3">
        {isLoading ? (
          <div className="flex items-center text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading...
          </div>
        ) : isError ? (
          <div className="text-red-600 text-sm">
            Failed to load categories.{" "}
            <button onClick={() => refetch()} className="underline">
              Retry
            </button>
          </div>
        ) : (
          categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-2 border border-slate-200 rounded-lg px-4 py-2"
            >
              {editing?.id === c.id ? (
                <>
                  <input
                    value={editing.name}
                    autoFocus
                    onChange={(e) =>
                      setEditing({ ...editing, name: e.target.value })
                    }
                    className={inputCls + " flex-1"}
                  />
                  <button
                    onClick={() =>
                      editing.name.trim() &&
                      updateMutation.mutate({
                        id: c.id,
                        name: editing.name.trim(),
                      })
                    }
                    disabled={updateMutation.isPending}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-md"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="min-w-0">
                    <span className="font-medium text-slate-800">{c.name}</span>
                    <span className="ml-2 text-xs text-slate-400">/{c.slug}</span>
                  </div>
                  <div className="flex items-center shrink-0">
                    <button
                      onClick={() => setEditing({ id: c.id, name: c.name })}
                      className="p-2 text-slate-400 hover:text-blue-600 rounded-md"
                      title="Rename"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete category "${c.name}"?`))
                          deleteMutation.mutate(c.id);
                      }}
                      disabled={deleteMutation.isPending}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-md"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}

        {/* Add category */}
        <div className="flex items-center gap-2 pt-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New category name"
            className={inputCls + " flex-1"}
          />
          <button
            onClick={() => newName.trim() && createMutation.mutate(newName.trim())}
            disabled={!newName.trim() || createMutation.isPending}
            className="flex items-center px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-50"
          >
            <Plus className="w-4 h-4 mr-1" /> Add
          </button>
        </div>
      </div>
    </section>
  );
}

function UsersSection() {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((s) => s.user?.id);

  const { data: users = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => (await api.get<ManagedUser[]>("/users")).data,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) =>
      api.patch(`/users/${id}/status`, null, { params: { active } }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
    onError: (err: any) =>
      alert(err?.response?.data?.message ?? "Failed to update user."),
  });

  return (
    <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h2 className="font-semibold text-slate-800">Users</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
        </div>
      ) : isError ? (
        <div className="py-12 text-center text-red-600 text-sm">
          Failed to load users.{" "}
          <button onClick={() => refetch()} className="underline">
            Retry
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {users.map((u) => (
            <div
              key={u.id}
              className="px-6 py-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 truncate">
                    {u.fullName}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_STYLE[u.role] ?? ROLE_STYLE.STUDENT}`}
                  >
                    {u.role}
                  </span>
                  {!u.active && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                      Disabled
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 truncate">{u.email}</p>
              </div>
              {u.id !== currentUserId && (
                <button
                  onClick={() =>
                    statusMutation.mutate({ id: u.id, active: !u.active })
                  }
                  disabled={statusMutation.isPending}
                  className={
                    "flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors shrink-0 " +
                    (u.active
                      ? "text-red-700 hover:bg-red-50"
                      : "text-emerald-700 hover:bg-emerald-50")
                  }
                >
                  {u.active ? (
                    <>
                      <UserX className="w-4 h-4 mr-1" /> Deactivate
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 mr-1" /> Activate
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const inputCls =
  "px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";
