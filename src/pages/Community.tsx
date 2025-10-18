import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Image, Send, User, Calendar, Heart, Trash2, Upload } from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/Header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface Post {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_name: string;
  comment_count: number;
  like_count: number;
  is_liked_by_user: boolean;
  is_owner: boolean;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user_name: string;
}

const Community = () => {
  const { toast } = useToast();
  const { isAuthenticated, userId } = useAuth();
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
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [newPostImagePreview, setNewPostImagePreview] = useState<string>("");
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/community/posts", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast({
        title: "Error",
        description: "Failed to load community posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPostImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchComments = async (postId: number) => {
    setLoadingComments(true);
    try {
      const response = await fetch(`http://localhost:8000/api/community/posts/${postId}/comments`);
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      const data = await response.json();
      setComments(data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
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
    
    setIsSubmitting(true);
    
    try {
      // For now, we'll use a placeholder for image upload
      // In a real app, you would upload the image to a server or cloud storage
      const imageUrl = newPostImagePreview || null;
      
      const response = await fetch("http://localhost:8000/api/community/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          image_url: imageUrl
        })
      });
      
      if (response.ok) {
        toast({
          title: "Post Created",
          description: "Your post has been published!",
        });
        setNewPostTitle("");
        setNewPostContent("");
        setNewPostImage(null);
        setNewPostImagePreview("");
        setIsCreatePostOpen(false);
        fetchPosts();
      } else {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create post");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
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
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`http://localhost:8000/api/community/posts/${selectedPost.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          content: newComment
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setComments([...comments, data]);
        setNewComment("");
        fetchPosts(); // Refresh post list to update comment count
      } else {
        const error = await response.json();
        throw new Error(error.detail || "Failed to add comment");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteComment = async (commentId: number) => {
    if (!isAuthenticated) {
      return;
    }
    
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8000/api/community/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (response.ok) {
        toast({
          title: "Comment Deleted",
          description: "Your comment has been deleted successfully",
        });
        // Remove the deleted comment from state
        setComments(comments.filter(comment => comment.id !== commentId));
        // Refresh posts to update comment count
        fetchPosts();
      } else {
        throw new Error("Failed to delete comment");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const handleLikePost = async (postId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8000/api/community/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update the posts state to reflect the new like status
        setPosts(posts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                like_count: data.like_count,
                is_liked_by_user: data.status === "liked" 
              } 
            : post
        ));
      } else {
        throw new Error("Failed to like post");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    }
  };
  
  const handleDeletePost = async (postId: number) => {
    if (!isAuthenticated) {
      return;
    }
    
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8000/api/community/posts/${postId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (response.ok) {
        toast({
          title: "Post Deleted",
          description: "Your post has been deleted successfully",
        });
        // Remove the deleted post from state
        setPosts(posts.filter(post => post.id !== postId));
      } else {
        throw new Error("Failed to delete post");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const handleViewPost = (post: Post) => {
    setSelectedPost(post);
    fetchComments(post.id);
    setIsViewPostOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-20 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Create post card */}
          {isAuthenticated && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-white">
                      {userId?.substring(0, 2) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    variant="outline" 
                    className="w-full text-left justify-start text-gray-500 font-normal"
                    onClick={() => setIsCreatePostOpen(true)}
                  >
                    What's on your mind?
                  </Button>
                </div>
                <Separator />
                <div className="flex justify-between pt-3">
                  <Button variant="ghost" onClick={() => setIsCreatePostOpen(true)}>
                    <Image className="h-4 w-4 mr-2" /> Photo
                  </Button>
                  <Button variant="ghost" onClick={() => setIsCreatePostOpen(true)}>
                    <MessageSquare className="h-4 w-4 mr-2" /> Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Posts Section */}
          <section>
            {loading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 p-8 bg-red-50 rounded-lg">
                <p>{error}</p>
                <Button variant="outline" onClick={fetchPosts} className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center p-12 bg-muted rounded-lg">
                <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                <p className="text-muted-foreground mb-6">Be the first to share your story with the community!</p>
                <Button onClick={() => setIsCreatePostOpen(true)}>Create First Post</Button>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary text-white">
                              {post.user_name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{post.user_name}</h3>
                            <p className="text-xs text-gray-500">
                              {format(new Date(), 'MMM d, yyyy • h:mm a')}
                            </p>
                          </div>
                        </div>
                        {post.is_owner && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <h4 className="font-medium mb-2">{post.title}</h4>
                      <p className="mb-4">{post.content}</p>
                      {post.image_url && (
                        <div className="mb-4 -mx-6">
                          <img 
                            src={post.image_url} 
                            alt={post.title} 
                            className="w-full object-cover max-h-96"
                          />
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-gray-500 pt-2">
                        <div>{post.like_count} likes</div>
                        <div>{post.comment_count} comments</div>
                      </div>
                    </CardContent>
                    <Separator />
                    <CardFooter className="flex justify-between py-3">
                      <Button 
                        variant="ghost" 
                        className={post.is_liked_by_user ? "text-primary" : ""}
                        onClick={() => handleLikePost(post.id)}
                      >
                        <Heart className={`h-4 w-4 mr-2 ${post.is_liked_by_user ? "fill-primary" : ""}`} />
                        Like
                      </Button>
                      <Button 
                        variant="ghost"
                        onClick={() => handleViewPost(post)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Comment
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

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
              <label htmlFor="image" className="text-sm font-medium">Image (optional)</label>
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {newPostImagePreview && (
                  <span className="text-sm text-green-600">Image selected</span>
                )}
              </div>
              {newPostImagePreview && (
                <div className="mt-2">
                  <img 
                    src={newPostImagePreview} 
                    alt="Preview" 
                    className="max-h-40 rounded-md"
                  />
                </div>
              )}
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
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-white">
                      {selectedPost.user_name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle>{selectedPost.title}</DialogTitle>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <span>{selectedPost.user_name}</span>
                      <span className="mx-2">•</span>
                      <span>{format(new Date(), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="whitespace-pre-line">{selectedPost.content}</p>
                {selectedPost.image_url && (
                  <div className="mt-4 overflow-hidden rounded-md">
                    <img src={selectedPost.image_url} alt={selectedPost.title} className="w-full h-auto" />
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500 py-3">
                  <div>{selectedPost.like_count} likes</div>
                  <div>{selectedPost.comment_count} comments</div>
                </div>
                <Separator />
                <div className="flex justify-between py-3">
                  <Button 
                    variant="ghost" 
                    className={selectedPost.is_liked_by_user ? "text-primary" : ""}
                    onClick={() => handleLikePost(selectedPost.id)}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${selectedPost.is_liked_by_user ? "fill-primary" : ""}`} />
                    Like
                  </Button>
                  <Button variant="ghost">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Comment
                  </Button>
                </div>
                <Separator />
                
                <div className="border-t pt-4 mt-6">
                  <h3 className="font-medium mb-4">Comments ({comments.length})</h3>
                  
                  {loadingComments ? (
                    <div className="text-center p-4">Loading comments...</div>
                  ) : comments.length === 0 ? (
                    <div className="text-center p-4 text-muted-foreground">No comments yet</div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-white text-xs">
                              {comment.user_name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 bg-muted rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div className="font-medium">{comment.user_name}</div>
                              <div className="flex items-center gap-2">
                                <div className="text-xs text-muted-foreground">
                                   {format(new Date(), 'MMM d, yyyy')}
                                 </div>
                                {comment.user_name === userId && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 text-red-500 hover:text-red-700"
                                    onClick={() => handleDeleteComment(comment.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <p className="mt-1">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {isAuthenticated && (
                    <form onSubmit={handleAddComment} className="mt-4 flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-white text-xs">
                          {userId?.substring(0, 2) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          required
                        />
                        <Button type="submit" size="icon" disabled={isSubmitting || !newComment}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
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

export default Community;