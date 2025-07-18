import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Users, Clock, Calendar, Plus, Settings, User, Timer, ArrowRight, Crown, Trash2, Tag, Lightbulb, PenTool, Monitor, Server, Bug, Megaphone } from 'lucide-react';
import Bridge from '../imports/Bridge-54-230';

interface Pod {
  id: string;
  name: string;
  description?: string;
  owner?: string;
  tag?: 'Feature' | 'Go-Live';
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
    timeAllocated?: number;
    startDate?: string;
    endDate?: string;
    handoffLink: string;
    completed: boolean;
    workStartedAt: string | null;
    workCompletedAt: string | null;
    actualTimeSpent: number;
  }>;
  status: 'planning' | 'in-progress' | 'completed';
  workflowOrder: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
}

interface DashboardProps {
  pods: Pod[];
  user: User;
  onViewPod: (podId: string) => void;
  onCreatePod: () => void;
  onViewProfile: () => void;
  onDeletePod: (podId: string) => void;
}

// Role icon mapping
const getRoleIcon = (role: string) => {
  switch (role) {
    case 'Product':
      return Lightbulb;
    case 'Design':
      return PenTool;
    case 'Frontend':
      return Monitor;
    case 'Backend':
      return Server;
    case 'Dev': // Fallback for legacy data
      return Monitor;
    case 'QA':
      return Bug;
    case 'Marketing':
      return Megaphone;
    case 'Operations':
      return Settings;
    default:
      return User;
  }
};

export function Dashboard({ pods, user, onViewPod, onCreatePod, onViewProfile, onDeletePod }: DashboardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTagColor = (tag?: string) => {
    switch (tag) {
      case 'Feature':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Go-Live':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateProgress = (pod: Pod) => {
    const completedTasks = pod.members.filter(member => member.completed).length;
    return Math.round((completedTasks / pod.members.length) * 100);
  };

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

  const getCurrentlyWorking = (pod: Pod) => {
    if (pod.status === 'completed') return null;
    return pod.members[pod.currentStage];
  };

  const getWorkingTime = (member: any) => {
    if (!member.workStartedAt) return 0;
    const start = new Date(member.workStartedAt);
    const end = member.workCompletedAt ? new Date(member.workCompletedAt) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.round(diffTime / (1000 * 60 * 60 * 24) * 10) / 10;
  };

  const activePods = pods.filter(pod => pod.status !== 'completed');
  const completedPods = pods.filter(pod => pod.status === 'completed');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10">
                  <Bridge />
                </div>
                <h1 className="bridge-logo text-3xl">Bridge</h1>
              </div>
              <p className="text-muted-foreground mt-1">Project Handoff Supertool</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={onViewProfile}
                className="flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>{user.name}</span>
                <Badge variant="secondary" className="ml-2">
                  {user.role}
                </Badge>
              </Button>
              {user.role === 'admin' && (
                <Button onClick={onCreatePod} className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create POD</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-muted-foreground">Total PODs</p>
                <p className="text-xl">{pods.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-muted-foreground">Active PODs</p>
                <p className="text-xl">{activePods.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-xl">{completedPods.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Timer className="h-5 w-5 text-violet-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-muted-foreground">People Working</p>
                <p className="text-xl">
                  {activePods.filter(pod => getCurrentlyWorking(pod)).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* PODs List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="bridge-heading text-xl">Active PODs</h2>
          </div>

          {activePods.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="bridge-heading text-lg mb-2">No Active PODs</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first POD.</p>
              {user.role === 'admin' && (
                <Button onClick={onCreatePod}>Create POD</Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activePods.map((pod) => (
                <PodCard
                  key={pod.id}
                  pod={pod}
                  user={user}
                  onViewPod={onViewPod}
                  onDeletePod={onDeletePod}
                  calculateProgress={calculateProgress}
                  getDaysActive={getDaysActive}
                  getDaysFromStartDate={getDaysFromStartDate}
                  getDaysToEndDate={getDaysToEndDate}
                  getStatusColor={getStatusColor}
                  getTagColor={getTagColor}
                  getCurrentlyWorking={getCurrentlyWorking}
                  getWorkingTime={getWorkingTime}
                />
              ))}
            </div>
          )}

          {completedPods.length > 0 && (
            <>
              <div className="flex justify-between items-center mt-8">
                <h2 className="bridge-heading text-xl">Completed PODs</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {completedPods.map((pod) => (
                  <PodCard
                    key={pod.id}
                    pod={pod}
                    user={user}
                    onViewPod={onViewPod}
                    onDeletePod={onDeletePod}
                    calculateProgress={calculateProgress}
                    getDaysActive={getDaysActive}
                    getDaysFromStartDate={getDaysFromStartDate}
                    getDaysToEndDate={getDaysToEndDate}
                    getStatusColor={getStatusColor}
                    getTagColor={getTagColor}
                    getCurrentlyWorking={getCurrentlyWorking}
                    getWorkingTime={getWorkingTime}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PodCard({ 
  pod, 
  user,
  onViewPod,
  onDeletePod,
  calculateProgress, 
  getDaysActive, 
  getDaysFromStartDate,
  getDaysToEndDate,
  getStatusColor,
  getTagColor,
  getCurrentlyWorking,
  getWorkingTime
}: {
  pod: Pod;
  user: User;
  onViewPod: (podId: string) => void;
  onDeletePod: (podId: string) => void;
  calculateProgress: (pod: Pod) => number;
  getDaysActive: (createdAt: string) => number;
  getDaysFromStartDate: (startDate?: string) => number;
  getDaysToEndDate: (endDate?: string) => number;
  getStatusColor: (status: string) => string;
  getTagColor: (tag?: string) => string;
  getCurrentlyWorking: (pod: Pod) => any;
  getWorkingTime: (member: any) => number;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const progress = calculateProgress(pod);
  const daysActive = getDaysActive(pod.createdAt);
  const daysFromStart = getDaysFromStartDate(pod.startDate);
  const daysToEnd = getDaysToEndDate(pod.endDate);
  const currentlyWorking = getCurrentlyWorking(pod);

  // Check if user can delete this POD
  const canDelete = user.role === 'admin' || pod.owner === user.name;

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation when clicking on delete button
    if ((e.target as HTMLElement).closest('[data-delete-button]')) {
      return;
    }
    onViewPod(pod.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    onDeletePod(pod.id);
    setShowDeleteDialog(false);
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer relative" onClick={handleCardClick}>
      {/* Delete button */}
      {canDelete && (
        <div className="absolute top-3 right-3" data-delete-button>
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete POD</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{pod.name}"? This action cannot be undone and will permanently remove the POD and all its data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteConfirm}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                >
                  Delete POD
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      <div className="flex justify-between items-start mb-3 pr-8">
        <div className="flex-1">
          <h3 className="bridge-heading text-lg mb-1">{pod.name}</h3>
          
          {/* Timeline information as subtext */}
          <div className="text-sm text-muted-foreground mb-2">
            {pod.startDate ? (
              <>
                <span>{daysFromStart} days since start</span>
                {daysToEnd > 0 ? (
                  <span className="ml-3">{daysToEnd} days remaining</span>
                ) : (
                  <span className="ml-3 text-destructive">{Math.abs(daysToEnd)} days overdue</span>
                )}
              </>
            ) : (
              <>
                <span>{daysActive} days active</span>
                {pod.estimatedDuration && <span className="ml-3">{pod.estimatedDuration} days estimated</span>}
              </>
            )}
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <Badge className={getStatusColor(pod.status)}>
              {pod.status.charAt(0).toUpperCase() + pod.status.slice(1)}
            </Badge>
            {pod.tag && (
              <Badge className={`${getTagColor(pod.tag)} border`} variant="outline">
                <Tag className="h-3 w-3 mr-1" />
                {pod.tag}
              </Badge>
            )}
            {pod.owner && (
              <div className="flex items-center space-x-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                <Crown className="h-3 w-3" />
                <span>{pod.owner}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workflow Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Workflow Progress</span>
          <span className="text-sm text-gray-900">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2 mb-2" />
        
        {/* Workflow stages */}
        <div className="flex items-center space-x-1 text-xs">
          {pod.workflowOrder.map((stage, index) => {
            const RoleIcon = getRoleIcon(stage);
            return (
              <React.Fragment key={stage}>
                <div className={`px-2 py-1 rounded flex items-center space-x-1 ${
                  index < pod.currentStage ? 'bg-green-100 text-green-800' :
                  index === pod.currentStage ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  <RoleIcon className="h-3 w-3" />
                  <span>{stage}</span>
                </div>
                {index < pod.workflowOrder.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-gray-400" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Currently Working */}
      {currentlyWorking && (
        <div className="mb-3 p-2 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Timer className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {currentlyWorking.name} working on {currentlyWorking.role}
              </span>
            </div>
            <div className="text-xs text-blue-700">
              {currentlyWorking.actualTimeSpent.toFixed(1)} days
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">{pod.members.length} members</span>
        </div>
        <div className="flex -space-x-1">
          {pod.members.slice(0, 3).map((member, index) => {
            const RoleIcon = getRoleIcon(member.role);
            return (
              <div
                key={member.id}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border-2 border-white ${
                  member.completed ? 'bg-green-500 text-white' :
                  member.id === currentlyWorking?.id ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-700'
                }`}
                title={`${member.name} - ${member.role} ${member.completed ? '(Completed)' : member.id === currentlyWorking?.id ? '(Working)' : ''}`}
              >
                {member.completed || member.id === currentlyWorking?.id ? (
                  member.name.charAt(0)
                ) : (
                  <RoleIcon className="h-3 w-3" />
                )}
              </div>
            );
          })}
          {pod.members.length > 3 && (
            <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-500 border-2 border-white">
              +{pod.members.length - 3}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}