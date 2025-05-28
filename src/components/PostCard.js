const PostCard = ({ post }) => {
    return (
        <div className="post-card">
            <div className="post-header">
                <div className="author-info">
                    <h3 className="font-semibold">
                        {post.author.username}
                        {post.author.isVerified && (
                            <span className="ml-1 text-blue-500" title="Verified Account">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </span>
                        )}
                    </h3>
                </div>
            </div>
            {/* ... rest of the post card component ... */}
        </div>
    );
}; 