import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import EventIcon from '@mui/icons-material/Event';
import { Box, Typography, Paper, Container, CircularProgress, Button, Stack } from '@mui/material';

import { useAuthStore } from '@/stores/auth-store';
import { useEventStore } from '@/stores/event-store';

function Welcome() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const {
    selectedEvent,
    registeredEvents,
    registeredEventsLoaded,
    isLoading,
    fetchRegisteredEvents,
  } = useEventStore();

  // Fetch registered events on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && !registeredEventsLoaded) {
      fetchRegisteredEvents().catch(console.error);
    }
  }, [isAuthenticated, registeredEventsLoaded, fetchRegisteredEvents]);

  // Auto-redirect to event if user has exactly one event
  useEffect(() => {
    if (isAuthenticated && registeredEventsLoaded) {
      if (registeredEvents.length === 1 && registeredEvents[0].event?.slug) {
        navigate(`/events/${registeredEvents[0].event.slug}`);
      } else if (selectedEvent) {
        // If an event is already selected, navigate to it
        navigate(`/events/${selectedEvent.slug}`);
      }
    }
  }, [isAuthenticated, registeredEventsLoaded, registeredEvents, selectedEvent, navigate]);

  // Loading state
  if (isAuthenticated && (isLoading || !registeredEventsLoaded)) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="body1" color="text.secondary">
          Loading your events...
        </Typography>
      </Box>
    );
  }

  // Not authenticated - show welcome message
  if (!isAuthenticated) {
    return (
      <>
        <meta name="title" content="Welcome to Donor Portal" />
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <EventIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Welcome to the Donor Portal
            </Typography>
            <Typography color="text.secondary" paragraph>
              Please sign in to access your events and event information.
            </Typography>
            <Button variant="contained" color="primary" href="/sign-in" size="large">
              Sign In
            </Button>
          </Paper>
        </Container>
      </>
    );
  }

  // Authenticated but no events
  if (registeredEvents.length === 0) {
    return (
      <>
        <meta name="title" content="No Events" />
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Welcome, {user?.first_name}!
            </Typography>
            <Typography color="text.secondary" paragraph>
              You are not currently registered for any events.
            </Typography>
            <Typography color="text.secondary" variant="body2">
              When you receive an event registration link, click it to register for that event.
            </Typography>
          </Paper>
        </Container>
      </>
    );
  }

  // Authenticated with multiple events - show event list
  return (
    <>
      <meta name="title" content="Your Events" />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.first_name}!
        </Typography>
        <Typography color="text.secondary" paragraph>
          Select an event to view its details.
        </Typography>

        <Stack spacing={2} mt={4}>
          {registeredEvents.map((registration) => (
            <Paper
              key={registration.id}
              elevation={2}
              sx={{
                p: 3,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  elevation: 4,
                  transform: 'translateY(-2px)',
                  bgcolor: 'action.hover',
                },
              }}
              onClick={() => {
                if (registration.event?.slug) {
                  navigate(`/events/${registration.event.slug}`);
                }
              }}
            >
              <Stack direction="row" spacing={3} alignItems="center">
                <EventIcon fontSize="large" color="primary" />
                <Box flex={1}>
                  <Typography variant="h6">{registration.event?.name || 'Unknown Event'}</Typography>
                  {registration.event?.event_datetime && (
                    <Typography color="text.secondary" variant="body2">
                      {new Date(registration.event.event_datetime).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </Typography>
                  )}
                  {registration.event?.venue_name && (
                    <Typography color="text.secondary" variant="body2">
                      {registration.event.venue_name}
                    </Typography>
                  )}
                </Box>
                <Button variant="outlined" size="small">
                  View Event
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Container>
    </>
  );
}

export default Welcome;
