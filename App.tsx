import React, { useState, useEffect } from "react";
import { Dashboard } from "./components/Dashboard";
import { PodDetail } from "./components/PodDetail";
import { CreatePod } from "./components/CreatePod";
import { UserProfile } from "./components/UserProfile";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Toaster } from "./components/ui/sonner";
import {
  Users,
  Clock,
  Settings,
  Plus,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Shield,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import Bridge from "./imports/Bridge-54-230";

// Define workflow stages
const WORKFLOW_STAGES = [
  "Product",
  "Design",
  "Frontend",
  "Backend", 
  "QA",
  "Go live",
];

// Task interface
interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // member ID
  assignedBy: string; // who created the task
  createdAt: string;
  status: 'pending' | 'in-progress' | 'completed';
  link?: string;
  completedAt?: string;
}

// Mock user data
const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john@company.com",
  role: "admin" as "admin" | "employee",
};

// Mock PODs data with new structure including tasks and tags
const mockPods = [
  {
    id: "1",
    name: "Mobile App Redesign",
    description: "Complete redesign of our mobile application with new user interface and improved user experience",
    owner: "John Doe",
    tag: "Feature" as "Feature" | "Go-Live",
    createdAt: "2025-01-10T09:00:00Z",
    startDate: "2025-01-10T09:00:00Z",
    endDate: "2025-01-24T17:00:00Z",
    currentStage: 2, // Currently at Frontend stage (0-indexed)
    members: [
      { 
        id: "1", 
        name: "Dhruv", 
        role: "Product", 
        taskDescription: "Create comprehensive PRD and user stories for the mobile app redesign",
        startDate: "2025-01-10T09:00:00Z",
        endDate: "2025-01-12T17:00:00Z",
        handoffLink: "https://notion.so/prd-mobile-redesign", 
        completed: true,
        workStartedAt: "2025-01-10T09:00:00Z",
        workCompletedAt: "2025-01-12T17:00:00Z",
        actualTimeSpent: 2
      },
      { 
        id: "2", 
        name: "Ayush", 
        role: "Design", 
        taskDescription: "Design new UI/UX mockups and create interactive prototypes",
        startDate: "2025-01-12T17:00:00Z",
        endDate: "2025-01-15T16:00:00Z",
        handoffLink: "https://figma.com/mobile-app-designs", 
        completed: true,
        workStartedAt: "2025-01-12T17:00:00Z",
        workCompletedAt: "2025-01-15T16:00:00Z",
        actualTimeSpent: 3
      },
      { 
        id: "3", 
        name: "Mona", 
        role: "Frontend", 
        taskDescription: "Implement frontend components and integrate with backend APIs",
        startDate: "2025-01-15T16:00:00Z",
        endDate: "2025-01-22T17:00:00Z",
        handoffLink: "", 
        completed: false,
        workStartedAt: "2025-01-15T16:00:00Z",
        workCompletedAt: null,
        actualTimeSpent: 0
      },
      { 
        id: "4", 
        name: "Hansal", 
        role: "Backend", 
        taskDescription: "Backend API development and database optimization",
        startDate: "2025-01-15T16:00:00Z",
        endDate: "2025-01-22T17:00:00Z",
        handoffLink: "", 
        completed: false,
        workStartedAt: null,
        workCompletedAt: null,
        actualTimeSpent: 0
      },
      { 
        id: "5", 
        name: "Ammaar", 
        role: "QA", 
        taskDescription: "Comprehensive testing including functional, performance, and usability testing",
        startDate: "2025-01-22T17:00:00Z",
        endDate: "2025-01-24T17:00:00Z",
        handoffLink: "", 
        completed: false,
        workStartedAt: null,
        workCompletedAt: null,
        actualTimeSpent: 0
      }
    ],
    tasks: [
      {
        id: "task-1",
        title: "User Research Analysis",
        description: "Analyze current user research data and identify key pain points",
        assignedTo: "1", // Dhruv
        assignedBy: "1", // John Doe
        createdAt: "2025-01-10T10:00:00Z",
        status: "completed" as const,
        link: "https://docs.google.com/document/user-research-analysis",
        completedAt: "2025-01-11T15:00:00Z"
      },
      {
        id: "task-2",
        title: "Design System Documentation",
        description: "Create comprehensive design system documentation for the new UI components",
        assignedTo: "2", // Ayush
        assignedBy: "1", // John Doe
        createdAt: "2025-01-12T09:00:00Z",
        status: "completed" as const,
        link: "https://www.figma.com/design-system-docs",
        completedAt: "2025-01-14T12:00:00Z"
      },
      {
        id: "task-3",
        title: "API Documentation",
        description: "Document all new API endpoints and their usage",
        assignedTo: "4", // Hansal
        assignedBy: "1", // John Doe
        createdAt: "2025-01-16T11:00:00Z",
        status: "in-progress" as const
      }
    ],
    status: "in-progress" as "planning" | "in-progress" | "completed",
    workflowOrder: ["Product", "Design", "Frontend", "Backend", "QA"]
  },
  {
    id: "2",
    name: "Payment Gateway Integration",
    description: "Integration of new payment gateway to support multiple payment methods and improve transaction success rate",
    owner: "Sarah Johnson",
    tag: "Go-Live" as "Feature" | "Go-Live",
    createdAt: "2025-01-15T10:30:00Z",
    startDate: "2025-01-15T10:30:00Z",
    endDate: "2025-01-25T17:00:00Z",
    currentStage: 1, // Currently at Backend stage
    members: [
      { 
        id: "6", 
        name: "Sarah", 
        role: "Product", 
        taskDescription: "Define payment flow requirements and create technical specifications",
        startDate: "2025-01-15T10:30:00Z",
        endDate: "2025-01-17T14:30:00Z",
        handoffLink: "https://notion.so/payment-prd", 
        completed: true,
        workStartedAt: "2025-01-15T10:30:00Z",
        workCompletedAt: "2025-01-17T14:30:00Z",
        actualTimeSpent: 2
      },
      { 
        id: "7", 
        name: "Alex", 
        role: "Backend", 
        taskDescription: "Implement payment gateway APIs and handle transaction processing",
        startDate: "2025-01-17T14:30:00Z",
        endDate: "2025-01-23T17:00:00Z",
        handoffLink: "", 
        completed: false,
        workStartedAt: "2025-01-17T14:30:00Z",
        workCompletedAt: null,
        actualTimeSpent: 0
      },
      { 
        id: "8", 
        name: "Maya", 
        role: "QA", 
        taskDescription: "Test payment flows and ensure security compliance",
        startDate: "2025-01-23T17:00:00Z",
        endDate: "2025-01-25T17:00:00Z",
        handoffLink: "", 
        completed: false,
        workStartedAt: null,
        workCompletedAt: null,
        actualTimeSpent: 0
      }
    ],
    tasks: [
      {
        id: "task-4",
        title: "Payment Gateway Research",
        description: "Research and compare different payment gateway options",
        assignedTo: "6", // Sarah
        assignedBy: "6", // Sarah Johnson
        createdAt: "2025-01-15T11:00:00Z",
        status: "completed" as const,
        link: "https://docs.google.com/spreadsheet/payment-gateway-comparison",
        completedAt: "2025-01-16T16:00:00Z"
      }
    ],
    status: "in-progress",
    workflowOrder: ["Product", "Backend", "QA"]
  }
];

// Mock Slack notification function
const sendSlackNotification = (
  memberName: string,
  podName: string,
  handoffLink: string,
) => {
  console.log(`🔔 Slack Notification Sent:`);
  console.log(`To: ${memberName}`);
  console.log(
    `Message: You have been handed off work for "${podName}". Please check: ${handoffLink}`,
  );
  console.log(`Timer started for ${memberName}'s work phase.`);
};

// Mock employees for login validation
const validCredentials = [
  { email: "john@company.com", password: "admin123", name: "John Doe", role: "admin" as const },
  { email: "sarah@company.com", password: "employee123", name: "Sarah Johnson", role: "employee" as const },
  { email: "dhruv@company.com", password: "product123", name: "Dhruv Patel", role: "employee" as const },
  { email: "ayush@company.com", password: "design123", name: "Ayush Kumar", role: "employee" as const },
  { email: "mona@company.com", password: "frontend123", name: "Mona Singh", role: "employee" as const },
];

// Add these helper functions at the top (after imports)
function saveAuthToStorage(isAuthenticated: boolean, user: any) {
  localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated));
  localStorage.setItem('user', JSON.stringify(user));
}

function loadAuthFromStorage() {
  let isAuthenticated = false;
  let user = null;
  try {
    isAuthenticated = JSON.parse(localStorage.getItem('isAuthenticated') || 'false');
  } catch { isAuthenticated = false; }
  try {
    user = JSON.parse(localStorage.getItem('user') || 'null');
  } catch { user = null; }
  return { isAuthenticated: !!isAuthenticated, user: user || null };
}

function savePodsToStorage(pods: any[]) {
  localStorage.setItem('pods', JSON.stringify(pods));
}

function loadPodsFromStorage() {
  try {
    const pods = JSON.parse(localStorage.getItem('pods') || 'null');
    if (Array.isArray(pods)) return pods;
    return null;
  } catch {
    return null;
  }
}

export default function App() {
  // Load from localStorage on first render
  const authFromStorage = loadAuthFromStorage();
  const [currentView, setCurrentView] = useState<
    "dashboard" | "pod-detail" | "create-pod" | "profile"
  >("dashboard");
  const [selectedPodId, setSelectedPodId] = useState<string | null>(null);
  const [user, setUser] = useState(authFromStorage.user ? authFromStorage.user : mockUser);
  // Load pods from localStorage if present, else use mockPods
  const podsFromStorage = loadPodsFromStorage();
  const [pods, setPods] = useState(podsFromStorage || mockPods);
  const [isAuthenticated, setIsAuthenticated] = useState(!!authFromStorage.isAuthenticated);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Save auth state to localStorage whenever it changes
  useEffect(() => {
    saveAuthToStorage(isAuthenticated, user);
  }, [isAuthenticated, user]);

  // Save pods to localStorage whenever they change
  useEffect(() => {
    savePodsToStorage(pods);
  }, [pods]);

  // Apply dark mode class to document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Timer management
  useEffect(() => {
    const interval = setInterval(() => {
      setPods((currentPods) =>
        currentPods.map((pod) => {
          const currentMember = pod.members.find(
            (member, index) =>
              index === pod.currentStage && !member.completed,
          );

          if (currentMember && currentMember.workStartedAt) {
            const now = new Date();
            const startTime = new Date(
              currentMember.workStartedAt,
            );
            const hoursWorked =
              (now.getTime() - startTime.getTime()) /
              (1000 * 60 * 60);
            const daysWorked =
              Math.round((hoursWorked / 24) * 10) / 10; // Round to 1 decimal

            return {
              ...pod,
              members: pod.members.map((member) =>
                member.id === currentMember.id
                  ? { ...member, actualTimeSpent: daysWorked }
                  : member,
              ),
            };
          }
          return pod;
        }),
      );
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView("dashboard");
    setSelectedPodId(null);
    setUser(mockUser); // Reset user to default
    // Reset to light mode on logout
    setIsDarkMode(false);
    // Remove from localStorage
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    
    toast.success('Successfully logged out', {
      description: 'You have been logged out of Bridge. Please login again to continue.',
      duration: 5000,
    });
  };

  // Handle dark mode toggle
  const handleDarkModeToggle = (enabled: boolean) => {
    setIsDarkMode(enabled);
    
    toast.success(enabled ? 'Dark mode enabled' : 'Light mode enabled', {
      description: `The interface has been switched to ${enabled ? 'dark' : 'light'} mode.`,
      duration: 3000,
    });
  };

  if (!isAuthenticated) {
    return (
      <LoginScreen 
        onLogin={(email, password) => {
          const credentials = validCredentials.find(
            cred => cred.email === email && cred.password === password
          );
          if (credentials) {
            setUser({
              id: "1",
              name: credentials.name,
              email: credentials.email,
              role: credentials.role,
            });
            setIsAuthenticated(true);
            // saveAuthToStorage will be called by useEffect
            return true;
          }
          return false;
        }} 
        isDarkMode={isDarkMode}
      />
    );
  }

  const handleViewPod = (podId: string) => {
    setSelectedPodId(podId);
    setCurrentView("pod-detail");
  };

  const handleCreatePod = (podData: any) => {
    // Organize members by workflow order, allowing multiple members per role
    const orderedMembers: any[] = [];
    
    podData.workflowOrder.forEach((stage: string) => {
      const stageMembers = podData.members.filter((m: any) => m.role === stage);
      stageMembers.forEach((member: any, index: number) => {
        orderedMembers.push({
          ...member,
          workStartedAt: stage === podData.workflowOrder[0] && index === 0 ? new Date().toISOString() : null,
          workCompletedAt: null,
          actualTimeSpent: 0
        });
      });
    });

    const newPod = {
      id: Date.now().toString(),
      name: podData.name,
      description: podData.description,
      owner: podData.owner,
      tag: podData.tag,
      startDate: podData.startDate,
      endDate: podData.endDate,
      createdAt: new Date().toISOString(),
      status: "in-progress" as const,
      currentStage: 0,
      members: orderedMembers,
      tasks: [], // Initialize with empty tasks array
      workflowOrder: podData.workflowOrder,
    };

    setPods([...pods, newPod]);
    setCurrentView("dashboard");
  };

  const handleDeletePod = (podId: string) => {
    const podToDelete = pods.find(p => p.id === podId);
    
    setPods(pods.filter(pod => pod.id !== podId));
    
    // Show success toast
    toast.success('POD deleted successfully', {
      description: `"${podToDelete?.name}" has been removed from the system.`,
      duration: 5000,
    });

    // If the deleted POD was currently being viewed, go back to dashboard
    if (selectedPodId === podId) {
      setCurrentView("dashboard");
      setSelectedPodId(null);
    }
  };

  const handleUpdatePod = (updatedPod: any) => {
    setPods(
      pods.map((pod) => {
        if (pod.id === updatedPod.id) {
          // Check if handoff occurred
          const originalPod = pods.find((p) => p.id === pod.id);
          const currentMember =
            originalPod?.members[originalPod.currentStage];
          const updatedCurrentMember =
            updatedPod.members[updatedPod.currentStage];

          // If handoff link was just added
          if (
            currentMember &&
            updatedCurrentMember &&
            !currentMember.handoffLink &&
            updatedCurrentMember.handoffLink
          ) {
            // Mark current member as completed
            const now = new Date().toISOString();
            updatedCurrentMember.completed = true;
            updatedCurrentMember.workCompletedAt = now;

            // Move to next stage
            const nextStage = updatedPod.currentStage + 1;
            if (nextStage < updatedPod.members.length) {
              updatedPod.currentStage = nextStage;
              const nextMember = updatedPod.members[nextStage];
              nextMember.workStartedAt = now;

              // Send Slack notification
              sendSlackNotification(
                nextMember.name,
                updatedPod.name,
                updatedCurrentMember.handoffLink,
              );
            } else {
              // All stages completed
              updatedPod.status = "completed";
            }
          }

          return updatedPod;
        }
        return pod;
      }),
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <Dashboard
            pods={pods}
            user={user}
            onViewPod={handleViewPod}
            onCreatePod={() => setCurrentView("create-pod")}
            onViewProfile={() => setCurrentView("profile")}
            onDeletePod={handleDeletePod}
          />
        );
      case "pod-detail":
        const selectedPod = pods.find(
          (pod) => pod.id === selectedPodId,
        );
        return selectedPod ? (
          <PodDetail
            pod={selectedPod}
            user={user}
            onBack={() => setCurrentView("dashboard")}
            onUpdate={handleUpdatePod}
          />
        ) : (
          <div>POD not found</div>
        );
      case "create-pod":
        return (
          <CreatePod
            user={user}
            onBack={() => setCurrentView("dashboard")}
            onCreatePod={handleCreatePod}
          />
        );
      case "profile":
        return (
          <UserProfile
            user={user}
            onBack={() => setCurrentView("dashboard")}
            onUpdateUser={setUser}
            onLogout={handleLogout}
            isDarkMode={isDarkMode}
            onDarkModeToggle={handleDarkModeToggle}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderContent()}
      <Toaster />
    </div>
  );
}

function LoginScreen({ onLogin, isDarkMode }: { onLogin: (email: string, password: string) => boolean; isDarkMode: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    setPasswordError("");

    // Validation
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      return;
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const success = onLogin(email, password);
    
    if (!success) {
      setError("Invalid email or password. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen login-container flex items-center justify-center p-4 ${isDarkMode ? 'dark' : ''}`}>
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-16 h-16 flex-shrink-0">
              <Bridge />
            </div>
            <h1 className="bridge-logo text-4xl text-primary">
              Bridge
            </h1>
          </div>
          <div className="space-y-2">
            <h2 className="bridge-heading text-2xl text-foreground">
              Welcome back
            </h2>
            <p className="text-muted-foreground">
              Sign in to your company account to continue
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="p-8 shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
          {/* Company indicator */}
          <div className="flex items-center justify-center mb-6 p-3 bg-secondary/50 rounded-lg">
            <Building2 className="h-4 w-4 text-secondary-foreground mr-2" />
            <span className="text-sm text-secondary-foreground">Company Portal</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Company Email
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                    setError("");
                  }}
                  placeholder="your.email@company.com"
                  className={`pl-10 h-12 ${emailError ? 'border-destructive focus:border-destructive' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {emailError && (
                <p className="text-sm text-destructive">{emailError}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                    setError("");
                  }}
                  placeholder="Enter your password"
                  className={`pl-10 pr-10 h-12 ${passwordError ? 'border-destructive focus:border-destructive' : ''}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
            </div>

            {/* General Error */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 bridge-heading text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-3">Demo Credentials:</p>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="p-2 bg-muted/50 rounded text-left">
                  <div className="font-medium">Admin:</div>
                  <div>john@company.com / admin123</div>
                </div>
                <div className="p-2 bg-muted/50 rounded text-left">
                  <div className="font-medium">Employee:</div>
                  <div>sarah@company.com / employee123</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            Bridge - Project Handoff Supertool
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Streamline your team's workflow with seamless handoffs
          </p>
        </div>
      </div>
    </div>
  );
}