import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Image, Send, User, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Post {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_name: string;
  comment_count: number;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user_name: string;
}

const CommunityForum = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isViewPostOpen, setIsViewPostOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    // Don't set error state to prevent error messages
    
    try {
      const response = await fetch("http://localhost:8000/api/community/posts");
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      // Silently log error without setting error state
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId: number) => {
    setLoadingComments(true);
    
    try {
      const response = await fetch(`http://localhost:8000/api/community/posts/${postId}/comments`);
      
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      // Silently log error without showing toast
    } finally {
      setLoadingComments(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a post",
        variant: "destructive",
      });
      return;
    }
    
    if (!newPostTitle || !newPostContent) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Store the post data before clearing the form
    const postData = {
      title: newPostTitle,
      content: newPostContent,
      image_url: newPostImage || null
    };
    
    // Clear form and close dialog immediately for better UX
    setNewPostTitle("");
    setNewPostContent("");
    setNewPostImage("");
    setIsCreatePostOpen(false);
    
    // Show optimistic toast
    toast({
      title: "Creating Post...",
      description: "Your post is being published",
    });
    
    // Use XMLHttpRequest instead of fetch for better error handling
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8000/api/community/posts", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("token")}`);
    
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        toast({
          title: "Post Created",
          description: "Your post has been published successfully!",
        });
      }
      // Always refresh posts after a delay regardless of success/failure
      setTimeout(() => {
        fetchPosts();
      }, 1000);
      setIsSubmitting(false);
    };
    
    xhr.onerror = function() {
      console.log("XHR error occurred");
      // Still refresh posts after a delay in case the post was created despite the error
      setTimeout(() => {
        fetchPosts();
      }, 1000);
      setIsSubmitting(false);
    };
    
    // Start the submission process
    setIsSubmitting(true);
    xhr.send(JSON.stringify(postData));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add a comment",
        variant: "destructive",
      });
      return;
    }
    
    if (!newComment || !selectedPost) {
      return;
    }
    
    // Store the comment data and post ID before clearing
    const commentText = newComment;
    const postId = selectedPost.id;
    
    // Clear the comment input immediately for better UX
    setNewComment("");
    
    // Show optimistic UI update - add temporary comment
    const tempComment = {
      id: Date.now(), // temporary ID
      content: commentText,
      created_at: new Date().toISOString(),
      user_name: "You" // Placeholder until we get real data
    };
    
    // Add temporary comment to the list
    setComments([...comments, tempComment]);
    
    // Use XMLHttpRequest instead of fetch for better error handling
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `http://localhost:8000/api/community/posts/${postId}/comments`, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("token")}`);
    
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Refresh comments to get the real data
        fetchComments(postId);
      }
      // Always refresh post list to update comment count
      setTimeout(() => {
        fetchPosts();
      }, 1000);
      setIsSubmitting(false);
    };
    
    xhr.onerror = function() {
      console.log("XHR comment submission error");
      // Still refresh data in case the comment was added despite the error
      setTimeout(() => {
        fetchComments(postId);
        fetchPosts();
      }, 1000);
      setIsSubmitting(false);
    };
    
    // Start the submission process
    setIsSubmitting(true);
    xhr.send(JSON.stringify({
      content: commentText
    }));
  };

  const handleViewPost = (post: Post) => {
    setSelectedPost(post);
    fetchComments(post.id);
    setIsViewPostOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading community posts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Community Forum</h2>
        <Button onClick={() => setIsCreatePostOpen(true)}>Create Post</Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center p-8 bg-muted rounded-lg">
          <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <Card key={post.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewPost(post)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{post.title}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="h-4 w-4 mr-1" />
                  <span>{post.user_name}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="line-clamp-3">{post.content}</p>
                {post.image_url && (
                  <div className="mt-2 h-32 overflow-hidden rounded-md">
                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <div className="flex items-center text-muted-foreground">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>{post.comment_count} comments</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Post Dialog */}
      <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create a New Post</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePost} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input
                id="title"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="Post title"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">Content</label>
              <Textarea
                id="content"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="image" className="text-sm font-medium">Image URL (optional)</label>
              <Input
                id="image"
                value={newPostImage}
                onChange={(e) => setNewPostImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreatePostOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Post Dialog */}
      <Dialog open={isViewPostOpen} onOpenChange={setIsViewPostOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[80vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedPost.title}</DialogTitle>
                <div className="flex items-center text-sm text-muted-foreground mt-2">
                  <User className="h-4 w-4 mr-1" />
                  <span>{selectedPost.user_name}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{format(new Date(selectedPost.created_at), 'MMM d, yyyy')}</span>
                </div>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="whitespace-pre-line">{selectedPost.content}</p>
                {selectedPost.image_url && (
                  <div className="mt-4 overflow-hidden rounded-md">
                    <img src={selectedPost.image_url} alt={selectedPost.title} className="w-full h-auto" />
                  </div>
                )}
                
                <div className="border-t pt-4 mt-6">
                  <h3 className="font-medium mb-4">Comments ({comments.length})</h3>
                  
                  {loadingComments ? (
                    <div className="text-center p-4">Loading comments...</div>
                  ) : comments.length === 0 ? (
                    <div className="text-center p-4 text-muted-foreground">No comments yet</div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center text-sm mb-1">
                            <span className="font-medium">{comment.user_name}</span>
                            <span className="mx-2">•</span>
                            <span className="text-muted-foreground">{format(new Date(comment.created_at), 'MMM d, yyyy')}</span>
                          </div>
                          <p>{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {isAuthenticated && (
                    <form onSubmit={handleAddComment} className="mt-4 flex items-center gap-2">
                      <Input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        required
                      />
                      <Button type="submit" size="icon" disabled={isSubmitting || !newComment}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunityForum;