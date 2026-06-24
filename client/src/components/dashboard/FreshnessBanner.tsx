import React from "react";
import { Clock, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { computeDecayedFreshnessConfidence } from "./freshnessDecay";

interface FreshnessBannerProps {
  lastUpdated?: string;
  confidence?: number;
  isPartial?: boolean;
  isEstimated?: boolean;
}

export const FreshnessBanner: React.FC<FreshnessBannerProps> = ({
  lastUpdated,
  confidence,
  isPartial,
  isEstimated,
}) => {
  // If no lastUpdated, represent unknown / estimated state
  if (!lastUpdated) {
    return (
      <div className="glass-panel border border-dashed border-gray-600/50 bg-gray-500/5 p-4 flex items-center justify-between gap-3 text-gray-400">
        <div className="flex items-center gap-2">
          <Info size={16} className="text-gray-400 shrink-0" />
          <span className="text-sm font-medium">
            {isEstimated
              ? "Estimated System Projections"
              : isPartial
              ? "Partial / Incomplete Yield Data"
              : "Unknown Freshness Status"}
          </span>
        </div>
        <span className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 bg-white/5 rounded text-gray-400">
          Estimated / No Timestamp
        </span>
      </div>
    );
  }

  const parsedTime = new Date(lastUpdated);
  const isInvalidDate = Number.isNaN(parsedTime.getTime());

  if (isInvalidDate) {
    return (
      <div className="glass-panel border border-red-500/30 bg-red-500/10 p-4 flex items-center gap-2 text-red-400">
        <AlertTriangle size={16} className="shrink-0" />
        <span className="text-sm">Invalid timestamp provided for data freshness check.</span>
      </div>
    );
  }

  const ageMs = Date.now() - parsedTime.getTime();
  const calculated = computeDecayedFreshnessConfidence(ageMs);
  const finalConfidence = confidence !== undefined ? confidence : calculated.confidence;
  const isStale = finalConfidence < 0.5 || calculated.unusable;

  return (
    <div
      className={`glass-panel border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
        isStale
          ? "border-red-500/30 bg-red-500/10 text-red-300"
          : finalConfidence < 0.8
          ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
          : "border-green-500/30 bg-green-500/10 text-green-300"
      }`}
      role="status"
    >
      <div className="flex items-start sm:items-center gap-2.5">
        {isStale ? (
          <AlertTriangle size={18} className="shrink-0 mt-0.5 sm:mt-0 text-red-400" />
        ) : finalConfidence < 0.8 ? (
          <Info size={18} className="shrink-0 mt-0.5 sm:mt-0 text-yellow-400" />
        ) : (
          <CheckCircle size={18} className="shrink-0 mt-0.5 sm:mt-0 text-green-400" />
        )}
        <div>
          <p className="text-sm font-semibold">
            {isStale
              ? "Stale DeFi Market Data"
              : isPartial
              ? "Partial Live Data Stream"
              : isEstimated
              ? "Estimated System Projections"
              : "Live Market Sync Active"}
          </p>
          <p className="text-xs opacity-80 mt-0.5">
            Synced: {parsedTime.toLocaleTimeString()} ({Math.max(0, Math.round(ageMs / 60000))}m ago) · Confidence score:{" "}
            {Math.round(finalConfidence * 100)}%
          </p>
        </div>
      </div>
      <span
        className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full self-start sm:self-auto ${
          isStale
            ? "bg-red-500/25 border border-red-500/40 text-red-300"
            : finalConfidence < 0.8
            ? "bg-yellow-500/25 border border-yellow-500/40 text-yellow-300"
            : "bg-green-500/25 border border-green-500/40 text-green-300"
        }`}
      >
        {isStale ? "Stale" : finalConfidence < 0.8 ? "Decayed" : "Fresh"}
      </span>
    </div>
  );
};
