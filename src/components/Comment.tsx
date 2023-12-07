type CommentProps = {
  username?: string;
  content: string;
  authorName: string;
  authorHandle: string;
};

// note that the Comment component is also a server component
// all client side things are abstracted away in other components
export default function Comment({
  // username,
  content,
  authorName,
  // authorHandle,
}: CommentProps) {
  return (
    <div className="my-4 py-4 px-4 flex items-center justify-start gap-3 border-2 border-green-900 px-2 bg-green-300 text-green-900 rounded-lg">
      {authorName}:  {content}
    </div>
  );
}
