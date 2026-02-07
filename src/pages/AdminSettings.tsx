import { motion } from "framer-motion";
import { Settings, Bell, Shield, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const AdminSettings = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 font-display">Settings</h1>
        <p className="text-base text-muted-foreground mt-1">Manage platform configuration</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="space-y-6"
      >
        {/* Profile Section */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-secondary-900">Profile Settings</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input defaultValue="Admin User" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input defaultValue="admin@wavelynk.ai" type="email" />
            </div>
          </div>
          <Button variant="portal" size="sm">Save Changes</Button>
        </div>

        {/* Notifications */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-secondary-900">Notifications</h2>
          </div>
          {[
            { label: "Email notifications for new recruiters", defaultChecked: true },
            { label: "Daily activity summary", defaultChecked: false },
            { label: "Weekly analytics report", defaultChecked: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2">
              <span className="text-sm text-neutral-700">{item.label}</span>
              <Switch defaultChecked={item.defaultChecked} />
            </div>
          ))}
        </div>

        {/* Security */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-secondary-900">Security</h2>
          </div>
          <div className="space-y-1.5">
            <Label>Current Password</Label>
            <Input type="password" placeholder="Enter current password" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>New Password</Label>
              <Input type="password" placeholder="New password" />
            </div>
            <div className="space-y-1.5">
              <Label>Confirm Password</Label>
              <Input type="password" placeholder="Confirm new password" />
            </div>
          </div>
          <Button variant="portal" size="sm">Update Password</Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSettings;
