import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Users,
  Link,
  CheckCircle,
  Circle,
  Edit2,
  Send,
  X,
  Timer,
  ArrowRight,
  Crown,
  FileText,
  RefreshCw,
  Plus,
  ClipboardList,
  ExternalLink,
  Tag,
  Lightbulb,
  PenTool,
  Monitor,
  Server,
  Bug,
  Megaphone,
  Settings,
  User,
} from "lucide-react";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  createdAt: string;
  status: "pending" | "in-progress" | "completed";
  link?: string;
  completedAt?: string;
}

interface Pod {
  id: string;
  name: string;
  description?: string;
  owner?: string;
  tag?: "Feature" | "Go-Live";
  createdAt: string;
  startDate?: string;
  endDate?: string;
  estimatedDuration?: number;
  currentStage: number;
  members: Array<{
    id: string;
    name: string;
    role: string;
    taskDescription?: string;
    githubLink?: string;
    timeAllocated?: number;
    startDate?: string;
    endDate?: string;
    handoffLink: string;
    completed: boolean;
    workStartedAt: string | null;
    workCompletedAt: string | null;
    actualTimeSpent: number;
  }>;
  tasks: Task[];
  status: "planning" | "in-progress" | "completed";
  workflowOrder: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
}

interface PodDetailProps {
  pod: Pod;
  user: User;
  onBack: () => void;
  onUpdate: (pod: Pod) => void;
}

// Role icon mapping
const getRoleIcon = (role: string) => {
  switch (role) {
    case "Product":
      return Lightbulb;
    case "Design":
      return PenTool;
    case "Frontend":
      return Monitor;
    case "Backend":
      return Server;
    case "Dev": // Fallback for legacy data
      return Monitor;
    case "QA":
      return Bug;
    case "Marketing":
      return Megaphone;
    case "Operations":
      return Settings;
    default:
      return User;
  }
};

export function PodDetail({ pod, user, onBack, onUpdate }: PodDetailProps) {
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskLink, setEditingTaskLink] = useState("");
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
  });

  const getDaysActive = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDaysFromStartDate = (startDate?: string) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDaysToEndDate = (endDate?: string) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateProgress = () => {
    const completedTasks = pod.members.filter(
      (member) => member.completed
    ).length;
    return Math.round((completedTasks / pod.members.length) * 100);
  };

  const getCurrentlyWorking = () => {
    if (pod.status === "completed") return null;
    return pod.members[pod.currentStage];
  };

  const getNextMember = () => {
    const nextStage = pod.currentStage + 1;
    if (nextStage < pod.members.length) {
      return pod.members[nextStage];
    }
    return null;
  };

  const handleUpdateLink = async (memberId: string, link: string) => {
    const member = pod.members.find((m) => m.id === memberId);
    const isUpdatingExistingLink =
      member?.handoffLink && member.handoffLink.trim() !== "";

    const updatedMembers = pod.members.map((member) =>
      member.id === memberId ? { ...member, handoffLink: link } : member
    );

    onUpdate({ ...pod, members: updatedMembers });
    setEditingMember(null);
    setEditingLink("");

    // If this is a new handoff link (not updating existing), send Slack notification
    if (!isUpdatingExistingLink) {
      try {
        const response = await fetch('http://localhost:8000/api/v1/notifications/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pod: pod,
            currentMemberId: memberId,
            handoffLink: link
          })
        });

        const result = await response.json();
        
        if (result.success) {
          const nextMember = getNextMember();
          if (nextMember) {
            toast.success(`Notification sent to ${nextMember.name} on Slack`, {
              description: `${nextMember.name} has been notified that work has been handed off to them.`,
              duration: 5000,
            });
          } else {
            toast.success("Handoff link submitted successfully", {
              description: "This was the final stage of the workflow.",
              duration: 5000,
            });
          }
        } else {
          toast.error("Failed to send Slack notification", {
            description: result.message,
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('Error sending Slack notification:', error);
        toast.error("Failed to send Slack notification", {
          description: "Network error occurred while sending notification.",
          duration: 5000,
        });
      }
    } else {
      // Show appropriate toast notification for updating existing link
      toast.success("Handoff link updated successfully", {
        description: "The handoff link has been updated with the new URL.",
        duration: 5000,
      });
    }
  };

  const handleCreateTask = () => {
    if (
      !newTask.title.trim() ||
      !newTask.description.trim() ||
      !newTask.assignedTo
    ) {
      toast.error("Please fill in all task details");
      return;
    }

    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      assignedTo: newTask.assignedTo,
      assignedBy: user.name,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    const updatedTasks = [...pod.tasks, task];
    onUpdate({ ...pod, tasks: updatedTasks });

    // Reset form
    setNewTask({ title: "", description: "", assignedTo: "" });
    setShowCreateTask(false);

    // Get assigned member name for toast
    const assignedMember = pod.members.find((m) => m.id === newTask.assignedTo);
    toast.success(`Task assigned to ${assignedMember?.name}`, {
      description: `"${task.title}" has been created and assigned.`,
      duration: 5000,
    });
  };

  const handleUpdateTaskStatus = (taskId: string, status: Task["status"]) => {
    const updatedTasks = pod.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            status,
            completedAt:
              status === "completed" ? new Date().toISOString() : undefined,
          }
        : task
    );
    onUpdate({ ...pod, tasks: updatedTasks });
  };

  const handleUpdateTaskLink = (taskId: string, link: string) => {
    const updatedTasks = pod.tasks.map((task) =>
      task.id === taskId ? { ...task, link } : task
    );
    onUpdate({ ...pod, tasks: updatedTasks });
    setEditingTaskId(null);
    setEditingTaskLink("");

    toast.success("Task link updated successfully", {
      description: "The proof-of-work link has been added to the task.",
      duration: 5000,
    });
  };

  const startEditingLink = (memberId: string, currentLink: string) => {
    setEditingMember(memberId);
    setEditingLink(currentLink);
  };

  const startEditingTaskLink = (taskId: string, currentLink: string) => {
    setEditingTaskId(taskId);
    setEditingTaskLink(currentLink || "");
  };

  const cancelEditing = () => {
    setEditingMember(null);
    setEditingLink("");
    setEditingTaskId(null);
    setEditingTaskLink("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTagColor = (tag?: string) => {
    switch (tag) {
      case "Feature":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Go-Live":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTaskStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canEditMember = (member: any) => {
    return user.role === "admin" || member.name === user.name;
  };

  const canCreateTask = () => {
    return user.role === "admin" || pod.owner === user.name;
  };

  const canEditTask = (task: Task) => {
    const assignedMember = pod.members.find((m) => m.id === task.assignedTo);
    return (
      user.role === "admin" ||
      assignedMember?.name === user.name ||
      task.assignedBy === user.name
    );
  };

  const getMemberStatus = (member: any, memberIndex: number) => {
    if (member.completed) return "completed";
    if (memberIndex === pod.currentStage) return "active";
    if (memberIndex < pod.currentStage) return "completed";
    return "pending";
  };

  const canEditHandoffLink = (member: any, memberStatus: string) => {
    return (
      canEditMember(member) &&
      (memberStatus === "active" || memberStatus === "completed") &&
      editingMember !== member.id
    );
  };

  const formatTime = (days: number) => {
    if (days < 1) {
      const hours = Math.round(days * 24);
      return `${hours}h`;
    }
    return `${days.toFixed(1)}d`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTasksForMember = (memberId: string) => {
    return pod.tasks.filter((task) => task.assignedTo === memberId);
  };

  const progress = calculateProgress();
  const daysActive = getDaysActive(pod.createdAt);
  const daysFromStart = getDaysFromStartDate(pod.startDate);
  const daysToEnd = getDaysToEndDate(pod.endDate);
  const currentlyWorking = getCurrentlyWorking();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-3 flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="bridge-heading text-3xl">{pod.name}</h1>
                  <div className="flex items-center space-x-3 mt-2 flex-wrap gap-1">
                    <Badge className={getStatusColor(pod.status)}>
                      {pod?.status?.charAt(0)?.toUpperCase() +
                        pod?.status?.slice(1)}
                    </Badge>
                    {pod.tag && (
                      <Badge
                        className={`${getTagColor(pod.tag)} border`}
                        variant="outline"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {pod.tag}
                      </Badge>
                    )}
                    {pod.owner && (
                      <div className="flex items-center space-x-1 text-sm text-primary bg-primary/10 px-2 py-1 rounded-full">
                        <Crown className="h-3 w-3" />
                        <span>Owner: {pod.owner}</span>
                      </div>
                    )}
                    {pod.startDate ? (
                      <>
                        <span className="text-muted-foreground text-sm">
                          {daysFromStart} days since start
                        </span>
                        {daysToEnd > 0 ? (
                          <span className="text-muted-foreground text-sm">
                            {daysToEnd} days remaining
                          </span>
                        ) : (
                          <span className="text-destructive text-sm">
                            {Math.abs(daysToEnd)} days overdue
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="text-muted-foreground text-sm">
                          {daysActive} days active
                        </span>
                        {pod.estimatedDuration && (
                          <span className="text-muted-foreground text-sm">
                            {pod.estimatedDuration} days estimated
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {canCreateTask() && (
                  <Dialog
                    open={showCreateTask}
                    onOpenChange={setShowCreateTask}
                  >
                    <DialogTrigger asChild>
                      <Button className="flex items-center space-x-2 ml-4">
                        <Plus className="h-4 w-4" />
                        <span>Add Task</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="taskTitle">Task Title *</Label>
                          <Input
                            id="taskTitle"
                            value={newTask.title}
                            onChange={(e) =>
                              setNewTask({ ...newTask, title: e.target.value })
                            }
                            placeholder="e.g., Create wireframes"
                          />
                        </div>
                        <div>
                          <Label htmlFor="taskDescription">Description *</Label>
                          <Textarea
                            id="taskDescription"
                            value={newTask.description}
                            onChange={(e) =>
                              setNewTask({
                                ...newTask,
                                description: e.target.value,
                              })
                            }
                            placeholder="Describe what needs to be done..."
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Assign To *</Label>
                          <Select
                            value={newTask.assignedTo}
                            onValueChange={(value) =>
                              setNewTask({ ...newTask, assignedTo: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select team member" />
                            </SelectTrigger>
                            <SelectContent>
                              {pod.members.map((member) => {
                                const RoleIcon = getRoleIcon(member.role);
                                return (
                                  <SelectItem key={member.id} value={member.id}>
                                    <div className="flex items-center space-x-2">
                                      <RoleIcon className="h-4 w-4" />
                                      <span>
                                        {member.name} - {member.role}
                                      </span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowCreateTask(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleCreateTask}>
                            Create Task
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* POD Description */}
        {pod.description && (
          <Card className="p-4 mb-6">
            <h2 className="bridge-heading text-lg mb-3 flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>POD Description</span>
            </h2>
            <p className="text-gray-700 leading-relaxed">{pod.description}</p>
          </Card>
        )}

        {/* POD Timeline */}
        {(pod.startDate || pod.endDate) && (
          <Card className="p-4 mb-6">
            <h2 className="bridge-heading text-lg mb-3 flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Timeline</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Start Date</Label>
                <p className="text-gray-900 mt-1">
                  {formatDate(pod.startDate)}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">End Date</Label>
                <p className="text-gray-900 mt-1">{formatDate(pod.endDate)}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Workflow Progress */}
        <Card className="p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="bridge-heading text-lg">Workflow Progress</h2>
            <span className="text-sm text-gray-600">{progress}% Complete</span>
          </div>
          <Progress value={progress} className="h-3 mb-4" />

          {/* Workflow stages visualization */}
          <div className="flex items-center justify-between">
            {pod.workflowOrder.map((stage, index) => {
              const RoleIcon = getRoleIcon(stage);
              return (
                <React.Fragment key={stage}>
                  <div className="flex flex-col items-center space-y-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index < pod.currentStage
                          ? "bg-green-500 text-white"
                          : index === pod.currentStage
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {index < pod.currentStage ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : index === pod.currentStage ? (
                        <Timer className="h-4 w-4" />
                      ) : (
                        <RoleIcon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="text-center">
                      <div className="flex items-center space-x-1">
                        <RoleIcon className="h-3 w-3" />
                        <p className="text-sm font-medium text-gray-900">
                          {stage}
                        </p>
                      </div>
                      {index < pod.members.length && (
                        <p className="text-xs text-gray-600">
                          {pod.members[index]?.name}
                        </p>
                      )}
                    </div>
                  </div>
                  {index < pod.workflowOrder.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-3 ${
                        index < pod.currentStage
                          ? "bg-green-500"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </Card>

        {/* Currently Working */}
        {currentlyWorking && (
          <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Timer className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-blue-900">
                    {currentlyWorking.name} is currently working
                  </h3>
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const RoleIcon = getRoleIcon(currentlyWorking.role);
                      return <RoleIcon className="h-4 w-4 text-blue-700" />;
                    })()}
                    <p className="text-blue-700">
                      {currentlyWorking.role} phase • Started{" "}
                      {new Date(
                        currentlyWorking.workStartedAt!
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-medium text-blue-900">
                  {formatTime(currentlyWorking.actualTimeSpent)}
                </div>
                <div className="text-sm text-blue-700">working</div>
              </div>
            </div>
          </Card>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Team Members</p>
                <p className="text-xl text-gray-900">{pod.members.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Completed Tasks</p>
                <p className="text-xl text-gray-900">
                  {pod.members.filter((m) => m.completed).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ClipboardList className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-xl text-gray-900">{pod.tasks.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Timer className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Time Spent</p>
                <p className="text-xl text-gray-900">
                  {pod.members
                    .reduce(
                      (total, member) => total + member.actualTimeSpent,
                      0
                    )
                    .toFixed(1)}{" "}
                  days
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Team Members */}
        <Card className="p-4">
          <h2 className="bridge-heading text-lg mb-4">
            Team Members &amp; Tasks
          </h2>
          <div className="space-y-3">
            {pod.members.map((member, memberIndex) => {
              const memberStatus = getMemberStatus(member, memberIndex);
              const hasHandoffLink =
                member.handoffLink && member.handoffLink.trim() !== "";
              const memberTasks = getTasksForMember(member.id);
              const RoleIcon = getRoleIcon(member.role);

              return (
                <div
                  key={member.id}
                  className={`border rounded-lg p-3 ${
                    memberStatus === "active"
                      ? "border-blue-300 bg-blue-50"
                      : memberStatus === "completed"
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                          memberStatus === "completed"
                            ? "bg-green-500"
                            : memberStatus === "active"
                            ? "bg-blue-500"
                            : "bg-gray-400"
                        }`}
                      >
                        {memberStatus === "completed" ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : memberStatus === "active" ? (
                          <Timer className="h-5 w-5" />
                        ) : (
                          <RoleIcon className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-medium">
                          {member.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <RoleIcon className="h-3 w-3 text-gray-500" />
                          <p className="text-sm text-gray-600">{member.role}</p>
                        </div>
                        <div className="flex items-center space-x-3 mt-1">
                          <Badge
                            variant={
                              memberStatus === "completed"
                                ? "default"
                                : memberStatus === "active"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {memberStatus === "completed"
                              ? "Completed"
                              : memberStatus === "active"
                              ? "Working"
                              : "Pending"}
                          </Badge>
                          {memberStatus === "active" && (
                            <span className="text-xs text-blue-600 flex items-center">
                              <Timer className="h-3 w-3 mr-1" />
                              {formatTime(member.actualTimeSpent)} working
                            </span>
                          )}
                          {memberTasks.length > 0 && (
                            <span className="text-xs text-purple-600 flex items-center">
                              <ClipboardList className="h-3 w-3 mr-1" />
                              {memberTasks.length} task
                              {memberTasks.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-3">
                        {member.startDate && member.endDate && (
                          <div>
                            <p className="text-sm text-gray-600">Scheduled</p>
                            <p className="text-xs text-gray-900">
                              {formatDate(member.startDate)} -{" "}
                              {formatDate(member.endDate)}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-600">Actual</p>
                          <p className="text-gray-900">
                            {formatTime(member.actualTimeSpent)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Task Description */}
                  {member.taskDescription && (
                    <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                      <Label className="text-sm text-gray-700">
                        Task Description
                      </Label>
                      <p className="text-gray-900 mt-1 text-sm">
                        {member.taskDescription}
                      </p>
                    </div>
                  )}
                  {/* Github link */}
                  {member.githubLink && (
                    <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                      <Label className="text-sm text-gray-700">
                        GitHub Link
                      </Label>
                      <p className="text-gray-900 mt-1 text-sm">
                        {member.githubLink}
                      </p>
                    </div>
                  )}

                  {/* Member Tasks */}
                  {memberTasks.length > 0 && (
                    <div className="mb-3 p-2 bg-purple-50 rounded-lg">
                      <Label className="text-sm text-purple-700 mb-2 flex items-center">
                        <ClipboardList className="h-4 w-4 mr-1" />
                        Assigned Tasks ({memberTasks.length})
                      </Label>
                      <div className="space-y-2">
                        {memberTasks.map((task) => (
                          <div
                            key={task.id}
                            className="bg-white rounded p-2 border"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <p className="font-medium text-sm text-gray-900">
                                    {task.title}
                                  </p>
                                  <Badge
                                    className={getTaskStatusColor(task.status)}
                                    size="sm"
                                  >
                                    {task.status.charAt(0).toUpperCase() +
                                      task.status.slice(1)}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">
                                  {task.description}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Created by {task.assignedBy} •{" "}
                                  {formatDate(task.createdAt)}
                                </p>
                              </div>
                              {canEditTask(task) &&
                                task.status !== "completed" && (
                                  <div className="flex items-center space-x-1">
                                    {task.status === "pending" && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleUpdateTaskStatus(
                                            task.id,
                                            "in-progress"
                                          )
                                        }
                                        className="text-blue-600 hover:text-blue-800 h-6 px-2"
                                      >
                                        Start
                                      </Button>
                                    )}
                                    {task.status === "in-progress" && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleUpdateTaskStatus(
                                            task.id,
                                            "completed"
                                          )
                                        }
                                        className="text-green-600 hover:text-green-800 h-6 px-2"
                                      >
                                        Complete
                                      </Button>
                                    )}
                                  </div>
                                )}
                            </div>

                            {/* Task Link Section */}
                            {canEditTask(task) && (
                              <div className="mt-2 p-2 bg-gray-50 rounded">
                                <div className="flex items-center justify-between mb-1">
                                  <Label className="text-xs text-gray-600">
                                    Proof of Work
                                  </Label>
                                  {editingTaskId !== task.id && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        startEditingTaskLink(
                                          task.id,
                                          task.link || ""
                                        )
                                      }
                                      className="h-6 px-2 text-xs"
                                    >
                                      {task.link ? (
                                        <>
                                          <RefreshCw className="h-3 w-3 mr-1" />
                                          Update
                                        </>
                                      ) : (
                                        <>
                                          <Plus className="h-3 w-3 mr-1" />
                                          Add
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </div>

                                {editingTaskId === task.id ? (
                                  <div className="space-y-2">
                                    <Input
                                      value={editingTaskLink}
                                      onChange={(e) =>
                                        setEditingTaskLink(e.target.value)
                                      }
                                      placeholder="Enter proof-of-work link..."
                                      className="text-xs"
                                      size="sm"
                                    />
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          handleUpdateTaskLink(
                                            task.id,
                                            editingTaskLink
                                          )
                                        }
                                        disabled={!editingTaskLink.trim()}
                                        className="h-6 px-2 text-xs"
                                      >
                                        <Send className="h-3 w-3 mr-1" />
                                        Save
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={cancelEditing}
                                        className="h-6 px-2 text-xs"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    {task.link ? (
                                      <a
                                        href={task.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-xs"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                        <span className="truncate">
                                          {task.link}
                                        </span>
                                      </a>
                                    ) : (
                                      <span className="text-gray-400 text-xs">
                                        No proof-of-work link provided
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Handoff Link Section */}
                  <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-gray-700">
                        Handoff Link
                      </Label>
                      {canEditHandoffLink(member, memberStatus) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            startEditingLink(member.id, member.handoffLink)
                          }
                          className="flex items-center space-x-1"
                        >
                          {hasHandoffLink ? (
                            <>
                              <RefreshCw className="h-3 w-3" />
                              <span>Update</span>
                            </>
                          ) : (
                            <>
                              <Edit2 className="h-3 w-3" />
                              <span>Add</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {editingMember === member.id ? (
                      <div className="space-y-2 mt-2">
                        <Input
                          value={editingLink}
                          onChange={(e) => setEditingLink(e.target.value)}
                          placeholder="Enter handoff link..."
                          className="flex-1"
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-600">
                            {hasHandoffLink
                              ? "Updating existing handoff link"
                              : "Adding new handoff link"}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleUpdateLink(member.id, editingLink)
                              }
                              disabled={!editingLink.trim()}
                              className="flex items-center space-x-1"
                            >
                              {hasHandoffLink ? (
                                <>
                                  <RefreshCw className="h-3 w-3" />
                                  <span>Update</span>
                                </>
                              ) : (
                                <>
                                  <Send className="h-3 w-3" />
                                  <span>Submit</span>
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={cancelEditing}
                              className="flex items-center space-x-1"
                            >
                              <X className="h-3 w-3" />
                              <span>Cancel</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        {hasHandoffLink ? (
                          <div className="space-y-1">
                            <a
                              href={member.handoffLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                            >
                              <Link className="h-4 w-4" />
                              <span className="truncate">
                                {member.handoffLink}
                              </span>
                            </a>
                            {memberStatus === "completed" &&
                              canEditMember(member) && (
                                <p className="text-xs text-gray-500">
                                  Click "Update" to change this link if needed
                                </p>
                              )}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            {memberStatus === "active"
                              ? "Waiting for handoff link..."
                              : "No handoff link provided"}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Time tracking */}
                  {member.workStartedAt && (
                    <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center text-sm">
                        <div>
                          <span className="text-gray-600">Started: </span>
                          <span className="text-gray-900">
                            {new Date(member.workStartedAt).toLocaleString()}
                          </span>
                        </div>
                        {member.workCompletedAt && (
                          <div>
                            <span className="text-gray-600">Completed: </span>
                            <span className="text-gray-900">
                              {new Date(
                                member.workCompletedAt
                              ).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
