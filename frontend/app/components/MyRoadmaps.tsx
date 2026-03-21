"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Loader2, XCircle, ThumbsUp, Map, Target, TrendingUp, Sparkles, ArrowLeft } from "lucide-react";
import RoadmapDisplay from "./RoadmapDisplay";
import { type Roadmap } from "./GenerateRoadmap";
import { Session } from "next-auth";

interface RoadmapFromDB {
  id: string;
  goal: string;
  roadmap_json: Roadmap;
  user_id: string;
  upvotes: number;
}

interface MyRoadmapsProps {
  session: Session | null;
  isFullyAuthenticated: boolean;
}

export default function MyRoadmaps({ session, isFullyAuthenticated }: MyRoadmapsProps) {
  const [myRoadmaps, setMyRoadmaps] = useState<RoadmapFromDB[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);

  const fetchMyRoadmaps = useCallback(() => {
    if (isFullyAuthenticated && session?.user?.email) {
      setIsLoading(true);
      fetch("/api/roadmaps/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: session.user.email }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch roadmaps");
          return res.json();
        })
        .then((data) => {
          setMyRoadmaps(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError((err as Error).message);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [isFullyAuthenticated, session?.user?.email]);

  useEffect(() => {
    fetchMyRoadmaps();
  }, [fetchMyRoadmaps]);

  const handleBackToList = () => {
    setSelectedRoadmap(null);
    fetchMyRoadmaps();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-10 w-10 animate-spin text-[#4dfce0]" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400 text-sm">Error: {error}</p>;
  }

  if (!isFullyAuthenticated) {
    return (
      <p className="text-[#94a3b8] text-sm">
        Please sign in to see your saved roadmaps.
      </p>
    );
  }

  if (selectedRoadmap) {
    return (
      <div className="space-y-4">
        <button
          onClick={handleBackToList}
          className="flex items-center text-[#64748b] hover:text-[#4dfce0] font-medium mb-4 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to My List
        </button>
        <RoadmapDisplay initialRoadmap={selectedRoadmap} currentUserId={session?.user?.email ?? ""} />
      </div>
    );
  }

  if (myRoadmaps && myRoadmaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 rounded-2xl glass-accent flex items-center justify-center mb-4">
          <Map className="w-8 h-8 text-[#4dfce0]" />
        </div>
        <p className="text-[#94a3b8] text-sm">
          You haven&apos;t generated any roadmaps yet. Go to the &quot;Generate New&quot; tab to create one!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {myRoadmaps?.map((roadmap, index) => {
        const icons = [Target, TrendingUp, Sparkles, Map];
        const Icon = icons[index % icons.length];
        const gradients = [
          "from-[#4dfce0]/60 to-[#3ab8a8]/60",
          "from-purple-400/60 to-pink-500/60",
          "from-blue-400/60 to-cyan-500/60",
          "from-emerald-400/60 to-green-500/60",
        ];
        const gradient = gradients[index % gradients.length];

        return (
          <div
            key={roadmap.id}
            onClick={() =>
              setSelectedRoadmap({
                ...roadmap.roadmap_json,
                id: roadmap.id,
                upvotes: roadmap.upvotes,
                user_id: roadmap.user_id,
              })
            }
            className="group relative glass-card rounded-xl cursor-pointer hover:border-white/[0.12] transition-all duration-300 overflow-hidden aspect-square flex flex-col"
          >
            <div className={`h-28 bg-linear-to-br ${gradient} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
              <div className="absolute top-4 right-4">
                <Icon className="w-10 h-10 text-white opacity-80" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white opacity-10 rounded-full" />
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white opacity-5 rounded-full" />
            </div>

            <div className="flex-1 p-5 flex flex-col justify-between">
              <div>
                <h3
                  className="text-base font-semibold text-foreground mb-3 line-clamp-3 group-hover:text-[#4dfce0] transition-colors"
                >
                  {roadmap.goal}
                </h3>
                <div className="flex items-center gap-4 text-xs text-[#64748b]">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{roadmap.upvotes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Map className="w-3.5 h-3.5" />
                    <span>Roadmap</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <div
                  className="text-[#4dfce0] font-medium text-center text-sm group-hover:text-[#3ae0c6] transition-colors flex items-center justify-center gap-2"
                >
                  View Full Roadmap
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
