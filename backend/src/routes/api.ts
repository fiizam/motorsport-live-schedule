import { Hono } from 'hono';
import { F1Provider } from '../services/f1-provider.js';
import { MotoGPProvider } from '../services/motogp-provider.js';

const api = new Hono();
const f1Provider = new F1Provider();
const motoGPProvider = new MotoGPProvider();

// Utility endpoints
api.get('/health', (c) => c.json({ status: 'ok' }));
api.get('/status', (c) => c.json({ status: 'operational' }));
api.get('/version', (c) => c.json({ version: '1.0.0' }));
api.get('/providers', (c) => c.json({
  f1: 'OpenF1 (Primary) / Jolpica (Fallback)',
  motogp: 'Wikipedia Scraper (Primary)'
}));

// F1 Endpoints
api.get('/f1/calendar', async (c) => {
  try {
    const calendar = await f1Provider.getCalendar();
    return c.json(calendar);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

api.get('/f1/upcoming', async (c) => {
  try {
    const event = await f1Provider.getUpcomingEvent();
    if (!event) return c.json({ error: 'No upcoming F1 events found' }, 404);
    return c.json(event);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

api.get('/f1/event/:eventId', async (c) => {
  try {
    const eventId = c.req.param('eventId');
    const event = await f1Provider.getEventById(eventId);
    if (!event) return c.json({ error: 'Event not found' }, 404);
    
    let eventData: any = event;
    const season = new Date().getFullYear();
    
    try {
      const results = await f1Provider.getRaceResults(season, eventId);
      eventData = { 
        ...event, 
        raceResult: results.race, 
        sprintResult: results.sprint,
        qualifyingResult: results.qualifying 
      };
    } catch (resultsError: any) {
      console.error(`[API] Could not fetch results for event ${eventId}:`, resultsError.message);
      // Fallback to minimal state if provider is down
      eventData.resultsUnavailable = true;
      eventData.raceResult = { status: 'ERROR', reason: 'RESULTS_UNAVAILABLE' };
      if (event.hasSprint) eventData.sprintResult = { status: 'ERROR', reason: 'RESULTS_UNAVAILABLE' };
    }
    
    return c.json(eventData);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

api.get('/f1/event/:eventId/results', async (c) => {
  try {
    const eventId = c.req.param('eventId');
    const season = new Date().getFullYear(); // or pass via query
    const results = await f1Provider.getRaceResults(season, eventId);
    return c.json(results);
  } catch (error: any) {
    return c.json({ available: false, reason: 'RESULTS_UNAVAILABLE', error: error.message }, 503);
  }
});

api.get('/f1/standings', async (c) => {
  try {
    const yearStr = c.req.query('year');
    const year = yearStr ? parseInt(yearStr, 10) : undefined;
    const standings = await f1Provider.getStandings(year);
    return c.json(standings);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

api.get('/f1/current-session', async (c) => {
  try {
    const event = await f1Provider.getUpcomingEvent();
    if (!event) return c.json({ error: 'No event' }, 404);
    const liveSession = event.sessions.find(s => s.status === 'LIVE');
    if (liveSession) return c.json(liveSession);
    const nextSession = event.sessions.find(s => s.status === 'UPCOMING');
    if (nextSession) return c.json(nextSession);
    return c.json({ error: 'No active session' }, 404);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

api.get('/f1/live', async (c) => {
  // Can proxy to OpenF1 live timings in the future
  return c.json({ status: 'Not fully implemented' }, 501);
});


// MotoGP Endpoints
api.get('/motogp/calendar', async (c) => {
  try {
    const calendar = await motoGPProvider.getCalendar();
    return c.json(calendar);
  } catch (error: any) {
    return c.json({ error: error.message, status: 'ERROR' }, 500);
  }
});

api.get('/motogp/upcoming', async (c) => {
  try {
    const event = await motoGPProvider.getUpcomingEvent();
    if (!event) return c.json({ error: 'No upcoming MotoGP events found' }, 404);
    return c.json(event);
  } catch (error: any) {
    return c.json({ error: error.message, status: 'ERROR' }, 500);
  }
});

api.get('/motogp/event/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const event = await motoGPProvider.getEventBySlug(slug);
    if (!event) return c.json({ error: 'Event not found' }, 404);
    
    let eventData: any = event;
    const results = await motoGPProvider.getEventResults(slug);
    if (results.raceResult || results.sprintResult) {
       eventData = { ...event, raceResult: results.raceResult, sprintResult: results.sprintResult };
    }
    
    return c.json(eventData);
  } catch (error: any) {
    return c.json({ error: error.message, status: 'ERROR' }, 500);
  }
});

api.get('/motogp/event/:slug/results', async (c) => {
  try {
    const slug = c.req.param('slug');
    const results = await motoGPProvider.getEventResults(slug);
    return c.json(results);
  } catch (error: any) {
    return c.json({ error: error.message, status: 'ERROR' }, 500);
  }
});

api.get('/motogp/standings', async (c) => {
  try {
    const yearStr = c.req.query('year');
    const year = yearStr ? parseInt(yearStr, 10) : undefined;
    const standings = await motoGPProvider.getStandings(year);
    return c.json(standings);
  } catch (error: any) {
    return c.json({ error: error.message, status: 'ERROR' }, 500);
  }
});

api.get('/motogp/current-session', async (c) => {
  try {
    const event = await motoGPProvider.getUpcomingEvent();
    if (!event) return c.json({ error: 'No event' }, 404);
    const liveSession = event.sessions.find(s => s.status === 'LIVE');
    if (liveSession) return c.json(liveSession);
    const nextSession = event.sessions.find(s => s.status === 'UPCOMING');
    if (nextSession) return c.json(nextSession);
    return c.json({ error: 'No active session' }, 404);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

api.get('/motogp/live', async (c) => {
  return c.json({ status: 'Not fully implemented' }, 501);
});

export function startCronJobs() {
  setInterval(async () => {
    // Refresh caches periodically
    try {
      await f1Provider.getCalendar();
      await motoGPProvider.getCalendar();
    } catch (e) {
      console.error('Background sync failed', e);
    }
  }, 15 * 60 * 1000); // 15 mins
}

export { api };
