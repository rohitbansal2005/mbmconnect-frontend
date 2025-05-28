export const getProfileImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // If it's already a full URL, return it
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Normalize path: remove leading slashes, replace backslashes with forward slashes
  let cleanPath = imagePath.replace(/^[/\\]+/, '').replace(/\\/g, '/');
  // Remove any double slashes except after http(s):
  cleanPath = cleanPath.replace(/([^:]\/)\/+/g, '$1');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  return `${backendUrl}/${cleanPath}`;
};

// Helper function to get the best available profile image
export const getBestProfileImage = (user) => {
  if (!user) return fallbackImage;
  return getProfileImageUrl(user.profilePicture || user.avatar) || fallbackImage;
};

export const fallbackImage = process.env.PUBLIC_URL + '/default-avatar.png'; 