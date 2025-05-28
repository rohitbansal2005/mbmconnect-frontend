import { getProfileImageUrl, getBestProfileImage, fallbackImage } from '../utils/imageUtils';

<>
  {/* In the message Avatar components: */}
  <Avatar
    src={getBestProfileImage(message.sender)}
    alt={message.sender.username}
    sx={{ 
      width: 32, 
      height: 32,
      cursor: 'pointer',
      '&:hover': {
        opacity: 0.8
      },
      '& img': {
        objectFit: 'cover'
      }
    }}
    onClick={() => handleProfileClick(message.sender)}
    onError={e => { e.target.onerror = null; e.target.src = fallbackImage; }}
  >
    {(!message.sender.profilePicture && !message.sender.avatar && message.sender.username)
      ? message.sender.username[0].toUpperCase()
      : null}
  </Avatar>

  {/* In the profile dialog Avatar: */}
  <Avatar
    src={getBestProfileImage(selectedProfile)}
    alt={selectedProfile.username}
    sx={{ width: 100, height: 100 }}
    onError={e => { e.target.onerror = null; e.target.src = fallbackImage; }}
  >
    {(!selectedProfile.profilePicture && !selectedProfile.avatar && selectedProfile.username)
      ? selectedProfile.username[0].toUpperCase()
      : null}
  </Avatar>
</> 