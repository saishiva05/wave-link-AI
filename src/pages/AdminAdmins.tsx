import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminsTable from "@/components/admin/AdminsTable";
import CreateAdminModal from "@/components/admin/CreateAdminModal";

const AdminAdmins = () => {
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">
            Manage Admins
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            Create and manage platform administrator accounts
          </p>
        </div>
        <Button variant="portal" size="lg" onClick={() => setCreateModalOpen(true)}>
          <ShieldPlus className="w-4 h-4" />
          Create New Admin
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <AdminsTable onCreateNew={() => setCreateModalOpen(true)} />
      </motion.div>

      <CreateAdminModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </div>
  );
};

export default AdminAdmins;
