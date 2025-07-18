import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import {
  ArrowLeft,
  Plus,
  X,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Undo2,
  Calendar,
  User,
  Tag,
  Lightbulb,
  PenTool,
  Monitor,
  Server,
  Bug,
  Megaphone,
  Settings,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
}

interface CreatePodProps {
  user: User;
  onBack: () => void;
  onCreatePod: (podData: any) => void;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  taskDescription: string;
  startDate: string;
  endDate: string;
  githubLink: string; // Added
  handoffLink: string;
  completed: boolean;
}

// Mock company employees
const companyEmployees = [
  { id: "1", name: "Ayush Kumar", defaultRole: "Design" },
  { id: "2", name: "Dhruv Patel", defaultRole: "Product" },
  { id: "3", name: "Mona Singh", defaultRole: "Frontend" },
  { id: "4", name: "Hansal Shah", defaultRole: "Backend" },
  { id: "5", name: "Ammaar Ali", defaultRole: "QA" },
  { id: "6", name: "Sarah Johnson", defaultRole: "Product" },
  { id: "7", name: "Alex Chen", defaultRole: "Frontend" },
  { id: "8", name: "Maya Rodriguez", defaultRole: "QA" },
  { id: "9", name: "Priya Sharma", defaultRole: "Design" },
  { id: "10", name: "Rahul Verma", defaultRole: "Backend" },
  { id: "11", name: "John Doe", defaultRole: "Product" },
  { id: "12", name: "Emily Davis", defaultRole: "Design" },
  { id: "13", name: "Michael Brown", defaultRole: "QA" },
];

const roleOptions = [
  "Product",
  "Design",
  "Frontend",
  "Backend",
  "QA",
  "Marketing",
  "Operations",
];

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

export function CreatePod({ user, onBack, onCreatePod }: CreatePodProps) {
  const [podName, setPodName] = useState("");
  const [podDescription, setPodDescription] = useState("");
  const [podOwner, setPodOwner] = useState("");
  const [podTag, setPodTag] = useState<"Feature" | "Go-Live">("Feature");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [workflowOrder, setWorkflowOrder] = useState<string[]>([
    "Product",
    "Design",
    "Frontend",
    "Backend",
    "QA",
  ]);
  const [workflowHistory, setWorkflowHistory] = useState<string[][]>([
    ["Product", "Design", "Frontend", "Backend", "QA"],
  ]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [memberStartDate, setMemberStartDate] = useState("");
  const [memberEndDate, setMemberEndDate] = useState("");
  const [githubLink, setGithubLink] = useState(""); // Added
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddMember = () => {
    if (
      !selectedEmployee ||
      !selectedRole ||
      !taskDescription ||
      !memberStartDate ||
      !memberEndDate ||
      !githubLink
    ) {
      setErrors({
        member: "Please fill in all member details",
      });
      return;
    }

    const employee = companyEmployees.find(
      (emp) => emp.id === selectedEmployee
    );
    if (!employee) return;

    // Validate dates
    if (new Date(memberStartDate) >= new Date(memberEndDate)) {
      setErrors({
        member: "End date must be after start date",
      });
      return;
    }

    const newMember: TeamMember = {
      id: `${selectedEmployee}-${Date.now()}`,
      name: employee.name,
      role: selectedRole,
      taskDescription: taskDescription.trim(),
      startDate: memberStartDate,
      endDate: memberEndDate,
      githubLink: githubLink.trim(), // Added
      handoffLink: "",
      completed: false,
    };

    setMembers([...members, newMember]);
    handleAddToWorkflow(selectedRole);

    // Reset form
    setSelectedEmployee("");
    setSelectedRole("");
    setTaskDescription("");
    setMemberStartDate("");
    setMemberEndDate("");
    setGithubLink(""); // Added
    setErrors({});
  };

  const handleRemoveMember = (memberId: string) => {
    const memberToRemove = members.find((m) => m.id === memberId);
    setMembers(members.filter((member) => member.id !== memberId));

    // Check if this was the last member of this role
    if (memberToRemove) {
      const remainingMembersWithRole = members.filter(
        (m) => m.id !== memberId && m.role === memberToRemove.role
      );
      if (remainingMembersWithRole.length === 0) {
        handleRemoveFromWorkflow(memberToRemove.role);
      }
    }
  };

  const handleUpdateMember = (
    memberId: string,
    field: string,
    value: string
  ) => {
    setMembers(
      members.map((member) =>
        member.id === memberId ? { ...member, [field]: value } : member
      )
    );
  };

  const saveWorkflowHistory = () => {
    setWorkflowHistory([...workflowHistory, [...workflowOrder]]);
  };

  const handleAddToWorkflow = (role: string) => {
    if (!workflowOrder.includes(role)) {
      saveWorkflowHistory();
      setWorkflowOrder([...workflowOrder, role]);
    }
  };

  const handleRemoveFromWorkflow = (role: string) => {
    saveWorkflowHistory();
    setWorkflowOrder(workflowOrder.filter((r) => r !== role));
  };

  const handleMoveWorkflowItem = (index: number, direction: "up" | "down") => {
    saveWorkflowHistory();
    const newOrder = [...workflowOrder];
    if (direction === "up" && index > 0) {
      [newOrder[index - 1], newOrder[index]] = [
        newOrder[index],
        newOrder[index - 1],
      ];
    } else if (direction === "down" && index < newOrder.length - 1) {
      [newOrder[index], newOrder[index + 1]] = [
        newOrder[index + 1],
        newOrder[index],
      ];
    }
    setWorkflowOrder(newOrder);
  };

  const handleUndoWorkflow = () => {
    if (workflowHistory.length > 1) {
      const newHistory = [...workflowHistory];
      newHistory.pop(); // Remove current state
      const previousState = newHistory[newHistory.length - 1];
      setWorkflowOrder([...previousState]);
      setWorkflowHistory(newHistory);
    }
  };

  const validateAndSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!podName.trim()) {
      newErrors.podName = "POD name is required";
    }

    if (!podDescription.trim()) {
      newErrors.podDescription = "POD description is required";
    }

    if (!podOwner.trim()) {
      newErrors.podOwner = "POD owner is required";
    }

    if (!startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!endDate) {
      newErrors.endDate = "End date is required";
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    if (members.length === 0) {
      newErrors.members = "At least one team member is required";
    }

    if (workflowOrder.length === 0) {
      newErrors.workflow = "At least one workflow stage is required";
    }

    // Check if all workflow stages have assigned members
    const missingMembers = workflowOrder.filter(
      (role) => !members.some((member) => member.role === role)
    );
    if (missingMembers.length > 0) {
      newErrors.workflow = `Missing team members for: ${missingMembers.join(
        ", "
      )}`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const podData = {
      name: podName.trim(),
      description: podDescription.trim(),
      owner: podOwner.trim(),
      tag: podTag,
      startDate,
      endDate,
      members,
      workflowOrder,
    };

    onCreatePod(podData);
  };

  const availableEmployees = companyEmployees; // Allow selecting the same employee multiple times

  const getMembersCountByRole = (role: string) => {
    return members.filter((member) => member.role === role).length;
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case "Feature":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Go-Live":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-3 flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-3xl text-gray-900">Create New POD</h1>
              <p className="text-muted-foreground mt-1">
                Set up a new project handoff team
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="p-4">
            <h2 className="text-lg mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="podName">POD Name *</Label>
                  <Input
                    id="podName"
                    value={podName}
                    onChange={(e) => setPodName(e.target.value)}
                    placeholder="e.g., Mobile App Redesign"
                    className={errors.podName ? "border-red-500" : ""}
                  />
                  {errors.podName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.podName}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="podOwner">POD Owner *</Label>
                  <Input
                    id="podOwner"
                    value={podOwner}
                    onChange={(e) => setPodOwner(e.target.value)}
                    placeholder="e.g., John Doe"
                    className={errors.podOwner ? "border-red-500" : ""}
                  />
                  {errors.podOwner && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.podOwner}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="podTag">POD Tag *</Label>
                <div className="flex items-center space-x-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setPodTag("Feature")}
                    className={`px-3 py-2 rounded-md border transition-colors ${
                      podTag === "Feature"
                        ? "bg-blue-100 text-blue-800 border-blue-300"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4" />
                      <span>Feature</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPodTag("Go-Live")}
                    className={`px-3 py-2 rounded-md border transition-colors ${
                      podTag === "Go-Live"
                        ? "bg-purple-100 text-purple-800 border-purple-300"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4" />
                      <span>Go-Live</span>
                    </div>
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Choose whether this POD is for a new feature development or a
                  go-live deployment
                </p>
              </div>

              <div>
                <Label htmlFor="podDescription">POD Description *</Label>
                <Textarea
                  id="podDescription"
                  value={podDescription}
                  onChange={(e) => setPodDescription(e.target.value)}
                  placeholder="Describe what this POD is about and what work will be done..."
                  className={errors.podDescription ? "border-red-500" : ""}
                  rows={3}
                />
                {errors.podDescription && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.podDescription}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={errors.startDate ? "border-red-500" : ""}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.startDate}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={errors.endDate ? "border-red-500" : ""}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Add Team Members */}
          <Card className="p-4">
            <h2 className="text-lg text-gray-900 mb-4">Add Team Members</h2>

            {/* Add Member Form */}
            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Select Employee *</Label>
                  <Select
                    value={selectedEmployee}
                    onValueChange={setSelectedEmployee}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEmployees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Role *</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => {
                        const RoleIcon = getRoleIcon(role);
                        return (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center space-x-2">
                              <RoleIcon className="h-4 w-4" />
                              <span>{role}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="taskDescription">Task Description *</Label>
                <Textarea
                  id="taskDescription"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Describe what this team member will be working on..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="githubLink">GitHub Link *</Label>
                <Input
                  id="githubLink"
                  value={githubLink}
                  onChange={(e) => setGithubLink(e.target.value)}
                  placeholder="https://github.com/username"
                  type="url"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="memberStartDate">Member Start Date *</Label>
                  <Input
                    id="memberStartDate"
                    type="datetime-local"
                    value={memberStartDate}
                    onChange={(e) => setMemberStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="memberEndDate">Member End Date *</Label>
                  <Input
                    id="memberEndDate"
                    type="datetime-local"
                    value={memberEndDate}
                    onChange={(e) => setMemberEndDate(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={handleAddMember}
                className="w-full flex items-center justify-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Team Member</span>
              </Button>
            </div>

            {errors.member && (
              <p className="text-red-500 text-sm mb-4">{errors.member}</p>
            )}
            {errors.members && (
              <p className="text-red-500 text-sm mb-4">{errors.members}</p>
            )}

            {/* Team Members List */}
            {members.length > 0 && (
              <div className="border border-gray-200 rounded-lg">
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-gray-900">
                      Team Members ({members.length})
                    </h3>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {members.map((member) => {
                    const RoleIcon = getRoleIcon(member.role);
                    return (
                      <div key={member.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <RoleIcon className="h-4 w-4 text-blue-700" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-gray-900 font-medium">
                                    {member.name}
                                  </p>
                                  <div className="flex items-center space-x-2">
                                    <RoleIcon className="h-3 w-3 text-gray-500" />
                                    <p className="text-sm text-gray-600">
                                      {member.role}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>

                              <div>
                                <Label className="text-sm text-gray-600">
                                  Task Description
                                </Label>
                                <Textarea
                                  value={member.taskDescription}
                                  onChange={(e) =>
                                    handleUpdateMember(
                                      member.id,
                                      "taskDescription",
                                      e.target.value
                                    )
                                  }
                                  className="mt-1"
                                  rows={2}
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-sm text-gray-600">
                                    Start Date
                                  </Label>
                                  <Input
                                    type="datetime-local"
                                    value={member.startDate}
                                    onChange={(e) =>
                                      handleUpdateMember(
                                        member.id,
                                        "startDate",
                                        e.target.value
                                      )
                                    }
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm text-gray-600">
                                    End Date
                                  </Label>
                                  <Input
                                    type="datetime-local"
                                    value={member.endDate}
                                    onChange={(e) =>
                                      handleUpdateMember(
                                        member.id,
                                        "endDate",
                                        e.target.value
                                      )
                                    }
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                              {/* GitHub Link display and edit */}
                              <div>
                                <Label className="text-sm text-gray-600">
                                  GitHub Link
                                </Label>
                                <Input
                                  type="url"
                                  value={member.githubLink}
                                  onChange={(e) =>
                                    handleUpdateMember(
                                      member.id,
                                      "githubLink",
                                      e.target.value
                                    )
                                  }
                                  className="mt-1"
                                  placeholder="https://github.com/username"
                                />
                                {member.githubLink && (
                                  <a
                                    href={member.githubLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 text-xs underline mt-1 inline-block"
                                  >
                                    View GitHub Profile
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>

          {/* Workflow Order */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg text-gray-900">Workflow Order</h2>
              {workflowHistory.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndoWorkflow}
                  className="flex items-center space-x-2"
                >
                  <Undo2 className="h-4 w-4" />
                  <span>Undo</span>
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Define the sequence of handoffs. Work will flow from left to
              right.
            </p>

            {errors.workflow && (
              <p className="text-red-500 text-sm mb-4">{errors.workflow}</p>
            )}

            {workflowOrder.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg overflow-x-auto">
                  {workflowOrder.map((role, index) => {
                    const RoleIcon = getRoleIcon(role);
                    return (
                      <React.Fragment key={role}>
                        <div className="flex items-center space-x-2 min-w-fit">
                          <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                            <RoleIcon className="h-3 w-3" />
                            <span>{role}</span>
                            {getMembersCountByRole(role) > 0 && (
                              <span className="ml-1 bg-blue-200 text-blue-900 px-1 rounded-full text-xs">
                                {getMembersCountByRole(role)}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col space-y-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleMoveWorkflowItem(index, "up")
                              }
                              disabled={index === 0}
                              className="h-4 w-4 p-0"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleMoveWorkflowItem(index, "down")
                              }
                              disabled={index === workflowOrder.length - 1}
                              className="h-4 w-4 p-0"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFromWorkflow(role)}
                            className="text-red-600 hover:text-red-800 h-4 w-4 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        {index < workflowOrder.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-gray-400 min-w-fit" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                <div className="text-sm text-gray-600">
                  <p className="mb-2">Team members assigned to each stage:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    {workflowOrder.map((role) => {
                      const roleMembers = members.filter(
                        (m) => m.role === role
                      );
                      const RoleIcon = getRoleIcon(role);
                      return (
                        <div
                          key={role}
                          className="flex justify-between items-center"
                        >
                          <div className="flex items-center space-x-2">
                            <RoleIcon className="h-3 w-3" />
                            <span className="font-medium">{role}:</span>
                          </div>
                          <span
                            className={
                              roleMembers.length > 0
                                ? "text-gray-900"
                                : "text-red-600"
                            }
                          >
                            {roleMembers.length > 0
                              ? `${roleMembers.length} member${
                                  roleMembers.length > 1 ? "s" : ""
                                }`
                              : "Not assigned"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>Add team members to automatically create workflow stages</p>
              </div>
            )}
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button onClick={validateAndSubmit}>Create POD</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
