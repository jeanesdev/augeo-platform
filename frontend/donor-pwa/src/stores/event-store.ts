/**
 * Event store for donor PWA.
 * Manages current event selection and registered events list.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import apiClient from '@/lib/axios';
import type { Event, EventDetail, EventRegistration, EventRegistrationListResponse } from '@/types/event';
import { getErrorMessage } from '@/utils/error';

interface EventState {
  // Current selected event
  selectedEvent: EventDetail | null;
  selectedEventId: string | null;

  // User's registered events
  registeredEvents: EventRegistration[];
  registeredEventsLoaded: boolean;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedEvent: (event: EventDetail | null) => void;
  setSelectedEventId: (eventId: string | null) => void;
  setRegisteredEvents: (events: EventRegistration[]) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;

  // API methods
  fetchRegisteredEvents: () => Promise<EventRegistration[]>;
  fetchEventDetails: (eventId: string) => Promise<EventDetail>;
  fetchEventBySlug: (slug: string) => Promise<EventDetail>;
  selectEvent: (eventId: string) => Promise<void>;
}

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      selectedEvent: null,
      selectedEventId: null,
      registeredEvents: [],
      registeredEventsLoaded: false,
      isLoading: false,
      error: null,

      // Setters
      setSelectedEvent: (event) =>
        set({
          selectedEvent: event,
          selectedEventId: event?.id || null,
        }),

      setSelectedEventId: (eventId) => set({ selectedEventId: eventId }),

      setRegisteredEvents: (events) =>
        set({
          registeredEvents: events,
          registeredEventsLoaded: true,
        }),

      setError: (error) => set({ error }),

      setLoading: (loading) => set({ isLoading: loading }),

      reset: () =>
        set({
          selectedEvent: null,
          selectedEventId: null,
          registeredEvents: [],
          registeredEventsLoaded: false,
          error: null,
        }),

      // API methods
      fetchRegisteredEvents: async (): Promise<EventRegistration[]> => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.get<EventRegistrationListResponse>('/registrations', {
            params: {
              status_filter: 'confirmed',
              per_page: 100,
            },
          });

          const registrations = response.data.registrations;

          set({
            registeredEvents: registrations,
            registeredEventsLoaded: true,
            isLoading: false,
          });

          // If user has exactly one event, auto-select it
          if (registrations.length === 1 && registrations[0].event) {
            await get().selectEvent(registrations[0].event_id);
          } else if (registrations.length > 0) {
            // If user has multiple events and no event is selected, select the first one
            const currentSelectedId = get().selectedEventId;
            const hasValidSelection = registrations.some(
              (r) => r.event_id === currentSelectedId,
            );

            if (!hasValidSelection && registrations[0].event) {
              await get().selectEvent(registrations[0].event_id);
            }
          }

          return registrations;
        } catch (error: unknown) {
          const errorMessage = getErrorMessage(error, 'Failed to fetch registered events');
          set({ error: errorMessage, isLoading: false, registeredEventsLoaded: true });
          throw error;
        }
      },

      fetchEventDetails: async (eventId: string): Promise<EventDetail> => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.get<EventDetail>(`/events/${eventId}`);
          set({ isLoading: false });
          return response.data;
        } catch (error: unknown) {
          const errorMessage = getErrorMessage(error, 'Failed to fetch event details');
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      fetchEventBySlug: async (slug: string): Promise<EventDetail> => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.get<EventDetail>(`/events/public/${slug}`);
          set({ isLoading: false });
          return response.data;
        } catch (error: unknown) {
          const errorMessage = getErrorMessage(error, 'Failed to fetch event details');
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      selectEvent: async (eventId: string): Promise<void> => {
        set({ isLoading: true, error: null });

        try {
          const eventDetails = await get().fetchEventDetails(eventId);
          set({
            selectedEvent: eventDetails,
            selectedEventId: eventId,
            isLoading: false,
          });
        } catch (error: unknown) {
          const errorMessage = getErrorMessage(error, 'Failed to select event');
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'donor-event-storage',
      partialize: (state) => ({
        selectedEventId: state.selectedEventId,
      }),
    },
  ),
);

// Helper function to get events with event details populated
export const getEventsWithDetails = (registrations: EventRegistration[]): Event[] => {
  return registrations
    .filter((r) => r.event)
    .map((r) => r.event as Event);
};
