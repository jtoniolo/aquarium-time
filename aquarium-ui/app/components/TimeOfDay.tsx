import { Box, useTheme } from '@mui/material';
import { useSunSocket } from '../hooks/useSunSocket';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { keyframes } from '@mui/system';

const SKY_HEIGHT = 140; // Height of our sky component

// Create glow animations
const sunGlow = keyframes`
  0% { filter: drop-shadow(0 0 10px rgba(255,255,0,0.5)); }
  50% { filter: drop-shadow(0 0 15px rgba(255,255,0,0.7)); }
  100% { filter: drop-shadow(0 0 10px rgba(255,255,0,0.5)); }
`;

const moonGlow = keyframes`
  0% { filter: drop-shadow(0 0 10px rgba(255,255,255,0.3)); }
  50% { filter: drop-shadow(0 0 15px rgba(255,255,255,0.5)); }
  100% { filter: drop-shadow(0 0 10px rgba(255,255,255,0.3)); }
`;

const stars = Array(50).fill(0).map(() => ({
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 2}s`,
}));

const starTwinkle = keyframes`
  0% { opacity: 0.2; }
  50% { opacity: 1; }
  100% { opacity: 0.2; }
`;

export default function TimeOfDay() {
  const theme = useTheme();
  const sunData = useSunSocket();

  if (!sunData) {
    return null;
  }

  const { timeOfDay, cyclePercentage } = sunData;

  const getBackgroundGradient = () => {
    switch (timeOfDay) {
      case 'night':
        return `linear-gradient(to bottom, #000428 0%, #004e92 100%)`;
      case 'sunrise':
        return `linear-gradient(to bottom, #2c3e50 0%, #fd746c 50%, #ffd700 100%)`;
      case 'sunset':
        return `linear-gradient(to bottom, #2c3e50 0%, #fd746c 50%, #ff4500 100%)`;
      case 'day':
        return `linear-gradient(to bottom, #2196f3 0%, #87ceeb 100%)`;
      default:
        return theme.palette.primary.main;
    }
  };

  const isNight = timeOfDay === 'night';
  const isDawn = timeOfDay === 'sunrise';
  const isDusk = timeOfDay === 'sunset';

  // Position for sun/moon based on cyclePercentage
  const horizontalPosition = `${cyclePercentage}%`;
  
  // Calculate vertical position - arc during day, fixed during night
  const getVerticalPosition = () => {
    if (isNight) return '50%';
    // Create an arc path for sun during day phases
    return `${Math.sin((cyclePercentage / 100) * Math.PI) * 35 + 40}%`;
  };

  return (
    <Box 
      sx={{
        position: 'relative',
        width: '100%',
        height: SKY_HEIGHT,
        background: getBackgroundGradient(),
        borderRadius: 2,
        overflow: 'hidden',
        mb: 3,
        transition: 'background 1s ease-in-out',
      }}
    >
      {/* Stars - only visible at night */}
      {isNight && stars.map((star, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: '2px',
            height: '2px',
            backgroundColor: 'white',
            borderRadius: '50%',
            left: star.left,
            top: star.top,
            opacity: 0.2,
            animation: `${starTwinkle} 2s infinite`,
            animationDelay: star.animationDelay,
          }}
        />
      ))}

      {/* Sun/Moon container */}
      <Box
        sx={{
          position: 'absolute',
          left: horizontalPosition,
          top: getVerticalPosition(),
          transform: 'translate(-50%, -50%)',
          transition: 'all 1s ease-in-out',
        }}
      >
        {isNight ? (
          <DarkModeIcon
            sx={{
              fontSize: 40,
              color: 'white',
              opacity: 0.9,
              animation: `${moonGlow} 3s infinite`,
            }}
          />
        ) : (
          <WbSunnyIcon
            sx={{
              fontSize: 40,
              color: isDawn || isDusk ? '#ffd700' : '#fff176',
              animation: `${sunGlow} 3s infinite`,
            }}
          />
        )}
      </Box>

      {/* Clouds or other atmospheric effects could be added here */}
    </Box>
  );
}