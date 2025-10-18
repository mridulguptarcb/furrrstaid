import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
  Bell, 
  Lock, 
  User,
  MapPin,
  Mail,
  LogOut,
  Moon,
  Sun
} from "lucide-react";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [editingField, setEditingField] = useState("");
  const [editValue, setEditValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch user data from backend
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/auth");
          return;
        }

        const res = await fetch("http://127.0.0.1:8000/user/profile", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUserData({
            name: data.name,
            email: data.email,
            phone: data.phone || ""
          });
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate('/auth');
  };

  const startEditing = (field) => {
    setEditingField(field);
    setEditValue(userData[field]);
  };

  const cancelEditing = () => {
    setEditingField("");
    setEditValue("");
  };

  const saveField = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth");
        return;
      }

      const res = await fetch("http://127.0.0.1:8000/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ [editingField]: editValue })
      });

      if (res.ok) {
        setUserData({
          ...userData,
          [editingField]: editValue
        });
        toast({
          title: "Profile updated",
          description: `Your ${editingField} has been updated successfully.`,
        });
      } else {
        toast({
          title: "Update failed",
          description: "Failed to update your profile. Please try again.",
        });
      }
    } catch (error) {
      console.error("Failed to update user data:", error);
      toast({
        title: "Error",
        description: "An error occurred. Please try again later.",
      });
    } finally {
      setIsLoading(false);
      setEditingField("");
      setEditValue("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground text-lg">
              Manage your account preferences and notifications
            </p>
          </div>

          <div className="space-y-6">
            {/* Account Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Account Settings</CardTitle>
                </div>
                <CardDescription>
                  Manage your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Address</p>
                    <p className="text-sm text-muted-foreground">{userData.email}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Full Name</p>
                    {editingField === "name" ? (
                      <div className="flex gap-2 mt-1">
                        <Input 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)} 
                          className="h-8 w-48"
                        />
                        <Button size="sm" onClick={saveField} disabled={isLoading}>Save</Button>
                        <Button size="sm" variant="outline" onClick={cancelEditing}>Cancel</Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{userData.name}</p>
                    )}
                  </div>
                  {editingField !== "name" && (
                    <Button variant="outline" size="sm" onClick={() => startEditing("name")}>Edit</Button>
                  )}
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Phone Number</p>
                    {editingField === "phone" ? (
                      <div className="flex gap-2 mt-1">
                        <Input 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)} 
                          className="h-8 w-48"
                        />
                        <Button size="sm" onClick={saveField} disabled={isLoading}>Save</Button>
                        <Button size="sm" variant="outline" onClick={cancelEditing}>Cancel</Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{userData.phone}</p>
                    )}
                  </div>
                  {editingField !== "phone" && (
                    <Button variant="outline" size="sm" onClick={() => startEditing("phone")}>Edit</Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle>Notifications</CardTitle>
                </div>
                <CardDescription>
                  Choose what updates you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications" className="text-base">
                      Push Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get instant alerts for emergencies and reminders
                    </p>
                  </div>
                  <Switch id="push-notifications" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications" className="text-base">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive vaccination reminders and health tips
                    </p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-notifications" className="text-base">
                      SMS Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get text messages for critical alerts
                    </p>
                  </div>
                  <Switch id="sms-notifications" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="vaccine-reminders" className="text-base">
                      Vaccination Reminders
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Never miss a vaccination date
                    </p>
                  </div>
                  <Switch id="vaccine-reminders" defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <Moon className="h-5 w-5 text-primary" />
                  ) : (
                    <Sun className="h-5 w-5 text-primary" />
                  )}
                  <CardTitle>Appearance</CardTitle>
                </div>
                <CardDescription>
                  Customize how FurrstAid looks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode" className="text-base">
                      Dark Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark theme
                    </p>
                  </div>
                  <Switch 
                    id="dark-mode" 
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Permissions */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle>Privacy & Permissions</CardTitle>
                </div>
                <CardDescription>
                  Control your data and app permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="location-access" className="text-base">
                      Location Access
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Find nearby vets and emergency services
                    </p>
                  </div>
                  <Switch id="location-access" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="data-sharing" className="text-base">
                      Data Sharing
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Share anonymized data to improve the app
                    </p>
                  </div>
                  <Switch id="data-sharing" />
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <CardTitle>Security</CardTitle>
                </div>
                <CardDescription>
                  Keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                  </div>
                  <Button variant="outline" size="sm">Change</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Not enabled</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button onClick={handleSave} size="lg">
                Save Changes
              </Button>
              <Button variant="outline" size="lg" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
