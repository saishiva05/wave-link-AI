import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import RecruitersTable from "@/components/admin/RecruitersTable";
import CreateRecruiterModal from "@/components/admin/CreateRecruiterModal";

const AdminRecruiters = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 font-display">
            Manage Recruiters
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            Create, manage, and monitor recruiter accounts
          </p>
        </div>
        <Button variant="portal" size="lg" onClick={() => setCreateModalOpen(true)}>
          <UserPlus className="w-4 h-4" />
          Create New Recruiter
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <RecruitersTable onCreateNew={() => setCreateModalOpen(true)} />
      </motion.div>

      <CreateRecruiterModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </div>
  );
};

export default AdminRecruiters;
