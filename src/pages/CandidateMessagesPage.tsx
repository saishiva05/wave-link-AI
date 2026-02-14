import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, MessageSquare, User, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useCandidateDashboard } from "@/hooks/useCandidateDashboard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

const CandidateMessagesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { recruiter } = useCandidateDashboard();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch recruiter's user_id for messaging
  const { data: recruiterUserId } = useQuery({
    queryKey: ["candidate", "recruiter-user-id"],
    enabled: !!user,
    queryFn: async () => {
      const { data: cand } = await supabase
        .from("candidates")
        .select("assigned_recruiter_id")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (!cand) return null;
      const { data: rec } = await supabase
        .from("recruiters")
        .select("user_id")
        .eq("recruiter_id", cand.assigned_recruiter_id)
        .maybeSingle();
      return rec?.user_id || null;
    },
  });

  const { data: candidateRecord } = useQuery({
    queryKey: ["candidate", "record", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("candidates")
        .select("candidate_id")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["candidate", "messages", user?.id],
    enabled: !!user,
    refetchInterval: 10000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Mark unread messages as read
  useEffect(() => {
    if (messages.length > 0 && user) {
      const unread = messages.filter((m: any) => m.receiver_user_id === user.id && !m.is_read);
      if (unread.length > 0) {
        supabase
          .from("messages")
          .update({ is_read: true })
          .in("message_id", unread.map((m: any) => m.message_id))
          .then(() => {});
      }
    }
  }, [messages, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!body.trim() || !recruiterUserId || !candidateRecord) throw new Error("Missing data");
      const { error } = await supabase.from("messages").insert({
        sender_user_id: user!.id,
        receiver_user_id: recruiterUserId,
        candidate_id: candidateRecord.candidate_id,
        subject: subject.trim() || null,
        body: body.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setSubject("");
      setBody("");
      queryClient.invalidateQueries({ queryKey: ["candidate", "messages"] });
      toast({ title: "Message sent!" });
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6 max-w-[900px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <nav className="flex items-center gap-1.5 text-sm mb-4">
          <button onClick={() => navigate("/candidate/dashboard")} className="text-neutral-500 hover:text-primary transition-colors">Dashboard</button>
          <span className="text-neutral-300">/</span>
          <span className="text-secondary-900 font-semibold">Messages</span>
        </nav>
        <h1 className="text-2xl md:text-4xl font-bold text-secondary-900 font-display">Messages</h1>
        <p className="text-base text-muted-foreground mt-1">
          Communicate with your recruiter {recruiter.name !== "Unknown" ? `— ${recruiter.name}` : ""}
        </p>
      </motion.div>

      {/* Messages Thread */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
          {/* Recruiter header */}
          <div className="px-6 py-4 border-b border-border bg-neutral-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0">
              {recruiter.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-semibold text-secondary-900">{recruiter.name}</p>
              <p className="text-xs text-neutral-600">{recruiter.company} • {recruiter.email}</p>
            </div>
          </div>

          {/* Messages list */}
          <div className="h-[400px] overflow-y-auto p-6 space-y-4 bg-neutral-50/50">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MessageSquare className="w-12 h-12 text-neutral-300 mb-3" />
                <h4 className="text-lg font-semibold text-neutral-700">No messages yet</h4>
                <p className="text-sm text-neutral-600 mt-1">Send your first message to your recruiter below.</p>
              </div>
            ) : (
              messages.map((msg: any) => {
                const isMe = msg.sender_user_id === user?.id;
                return (
                  <div key={msg.message_id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[75%] rounded-2xl px-5 py-3 shadow-xs", isMe ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card border border-border text-secondary-900 rounded-bl-md")}>
                      {msg.subject && (
                        <p className={cn("text-xs font-semibold mb-1", isMe ? "text-primary-foreground/80" : "text-primary-600")}>{msg.subject}</p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                      <p className={cn("text-[10px] mt-1.5 flex items-center gap-1", isMe ? "text-primary-foreground/60 justify-end" : "text-neutral-500")}>
                        <Clock className="w-2.5 h-2.5" />
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Compose */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject (optional)"
                  className="h-9 text-sm"
                />
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type your message..."
                  className="min-h-[80px] text-sm resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      if (body.trim()) sendMessage.mutate();
                    }
                  }}
                />
              </div>
              <Button
                onClick={() => sendMessage.mutate()}
                disabled={!body.trim() || sendMessage.isPending}
                className="self-end h-10 px-5"
              >
                {sendMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send
              </Button>
            </div>
            <p className="text-[10px] text-neutral-500 mt-2">Press Ctrl+Enter to send quickly</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CandidateMessagesPage;
