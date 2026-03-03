import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, MessageSquare, Loader2, Clock, Users, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const RecruiterMessagesPage = () => {
  const navigate = useNavigate();
  const { user, recruiterId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch candidates assigned to this recruiter
  const { data: candidates = [] } = useQuery({
    queryKey: ["recruiter", "message-candidates", recruiterId],
    enabled: !!recruiterId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select("candidate_id, user_id, users!candidates_user_id_fkey (full_name, email)")
        .eq("assigned_recruiter_id", recruiterId!);
      if (error) throw error;
      return (data || []).map((c: any) => ({
        candidate_id: c.candidate_id,
        user_id: c.user_id,
        name: c.users?.full_name || "Unknown",
        email: c.users?.email || "",
      }));
    },
  });

  const selectedCandidate = candidates.find((c: any) => c.candidate_id === selectedCandidateId);

  // Fetch messages for selected candidate
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["recruiter", "messages", selectedCandidateId],
    enabled: !!selectedCandidateId && !!user,
    refetchInterval: 10000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("candidate_id", selectedCandidateId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Unread counts per candidate
  const { data: unreadCounts = {} } = useQuery({
    queryKey: ["recruiter", "unread-counts", recruiterId],
    enabled: !!user && candidates.length > 0,
    refetchInterval: 10000,
    queryFn: async () => {
      const candidateIds = candidates.map((c: any) => c.candidate_id);
      const { data } = await supabase
        .from("messages")
        .select("candidate_id")
        .eq("receiver_user_id", user!.id)
        .eq("is_read", false)
        .in("candidate_id", candidateIds);
      const counts: Record<string, number> = {};
      (data || []).forEach((m: any) => {
        counts[m.candidate_id] = (counts[m.candidate_id] || 0) + 1;
      });
      return counts;
    },
  });

  // Mark messages as read when viewing
  useEffect(() => {
    if (messages.length > 0 && user) {
      const unread = messages.filter((m: any) => m.receiver_user_id === user.id && !m.is_read);
      if (unread.length > 0) {
        supabase
          .from("messages")
          .update({ is_read: true })
          .in("message_id", unread.map((m: any) => m.message_id))
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ["recruiter", "unread-counts"] });
          });
      }
    }
  }, [messages, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!body.trim() || !selectedCandidate || !user) throw new Error("Missing data");
      const { error } = await supabase.from("messages").insert({
        sender_user_id: user.id,
        receiver_user_id: selectedCandidate.user_id,
        candidate_id: selectedCandidate.candidate_id,
        subject: subject.trim() || null,
        body: body.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setSubject("");
      setBody("");
      queryClient.invalidateQueries({ queryKey: ["recruiter", "messages"] });
      toast({ title: "Message sent!" });
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6 max-w-[1100px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">Messages</h1>
        <p className="text-base text-muted-foreground mt-1">Communicate with your candidates</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden flex" style={{ height: "550px" }}>
          {/* Candidate list */}
          <div className={cn("w-full md:w-[300px] border-r border-border flex flex-col shrink-0", selectedCandidateId ? "hidden md:flex" : "flex")}>
            <div className="px-4 py-3 border-b border-border bg-muted/50">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2"><Users className="w-4 h-4" /> Candidates ({candidates.length})</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {candidates.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">No candidates assigned</div>
              ) : (
                candidates.map((c: any) => (
                  <button key={c.candidate_id}
                    onClick={() => setSelectedCandidateId(c.candidate_id)}
                    className={cn("w-full text-left px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors flex items-center gap-3",
                      selectedCandidateId === c.candidate_id && "bg-primary-50"
                    )}>
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
                      {c.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                    </div>
                    {(unreadCounts as any)[c.candidate_id] > 0 && (
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                        {(unreadCounts as any)[c.candidate_id]}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className={cn("flex-1 flex flex-col", !selectedCandidateId ? "hidden md:flex" : "flex")}>
            {!selectedCandidateId ? (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-lg font-semibold text-muted-foreground">Select a candidate</p>
                  <p className="text-sm text-muted-foreground mt-1">Choose a candidate from the list to view messages</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="px-4 py-3 border-b border-border bg-muted/50 flex items-center gap-3">
                  <button onClick={() => setSelectedCandidateId(null)} className="md:hidden">
                    <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                    {selectedCandidate?.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selectedCandidate?.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedCandidate?.email}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <MessageSquare className="w-10 h-10 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">No messages yet. Start the conversation below.</p>
                    </div>
                  ) : (
                    messages.map((msg: any) => {
                      const isMe = msg.sender_user_id === user?.id;
                      return (
                        <div key={msg.message_id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                          <div className={cn("max-w-[75%] rounded-2xl px-4 py-2.5 shadow-xs",
                            isMe ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card border border-border text-foreground rounded-bl-md"
                          )}>
                            {msg.subject && <p className={cn("text-xs font-semibold mb-1", isMe ? "text-primary-foreground/80" : "text-primary")}>{msg.subject}</p>}
                            <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                            <p className={cn("text-[10px] mt-1 flex items-center gap-1", isMe ? "text-primary-foreground/60 justify-end" : "text-muted-foreground")}>
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
                <div className="p-3 border-t border-border bg-card">
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1.5">
                      <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject (optional)" className="h-8 text-sm" />
                      <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type your message..."
                        className="min-h-[60px] text-sm resize-none"
                        onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); if (body.trim()) sendMessage.mutate(); } }} />
                    </div>
                    <Button onClick={() => sendMessage.mutate()} disabled={!body.trim() || sendMessage.isPending} className="self-end h-9 px-4">
                      {sendMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RecruiterMessagesPage;
