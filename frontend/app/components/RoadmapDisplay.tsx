"use client"
import React, { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Edit, Save, XCircle, CheckCircle2, Plus, Trash2, ThumbsUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { type Roadmap, type RoadmapStep } from "./GenerateRoadmap"

interface RoadmapDisplayProps {
  initialRoadmap: Roadmap;
  currentUserId: string | undefined;
  isCompact?: boolean;
  onFullViewRequest?: (roadmap: Roadmap) => void;
}

export default function RoadmapDisplay({ initialRoadmap, currentUserId, isCompact = false, onFullViewRequest }: RoadmapDisplayProps) {
  const [roadmap, setRoadmap] = useState<Roadmap>(initialRoadmap);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRoadmap, setEditedRoadmap] = useState<Roadmap>(initialRoadmap);
  const roadmapRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);

  const [localUpvotes, setLocalUpvotes] = useState(roadmap.upvotes || 0);

  const handleDownloadPdf = async () => {
    if (!roadmapRef.current) return;
    setIsDownloading(true);

    // Temporarily apply white styles for PDF export
    const el = roadmapRef.current;
    const originalStyle = el.getAttribute('style') || '';
    const originalClasses = el.className;
    
    // Apply white PDF styles
    el.style.backgroundColor = '#ffffff';
    el.style.color = '#0f172a';
    el.style.padding = '24px';
    el.style.borderRadius = '16px';
    el.className = '';
    
    // Also style inner elements for PDF
    const stepCards = el.querySelectorAll('[data-step-card]') as NodeListOf<HTMLElement>;
    const originalCardStyles: string[] = [];
    stepCards.forEach((card, i) => {
      originalCardStyles[i] = card.getAttribute('style') || '';
      card.style.border = '1px solid #e2e8f0';
      card.style.borderRadius = '12px';
      card.style.backgroundColor = '#ffffff';
    });
    
    const allText = el.querySelectorAll('h2, h3, span, p') as NodeListOf<HTMLElement>;
    const originalTextColors: string[] = [];
    allText.forEach((txt, i) => {
      originalTextColors[i] = txt.style.color;
      txt.style.color = '#0f172a';
    });

    const mutedText = el.querySelectorAll('[data-task-text]') as NodeListOf<HTMLElement>;
    const originalMutedColors: string[] = [];
    mutedText.forEach((txt, i) => {
      originalMutedColors[i] = txt.style.color;
      txt.style.color = '#374151';
    });

    try {
      const canvas = await html2canvas(el, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const ratio = imgWidth / imgHeight;

      let widthInPdf = pdfWidth - 10;
      let heightInPdf = widthInPdf / ratio;

      if (heightInPdf > pdfHeight - 10) {
        heightInPdf = pdfHeight - 10;
        widthInPdf = heightInPdf * ratio;
      }

      const x = (pdfWidth - widthInPdf) / 2;
      const y = 5;

      pdf.addImage(imgData, 'PNG', x, y, widthInPdf, heightInPdf);
      pdf.save(`${roadmap.goal.replace(/\s+/g, "_") || "roadmap"}.pdf`);

    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      // Restore original dark styles
      el.setAttribute('style', originalStyle);
      el.className = originalClasses;
      stepCards.forEach((card, i) => {
        card.setAttribute('style', originalCardStyles[i] || '');
      });
      allText.forEach((txt, i) => {
        txt.style.color = originalTextColors[i] || '';
      });
      mutedText.forEach((txt, i) => {
        txt.style.color = originalMutedColors[i] || '';
      });
      setIsDownloading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!editedRoadmap || !editedRoadmap.id || !currentUserId) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/roadmaps/${editedRoadmap.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roadmap_json: editedRoadmap,
          user_id: currentUserId,
        })
      });

      if (!response.ok) throw new Error('Failed to save changes');

      const data = await response.json();
      const newRoadmap = {
        ...data.roadmap.roadmap_json,
        id: data.roadmap.id,
        upvotes: data.roadmap.upvotes,
        user_id: data.roadmap.user_id
      }
      setRoadmap(newRoadmap);
      setEditedRoadmap(newRoadmap);
      setIsEditing(false);

    } catch (error) {
      console.error('Save changes error:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpvote = async () => {
    if (!roadmap.id || !currentUserId) {
      alert("Please sign in to upvote.");
      return;
    }

    setIsUpvoting(true);
    try {
      const response = await fetch(`/api/roadmaps/${roadmap.id}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUserId })
      });

      if (!response.ok) throw new Error('Failed to toggle upvote');

      const data = await response.json();
      setLocalUpvotes(data.new_upvote_count);

    } catch (error) {
      console.error('Upvote error:', error);
      alert('Failed to submit upvote.');
    } finally {
      setIsUpvoting(false);
    }
  }

  const handleEditChange = (phaseIndex: number, taskIndex: number, value: string) => {
    setEditedRoadmap(prev => {
      const newSteps = [...prev.steps];
      newSteps[phaseIndex].tasks[taskIndex] = value;
      return { ...prev, steps: newSteps };
    });
  };

  const handlePhaseTitleChange = (phaseIndex: number, value: string) => {
    setEditedRoadmap(prev => {
      const newSteps = [...prev.steps];
      newSteps[phaseIndex].title = value;
      return { ...prev, steps: newSteps };
    });
  };

  const handleAddTask = (stepIndex: number) => {
    setEditedRoadmap(prev => {
      const newSteps = [...prev.steps];
      newSteps[stepIndex].tasks.push("New task");
      return { ...prev, steps: newSteps };
    });
  };

  const handleRemoveTask = (stepIndex: number, taskIndex: number) => {
    setEditedRoadmap(prev => {
      const newSteps = [...prev.steps];
      newSteps[stepIndex].tasks.splice(taskIndex, 1);
      return { ...prev, steps: newSteps };
    });
  };

  const handleAddStep = () => {
    setEditedRoadmap(prev => ({
      ...prev,
      steps: [...prev.steps, { title: "New Step", tasks: ["New task"] }]
    }));
  };

  const canEdit = currentUserId && currentUserId === roadmap.user_id;
  const currentSteps = (isEditing ? editedRoadmap : roadmap)?.steps;

  if (isCompact) {
    return (
      <Card
        key={roadmap.id}
        className="glass-card rounded-xl cursor-pointer hover:border-white/[0.12] transition-shadow duration-200"
        onClick={() => onFullViewRequest && onFullViewRequest(roadmap)}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            {roadmap.goal}
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-xs font-medium text-[#4dfce0]">
              <ThumbsUp className="w-3.5 h-3.5 mr-1" />
              {localUpvotes}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#64748b] truncate">
            {currentSteps?.[0]?.tasks?.[0] || 'Click to view details...'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!roadmap || roadmap.error || !currentSteps || currentSteps.length === 0) {
    return (
        <div className="space-y-8 p-6 glass-card rounded-xl border-red-400/20">
          <h2 className="text-2xl font-bold text-red-400">
            {roadmap?.goal || 'Generation Error'}
          </h2>
          <p className="text-[#94a3b8] text-sm">
            {roadmap?.steps?.[0]?.tasks?.[0] || 'Roadmap data is invalid or missing steps.'}
          </p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleUpvote}
            disabled={isUpvoting || !currentUserId}
            variant="outline"
            className="font-medium"
          >
            <ThumbsUp className="w-4 h-4 mr-2 text-[#4dfce0]" />
            {localUpvotes}
          </Button>
          {canEdit && (
            isEditing ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedRoadmap(roadmap);
                  }}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Plan
              </Button>
            )
          )}
        </div>
        <Button variant="outline" onClick={handleDownloadPdf} disabled={isDownloading}>
          <Download className="mr-2 h-4 w-4" />
          {isDownloading ? "Downloading..." : "Download PDF"}
        </Button>
      </div>

      {/* Roadmap display — dark on screen, temporarily white for PDF export */}
      <div ref={roadmapRef} className="glass-card rounded-xl">
        <div className="space-y-6 p-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">
              {isEditing ? (
                <Input
                  value={editedRoadmap?.goal || ""}
                  onChange={(e) =>
                    setEditedRoadmap((prev) => ({ ...prev, goal: e.target.value }))
                  }
                  className="text-3xl font-bold text-center border-none shadow-none bg-transparent h-auto"
                />
              ) : (
                roadmap.goal
              )}
            </h2>
          </div>
          <div className="grid gap-4">
            {currentSteps.map((step, stepIndex: number) => (
              <div
                key={stepIndex}
                data-step-card
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5"
              >
                <div className="mb-4">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={step.title}
                        onChange={(e) =>
                          handlePhaseTitleChange(stepIndex, e.target.value)
                        }
                        className="text-xl font-bold h-10"
                      />
                      <Button variant="outline" onClick={() => handleAddTask(stepIndex)} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <h3 className="text-xl font-bold text-foreground">
                      <span className="text-[#4dfce0] mr-2">Step {stepIndex + 1}:</span>
                      {step.title}
                    </h3>
                  )}
                </div>
                <div className="grid gap-3">
                  {step.tasks.map((task, taskIndex) => (
                    <div key={taskIndex} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-[#4dfce0]" />
                      {isEditing ? (
                        <div className="flex-1 flex items-center gap-2">
                          <Textarea
                            value={task}
                            onChange={(e) =>
                              handleEditChange(stepIndex, taskIndex, e.target.value)
                            }
                            className="leading-relaxed min-h-[60px]"
                          />
                          <Button
                            onClick={() => handleRemoveTask(stepIndex, taskIndex)}
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-500 hover:bg-red-400/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span data-task-text className="text-sm leading-relaxed text-[#94a3b8]">
                          {task}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {isEditing && (
              <div className="text-center">
                <Button variant="outline" onClick={handleAddStep}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Step
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}