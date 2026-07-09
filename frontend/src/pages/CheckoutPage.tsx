import { useParams, useNavigate, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldCheck, ArrowLeft, CreditCard } from "lucide-react";
import api from "../lib/api";

interface Order {
  id: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  amount: number;
  status: string;
}

export default function CheckoutPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Create-or-reuse a pending order for this course. The backend is idempotent
  // (returns the existing PENDING order), so running this on mount is safe.
  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["checkout", courseId],
    queryFn: async () => {
      const res = await api.post<Order>(`/payments/courses/${courseId}`);
      return res.data;
    },
    enabled: !!courseId,
    retry: false,
  });

  const payMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<Order>(`/payments/${order!.id}/confirm`);
      return res.data;
    },
    onSuccess: (paid) => {
      queryClient.invalidateQueries({ queryKey: ["enrollment", courseId] });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      // Back to the course page, now enrolled → "Continue Learning".
      navigate(`/courses/${paid.courseSlug}`);
    },
    onError: (err: any) =>
      alert(err?.response?.data?.message ?? "Payment failed. Please try again."),
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Preparing checkout...
      </div>
    );

  if (isError) {
    // Most common: already enrolled, or the course is free — send them back to the course.
    const msg =
      (error as any)?.response?.data?.message ??
      "Unable to start checkout for this course.";
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <p className="text-slate-700">{msg}</p>
        <Link
          to="/"
          className="inline-block text-indigo-600 hover:underline font-medium"
        >
          Back to catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <Link
        to={`/courses/${order?.courseSlug}`}
        className="inline-flex items-center text-slate-500 hover:text-slate-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to course
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h1 className="font-semibold text-slate-800 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-indigo-600" /> Checkout
          </h1>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500">You're buying</p>
              <p className="font-bold text-slate-900">{order?.courseTitle}</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">${order?.amount}</p>
          </div>

          {/* Simulated card form — not wired to any gateway, for demo only. */}
          <div className="space-y-3 opacity-90">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Card number
              </label>
              <input
                disabled
                value="4242 4242 4242 4242"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                disabled
                value="12 / 34"
                className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
              />
              <input
                disabled
                value="CVC 123"
                className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
              />
            </div>
          </div>

          <div className="flex items-start text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <ShieldCheck className="w-4 h-4 mr-2 text-amber-600 shrink-0 mt-0.5" />
            Đây là thanh toán MÔ PHỎNG cho mục đích demo — không có giao dịch thật.
            Bấm nút bên dưới để hoàn tất và ghi danh.
          </div>

          <button
            onClick={() => payMutation.mutate()}
            disabled={payMutation.isPending || order?.status === "PAID"}
            className="w-full flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-60"
          >
            {payMutation.isPending && (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            )}
            Pay ${order?.amount}
          </button>
        </div>
      </div>
    </div>
  );
}
