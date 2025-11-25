import { Link } from 'react-router';

import EventIcon from '@mui/icons-material/Event';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SwipeableDrawer,
  Divider,
  Box,
  Typography,
} from '@mui/material';

import { useEventStore } from '@/stores/event-store';
import { useAuthStore } from '@/stores/auth-store';

import { useSidebar } from './hooks';

function Sidebar() {
  const { isOpen, open, close } = useSidebar();
  const { selectedEvent, registeredEvents } = useEventStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    close();
    await logout();
  };

  // Build sidebar items based on authentication and event state
  const mainNavItems = [
    {
      path: '/',
      title: 'Home',
      icon: HomeIcon,
    },
  ];

  // Add event home if an event is selected
  if (selectedEvent) {
    mainNavItems.push({
      path: `/events/${selectedEvent.slug}`,
      title: 'Event Home',
      icon: EventIcon,
    });
  }

  return (
    <SwipeableDrawer
      anchor="left"
      open={isOpen}
      onClose={close}
      onOpen={open}
      disableBackdropTransition={false}
      swipeAreaWidth={30}
      data-pw="sidebar"
    >
      <Box sx={{ width: 280 }}>
        {/* Header with user info */}
        <Box
          sx={{
            p: 2,
            pt: (theme) => `calc(${theme.mixins.toolbar.minHeight}px + ${theme.spacing(2)})`,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          {isAuthenticated && user ? (
            <>
              <Typography variant="subtitle1" fontWeight="bold">
                {user.first_name} {user.last_name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {user.email}
              </Typography>
            </>
          ) : (
            <Typography variant="subtitle1">Donor Portal</Typography>
          )}
        </Box>

        {/* Main Navigation */}
        <List>
          {mainNavItems.map(({ path, title, icon: Icon }) => (
            <ListItem key={path} disablePadding>
              <ListItemButton component={Link} to={path} onClick={close}>
                <ListItemIcon>
                  <Icon />
                </ListItemIcon>
                <ListItemText primary={title} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Event List (if multiple events) */}
        {registeredEvents.length > 1 && (
          <>
            <Divider />
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Your Events
              </Typography>
            </Box>
            <List dense>
              {registeredEvents.map((registration) => (
                <ListItem key={registration.id} disablePadding>
                  <ListItemButton
                    component={Link}
                    to={`/events/${registration.event?.slug || registration.event_id}`}
                    onClick={close}
                    selected={registration.event_id === selectedEvent?.id}
                  >
                    <ListItemIcon>
                      <EventIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={registration.event?.name || 'Unknown Event'}
                      secondary={
                        registration.event?.event_datetime
                          ? new Date(registration.event.event_datetime).toLocaleDateString()
                          : undefined
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Account Section */}
        {isAuthenticated && (
          <>
            <Divider />
            <List>
              <ListItem disablePadding>
                <ListItemButton onClick={close}>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="My Profile" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary="Sign Out" />
                </ListItemButton>
              </ListItem>
            </List>
          </>
        )}
      </Box>
    </SwipeableDrawer>
  );
}

export default Sidebar;
