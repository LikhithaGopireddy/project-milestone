import { useState } from "react";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface PostCardProps {
  post: any;
  currentUserId: string;
  onUpdate: () => void;
}

const PostCard = ({ post, currentUserId, onUpdate }: PostCardProps) => {
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const isLiked = post.likes?.some((like: any) => like.user_id === currentUserId);
  const likesCount = post.likes?.length || 0;
  const commentsCount = post.comments?.length || 0;

  const handleLike = async () => {
    if (!currentUserId) return;

    try {
      if (isLiked) {
        const likeToDelete = post.likes.find((like: any) => like.user_id === currentUserId);
        await supabase.from("likes").delete().eq("id", likeToDelete.id);
      } else {
        await supabase.from("likes").insert({ post_id: post.id, user_id: currentUserId });
      }
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !currentUserId) return;

    try {
      await supabase.from("comments").insert({
        post_id: post.id,
        user_id: currentUserId,
        text: comment,
      });
      setComment("");
      onUpdate();
      loadComments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });

      if (commentsError) throw commentsError;

      // Get unique user IDs from comments
      const userIds = [...new Set(commentsData?.map(c => c.user_id) || [])];
      
      // Fetch profiles for those users
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Create a map of user_id to username
      const profilesMap = new Map(profilesData?.map(p => [p.id, p.username]) || []);

      // Merge comments with usernames
      const commentsWithUsernames = commentsData?.map(comment => ({
        ...comment,
        username: profilesMap.get(comment.user_id) || "Unknown",
      })) || [];

      setComments(commentsWithUsernames);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setLoadingComments(false);
    }
  };

  const handleShowComments = () => {
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  const handleDeletePost = async () => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", post.id);
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-accent to-[hsl(45,100%,51%)] flex items-center justify-center text-primary-foreground font-bold">
                {post.username?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-semibold">{post.username || "Unknown"}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          {post.user_id === currentUserId && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-5 w-5 text-destructive" />
            </Button>
          )}
        </div>

        <img
          src={post.image_url}
          alt={post.caption}
          className="w-full aspect-square object-cover"
        />

        <div className="p-4 space-y-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLike}
              className="hover:scale-110 transition-transform"
            >
              <Heart
                className={`h-6 w-6 ${isLiked ? "fill-primary text-primary" : ""}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShowComments}
              className="hover:scale-110 transition-transform"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </div>

          <div>
            <p className="font-semibold text-sm">{likesCount} likes</p>
            {post.caption && (
              <p className="text-sm mt-1">
                <span className="font-semibold">{post.username}</span> {post.caption}
              </p>
            )}
            {commentsCount > 0 && (
              <button
                onClick={handleShowComments}
                className="text-sm text-muted-foreground mt-1 hover:underline"
              >
                View all {commentsCount} comments
              </button>
            )}
          </div>

          {showComments && (
            <div className="space-y-2 pt-2 border-t">
              {loadingComments ? (
                <p className="text-sm text-muted-foreground">Loading comments...</p>
              ) : (
                comments.map((c: any) => (
                  <div key={c.id} className="text-sm">
                    <span className="font-semibold">{c.username}</span> {c.text}
                  </div>
                ))
              )}
            </div>
          )}

          <form onSubmit={handleComment} className="flex gap-2 pt-2 border-t">
            <Input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1"
            />
            <Button type="submit" disabled={!comment.trim()}>
              Post
            </Button>
          </form>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PostCard;
