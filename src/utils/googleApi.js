const GAPI_SCRIPT = 'https://apis.google.com/js/api.js';
const GIS_SCRIPT = 'https://accounts.google.com/gsi/client';

let tokenClient = null;

export const loadGoogleScripts = () => {
  return Promise.all([
    loadScript(GAPI_SCRIPT, 'gapi'),
    loadScript(GIS_SCRIPT, 'google')
  ]);
};

const loadScript = (src, globalVar) => {
  return new Promise((resolve, reject) => {
    if (typeof window[globalVar] !== 'undefined') {
      return resolve();
    }
    
    // Check if script is already in DOM to avoid duplicates
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
        existingScript.addEventListener('load', resolve);
        existingScript.addEventListener('error', reject);
        return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
};

export const initializeGapiClient = async () => {
  await new Promise((resolve, reject) => {
    if (!window.gapi) {
        return reject(new Error('gapi not loaded'));
    }
    window.gapi.load('client', { callback: resolve, onerror: reject });
  });

  await window.gapi.client.init({
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
  });
};

export const initializeGoogleAuth = (clientId, onTokenCallback) => {
  if (!window.google || !window.google.accounts) {
      throw new Error('Google Identity Services script not loaded');
  }
  
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'https://www.googleapis.com/auth/calendar.events email profile',
    callback: (tokenResponse) => {
        if (tokenResponse && tokenResponse.access_token) {
            // Set the token for gapi calls
            if (window.gapi && window.gapi.client) {
                // Ensure gapi client uses the token
                // Some versions of gapi need `gapi.client.setToken` explicitly
                // This is the correct way for the new GIS model + GAPI client
                window.gapi.client.setToken(tokenResponse);
            }
            if (onTokenCallback) {
                onTokenCallback(tokenResponse);
            }
        }
    },
  });
  
  return tokenClient;
};

export const signIn = () => {
  if (tokenClient) {
    // Prompt the user to select an account.
    // Use prompt: 'consent' to ensure we get a fresh consent if needed
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    console.error('Token client not initialized');
  }
};

export const signOut = () => {
  if (window.gapi && window.gapi.client) {
      const token = window.gapi.client.getToken();
      if (token !== null) {
        window.google.accounts.oauth2.revoke(token.access_token, () => {
            console.log('Token revoked');
        });
        window.gapi.client.setToken('');
      }
  }
};

export const createCalendarEvent = async (eventDetails) => {
    // eventDetails: { summary, description, start, end, attendees }
    
    // Ensure start/end are formatted correctly
    const formatDate = (d) => {
        if (d instanceof Date) return d.toISOString();
        return d; // Assume string ISO
    };

    // Attendees format: [{email: 'a@b.com'}, ...]
    
    const event = {
        summary: eventDetails.summary,
        description: eventDetails.description,
        start: {
            dateTime: formatDate(eventDetails.start),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
            dateTime: formatDate(eventDetails.end),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        attendees: eventDetails.attendees || [],
        conferenceData: {
            createRequest: {
                requestId: Math.random().toString(36).substring(7),
                conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
        },
    };

    try {
        // Ensure client is loaded
        if (!window.gapi.client.calendar) {
            throw new Error('Calendar API not loaded');
        }

        const request = window.gapi.client.calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1, // Crucial for GMeet link generation
            sendUpdates: 'all', // Send emails to attendees
        });

        const response = await request;
        return response.result;
    } catch (error) {
        console.error('Error creating event', error);
        throw error;
    }
};
