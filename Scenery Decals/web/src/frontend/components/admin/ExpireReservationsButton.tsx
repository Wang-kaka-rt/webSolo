"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ExpireReservationsButton() {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function releaseExpiredReservations() {
    setIsRunning(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/reservations/expire", { method: "POST" });
      const result = (await response.json()) as { expiredCount?: number; error?: string };
      if (!response.ok) throw new Error(result.error ?? "释放库存失败，请重试。");
      setMessage(`已检查完成：释放了 ${result.expiredCount ?? 0} 条过期预约的库存。`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "释放库存失败，请重试。");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        className="rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isRunning}
        onClick={() => void releaseExpiredReservations()}
        type="button"
      >
        {isRunning ? "检查中…" : "释放过期预约"}
      </button>
      {message && <p className="text-right text-xs text-slate-500">{message}</p>}
    </div>
  );
}
