import { CacheService } from './cache-service.js';
import { ProviderLogger } from './provider-logger.js';

export interface ResultClassification {
  position: number | string;
  driverNumber: number;
  driverName: string;
  teamName: string;
  laps: number;
  gapToLeader: string | number;
  points: number;
  status: string;
}

export interface ChampionshipStanding {
  position: number;
  driverName: string;
  teamName: string;
  points: number;
}

export interface F1Session {
  id: string;
  name: string;
  type: 'Practice' | 'Qualifying' | 'Sprint Qualifying' | 'Sprint' | 'Race';
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  status: 'UPCOMING' | 'LIVE' | 'FINISHED';
}

export interface F1Event {
  id: string;
  name: string;
  circuit: string;
  country: string;
  sessions: F1Session[];
  round: number;
  status?: 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED' | 'UNDER_REVIEW' | 'TBC' | 'POSTPONED';
  hasSprint?: boolean;
  originalDate?: string;
  currentDate?: string;
  
  raceResult?: {
    status: string;
    winner: ResultClassification | null;
    classification: ResultClassification[];
  };
  sprintResult?: {
    available: boolean;
    status: string;
    winner: ResultClassification | null;
    classification: ResultClassification[];
  };
  championshipStandings?: {
    drivers: ChampionshipStanding[];
    teams: ChampionshipStanding[];
  };
}

export class F1Provider {
  private cache = new CacheService();
  private readonly OPENF1_URL = 'https://api.openf1.org/v1';
  private readonly JOLPICA_BASE_URL = 'https://api.jolpi.ca/ergast/f1';

  async getCalendar(): Promise<F1Event[]> {
    const cacheKey = 'f1:calendar';
    
    try {
      const cached = await this.cache.get<F1Event[]>(cacheKey);
      if (cached) {
        console.log('[F1Provider] Serving calendar from cache');
        return cached;
      }

      const currentYear = new Date().getFullYear();
      let calendar = await this.fetchFromJolpica(currentYear);
      
      if (!calendar || calendar.length === 0) {
        console.log(`[F1Provider] Jolpica returned no data for ${currentYear}. Falling back to OpenF1.`);
        calendar = await this.fetchFromOpenF1(currentYear);
      }
      
      if (!calendar || calendar.length === 0) {
        throw new Error('No F1 calendar data available from any provider.');
      }

      calendar = this.normalizeCalendar(calendar);

      await this.cache.set(cacheKey, calendar, 3600);
      return calendar;
    } catch (error: any) {
      console.error('[F1Provider] Error fetching F1 data', error);
      throw error;
    }
  }

  private async fetchFromOpenF1(year: number): Promise<F1Event[]> {
    try {
      const res = await fetch(`${this.OPENF1_URL}/meetings?year=${year}`);
      const meetings = await res.json();
      
      ProviderLogger.log('OpenF1_Meetings', `${this.OPENF1_URL}/meetings?year=${year}`, res.status, JSON.stringify(meetings).length, 'Mapping Started');

      if (!meetings || !Array.isArray(meetings) || meetings.length === 0) {
        ProviderLogger.log('OpenF1_Meetings', `${this.OPENF1_URL}/meetings?year=${year}`, res.status, 0, 'Mapping Failed', 'No meetings found');
        return [];
      }

      const resSessions = await fetch(`${this.OPENF1_URL}/sessions?year=${year}`);
      const sessionsData = await resSessions.json();
      
      if (!Array.isArray(sessionsData)) {
        return [];
      }

      const events: F1Event[] = [];
      let roundCounter = 1;
      const now = new Date().getTime();

      for (const meeting of meetings) {
        if (meeting.meeting_name === 'Pre-Season Testing') continue;

        const meetingSessions = sessionsData.filter((s: any) => s.meeting_key === meeting.meeting_key);
        
        const mappedSessions: F1Session[] = meetingSessions.map((s: any) => {
          let type: F1Session['type'] = 'Practice';
          const nameLower = s.session_name.toLowerCase();
          
          if (nameLower.includes('race')) type = 'Race';
          else if (nameLower.includes('sprint shootout') || nameLower.includes('sprint qualifying')) type = 'Sprint Qualifying';
          else if (nameLower.includes('sprint')) type = 'Sprint';
          else if (nameLower.includes('qualifying')) type = 'Qualifying';
          
          const session: F1Session = {
            id: s.session_key.toString(),
            name: s.session_name,
            type,
            startDate: s.date_start,
            endDate: s.date_end,
            status: 'UPCOMING'
          };
          return this.updateSessionStatus(session, now);
        });
        
        mappedSessions.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        
        events.push({
          id: meeting.meeting_key.toString(),
          name: meeting.meeting_official_name || meeting.meeting_name,
          circuit: meeting.circuit_short_name || meeting.location,
          country: meeting.country_name || "Unknown",
          sessions: mappedSessions,
          round: roundCounter++
        });
      }
      
      ProviderLogger.log('OpenF1_Meetings', `${this.OPENF1_URL}/meetings?year=${year}`, res.status, JSON.stringify(meetings).length, `Mapping Success: ${events.length} races`);
      return events;
    } catch (e: any) {
      ProviderLogger.log('OpenF1', this.OPENF1_URL, 500, 0, 'Error', e.message);
      return [];
    }
  }

  private async fetchFromJolpica(year: number): Promise<F1Event[]> {
    const url = `${this.JOLPICA_BASE_URL}/${year}.json`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      ProviderLogger.log('Jolpica', url, response.status, JSON.stringify(data).length, 'Mapping Started');

      if (!data || !data.MRData || !data.MRData.RaceTable || !Array.isArray(data.MRData.RaceTable.Races)) {
        ProviderLogger.log('Jolpica', url, response.status, JSON.stringify(data).length, 'Mapping Failed', 'Invalid schema');
        return [];
      }

      const races = data.MRData.RaceTable.Races;
      const calendar: F1Event[] = [];

      for (const race of races) {
        if (!race || !race.Circuit || !race.Circuit.circuitId) {
          console.warn('[Jolpica] Skipping race due to missing Circuit info', race);
          continue;
        }

        calendar.push(this.mapJolpicaRaceToEvent(race));
      }
      
      calendar.sort((a, b) => {
        const dateA = new Date(a.sessions.find(s => s.type === 'Race')?.startDate || 0).getTime();
        const dateB = new Date(b.sessions.find(s => s.type === 'Race')?.startDate || 0).getTime();
        return dateA - dateB;
      });

      ProviderLogger.log('Jolpica', url, response.status, JSON.stringify(data).length, `Mapping Success: ${calendar.length} races`);
      return calendar;
    } catch (error: any) {
      ProviderLogger.log('Jolpica', url, 500, 0, 'Error', error.message);
      return [];
    }
  }

  private normalizeCalendar(calendar: F1Event[]): F1Event[] {
    const sprintEvents = [
      'China', 'Miami', 'Canada', 'Great Britain', 'Netherlands', 'Singapore'
    ];

    const now = new Date().getTime();
    let index = 0;

    for (const event of calendar) {
      // Assign chronological internal ID
      event.id = (++index).toString();
      
      event.status = 'CONFIRMED';
      event.hasSprint = sprintEvents.some(sprintName => event.name.includes(sprintName) || event.country.includes(sprintName));

      // 1. Bahrain - Rescheduled to Malaysia
      if (event.name.includes('Bahrain') || event.country.includes('Bahrain')) {
        event.status = 'RESCHEDULED';
        event.circuit = 'Sepang International Circuit';
        event.country = 'Malaysia';
        
        // Find existing race date to set originalDate
        const raceSession = event.sessions.find(s => s.type === 'Race');
        if (raceSession) {
          event.originalDate = '2026-04-10 / 2026-04-12';
          event.currentDate = '2026-10-02 / 2026-10-04';
          
          // Recreate sessions for new October dates but keep original IDs if possible
          const baseDate = new Date('2026-10-02T12:00:00Z');
          const findId = (type: string, fallback: string) => event.sessions.find(s => s.type === type)?.id || fallback;
          
          event.sessions = [
            { id: findId('Practice', 'fp1'), name: 'Practice 1', type: 'Practice', startDate: new Date(baseDate.getTime()).toISOString(), endDate: new Date(baseDate.getTime() + 3600000).toISOString(), status: 'UPCOMING' },
            { id: findId('Practice', 'fp2'), name: 'Practice 2', type: 'Practice', startDate: new Date(baseDate.getTime() + 14400000).toISOString(), endDate: new Date(baseDate.getTime() + 18000000).toISOString(), status: 'UPCOMING' },
            { id: findId('Practice', 'fp3'), name: 'Practice 3', type: 'Practice', startDate: new Date(baseDate.getTime() + 86400000).toISOString(), endDate: new Date(baseDate.getTime() + 90000000).toISOString(), status: 'UPCOMING' },
            { id: findId('Qualifying', 'q'), name: 'Qualifying', type: 'Qualifying', startDate: new Date(baseDate.getTime() + 100800000).toISOString(), endDate: new Date(baseDate.getTime() + 104400000).toISOString(), status: 'UPCOMING' },
            { id: findId('Race', 'race'), name: 'Race', type: 'Race', startDate: new Date(baseDate.getTime() + 172800000).toISOString(), endDate: new Date(baseDate.getTime() + 180000000).toISOString(), status: 'UPCOMING' }
          ].map(s => this.updateSessionStatus(s, now, event.status));
        }
      }

      // 2. Saudi Arabia - Cancelled
      if (event.name.includes('Saudi Arabia') || event.country.includes('Saudi Arabia')) {
        event.status = 'CANCELLED';
        event.originalDate = '2026-04-17 / 2026-04-19';
      }

      // 3. Qatar - Under Review
      if (event.name.includes('Qatar') || event.country.includes('Qatar')) {
        event.status = 'UNDER_REVIEW';
      }

      // Enforce Sprint vs Normal sessions exactly based on hasSprint
      if (event.status !== 'RESCHEDULED' && event.status !== 'CANCELLED') {
        const raceSession = event.sessions.find(s => s.type === 'Race');
        if (raceSession) {
          const raceDate = new Date(raceSession.startDate);
          const friday = new Date(raceDate.getTime() - (2 * 86400000));
          const saturday = new Date(raceDate.getTime() - 86400000);
          
          const findId = (type: string, fallback: string) => event.sessions.find(s => s.type === type)?.id || fallback;
          
          if (event.hasSprint) {
            event.sessions = [
              { id: findId('Practice', 'fp1'), name: 'Practice 1', type: 'Practice', startDate: new Date(friday.getTime()).toISOString(), endDate: new Date(friday.getTime() + 3600000).toISOString(), status: 'UPCOMING' },
              { id: findId('Sprint Qualifying', 'sq'), name: 'Sprint Qualifying', type: 'Sprint Qualifying', startDate: new Date(friday.getTime() + 14400000).toISOString(), endDate: new Date(friday.getTime() + 18000000).toISOString(), status: 'UPCOMING' },
              { id: findId('Sprint', 'sprint'), name: 'Sprint', type: 'Sprint', startDate: new Date(saturday.getTime()).toISOString(), endDate: new Date(saturday.getTime() + 3600000).toISOString(), status: 'UPCOMING' },
              { id: findId('Qualifying', 'q'), name: 'Qualifying', type: 'Qualifying', startDate: new Date(saturday.getTime() + 14400000).toISOString(), endDate: new Date(saturday.getTime() + 18000000).toISOString(), status: 'UPCOMING' },
              { id: findId('Race', 'race'), name: 'Race', type: 'Race', startDate: raceDate.toISOString(), endDate: new Date(raceDate.getTime() + 7200000).toISOString(), status: 'UPCOMING' }
            ].map(s => this.updateSessionStatus(s, now, event.status));
          } else {
             event.sessions = [
              { id: findId('Practice', 'fp1'), name: 'Practice 1', type: 'Practice', startDate: new Date(friday.getTime()).toISOString(), endDate: new Date(friday.getTime() + 3600000).toISOString(), status: 'UPCOMING' },
              { id: findId('Practice', 'fp2'), name: 'Practice 2', type: 'Practice', startDate: new Date(friday.getTime() + 14400000).toISOString(), endDate: new Date(friday.getTime() + 18000000).toISOString(), status: 'UPCOMING' },
              { id: findId('Practice', 'fp3'), name: 'Practice 3', type: 'Practice', startDate: new Date(saturday.getTime()).toISOString(), endDate: new Date(saturday.getTime() + 3600000).toISOString(), status: 'UPCOMING' },
              { id: findId('Qualifying', 'q'), name: 'Qualifying', type: 'Qualifying', startDate: new Date(saturday.getTime() + 14400000).toISOString(), endDate: new Date(saturday.getTime() + 18000000).toISOString(), status: 'UPCOMING' },
              { id: findId('Race', 'race'), name: 'Race', type: 'Race', startDate: raceDate.toISOString(), endDate: new Date(raceDate.getTime() + 7200000).toISOString(), status: 'UPCOMING' }
            ].map(s => this.updateSessionStatus(s, now, event.status));
          }
        }
      }
    }

    return calendar;
  }

  async getUpcomingEvent(): Promise<F1Event | null> {
    const calendar = await this.getCalendar();
    if (!calendar || calendar.length === 0) return null;

    const now = new Date().getTime();
    
    // Refresh statuses just in case cache is slightly stale
    for (const event of calendar) {
      event.sessions = event.sessions.map(s => this.updateSessionStatus(s, now, event.status));
    }

    // Find the next race where the main race hasn't finished yet and is not cancelled
    for (const event of calendar) {
      if (event.status === 'CANCELLED') continue;
      
      const mainRace = event.sessions.find(s => s.type === 'Race');
      if (mainRace && mainRace.status !== 'FINISHED') {
        return event;
      }
    }
    
    // If all events in the calendar are FINISHED, return the last one
    return calendar[calendar.length - 1] || null; 
  }
  
  async getEventById(eventId: string): Promise<F1Event | null> {
    const calendar = await this.getCalendar();
    const event = calendar.find(e => e.id === eventId) || null;
    
    if (event) {
      const now = new Date().getTime();
      event.sessions = event.sessions.map(s => this.updateSessionStatus(s, now, event.status));
    }
    
    return event;
  }

  async getRaceResults(season: number, eventId: string): Promise<{ event: F1Event, race: any, sprint: any, qualifying: any }> {
    const event = await this.getEventById(eventId);
    if (!event) throw new Error(`Event not found for internal ID ${eventId}`);

    const officialRound = event.round;
    
    console.log(`[F1Provider] Requested event ID: ${eventId}`);
    console.log(`[F1Provider] Resolved official round: ${officialRound}`);
    console.log(`[F1Provider] Season: ${season}`);

    const raceResult: any = { status: 'UPCOMING', winner: null, classification: [] };
    const sprintResult: any = { status: 'UPCOMING', winner: null, classification: [] };
    const qualifyingResult: any = { status: 'UPCOMING', winner: null, classification: [] };

    const fetchJolpicaResult = async (endpoint: string) => {
      const url = `${this.JOLPICA_BASE_URL}/${season}/${officialRound}/${endpoint}.json`;
      console.log(`[F1Provider] Fetching results: ${url}`);
      
      try {
        const jRes = await fetch(url);
        if (!jRes.ok) {
           console.error(`[F1Provider] Jolpica HTTP ${jRes.status} for ${url}`);
           throw new Error(`HTTP ${jRes.status}`);
        }
        
        const jData = await jRes.json();
        
        let resultsList = [];
        if (endpoint === 'sprint') {
          resultsList = jData?.MRData?.RaceTable?.Races?.[0]?.SprintResults || [];
        } else if (endpoint === 'qualifying') {
          resultsList = jData?.MRData?.RaceTable?.Races?.[0]?.QualifyingResults || [];
        } else {
          resultsList = jData?.MRData?.RaceTable?.Races?.[0]?.Results || [];
        }

        console.log(`[F1Provider] Result count: ${resultsList.length}`);

        if (resultsList.length > 0) {
           const classification: ResultClassification[] = resultsList.map((r: any) => {
             return {
               position: parseInt(r.position, 10),
               driverNumber: parseInt(r.number, 10),
               driverName: `${r.Driver.givenName} ${r.Driver.familyName}`,
               teamName: r.Constructor.name,
               laps: r.laps ? parseInt(r.laps, 10) : 0,
               gapToLeader: r.Time?.time || (endpoint === 'qualifying' ? (r.Q3 || r.Q2 || r.Q1 || '--') : r.status) || '--',
               points: r.points ? parseFloat(r.points) : 0,
               status: r.status === 'Finished' ? 'FINISHED' : (r.status || 'FINISHED')
             };
           });
           
           const winner = classification.find(c => c.position === 1) || classification[0] || null;
           if (winner) {
              console.log(`[F1Provider] Winner: ${winner.driverName}`);
           }
           return { winner, classification };
        }
        
        return null;
      } catch (e: any) {
        console.error(`[F1Provider] Failed to fetch/parse Jolpica results:`, e.message);
        throw e;
      }
    };
      
    const raceSession = event.sessions.find(s => s.type === 'Race');
    if (raceSession) {
      raceResult.status = raceSession.status;
      if (raceSession.status === 'FINISHED') {
         try {
            const res = await fetchJolpicaResult('results');
            if (res) {
               raceResult.winner = res.winner;
               raceResult.classification = res.classification;
               console.log(`[F1Provider] Race results available: true`);
            } else {
               console.log(`[F1Provider] Race results available: false`);
               throw new Error("No data returned");
            }
         } catch (e: any) {
            raceResult.status = 'ERROR';
         }
      }
    }

    if (event.hasSprint) {
      const sprintSession = event.sessions.find(s => s.type === 'Sprint');
      if (sprintSession) {
        sprintResult.status = sprintSession.status;
        if (sprintSession.status === 'FINISHED') {
           try {
              const res = await fetchJolpicaResult('sprint');
              if (res) {
                 sprintResult.winner = res.winner;
                 sprintResult.classification = res.classification;
              } else {
                 throw new Error("No data returned");
              }
           } catch (e: any) {
              sprintResult.status = 'ERROR';
           }
        }
      }
    }
    
    const qualiSession = event.sessions.find(s => s.type === 'Qualifying');
    if (qualiSession) {
      qualifyingResult.status = qualiSession.status;
      if (qualiSession.status === 'FINISHED') {
         try {
            const res = await fetchJolpicaResult('qualifying');
            if (res) {
               qualifyingResult.winner = res.winner;
               qualifyingResult.classification = res.classification;
            }
         } catch (e: any) {
            qualifyingResult.status = 'ERROR';
         }
      }
    }

    return { event, race: raceResult, sprint: event.hasSprint ? sprintResult : null, qualifying: qualifyingResult };
  }

  async getStandings(year?: number): Promise<{ drivers: ChampionshipStanding[], teams: ChampionshipStanding[] }> {
    const targetYear = year || new Date().getFullYear();
    const cacheKey = `f1:standings:${targetYear}`;
    
    try {
      const cached = await this.cache.get<any>(cacheKey);
      if (cached) return cached;

      const [driversRes, teamsRes] = await Promise.all([
        fetch(`${this.OPENF1_URL}/championship_drivers?year=${targetYear}`),
        fetch(`${this.OPENF1_URL}/championship_teams?year=${targetYear}`)
      ]);
      
      const driversData = await driversRes.json();
      const teamsData = await teamsRes.json();

      // OpenF1 might not have 2026 standings yet. Fallback to Jolpica if empty.
      if (!Array.isArray(driversData) || driversData.length === 0) {
        return this.getJolpicaStandings(targetYear);
      }

      // Group by driver (OpenF1 returns history, we just need the latest per driver)
      const driversMap = new Map<number, any>();
      for (const d of driversData) {
         const existing = driversMap.get(d.driver_number);
         if (!existing || d.points_current > existing.points_current) {
            driversMap.set(d.driver_number, d);
         }
      }
      
      const drivers: ChampionshipStanding[] = Array.from(driversMap.values())
        .sort((a, b) => b.points_current - a.points_current)
        .map((d: any, index: number) => ({
           position: index + 1,
           driverName: d.driver_name || d.driver_acronym, // or fetch from drivers
           teamName: d.team_name || 'Unknown',
           points: d.points_current
        }));
        
      const teamsMap = new Map<string, any>();
      for (const t of teamsData) {
         const existing = teamsMap.get(t.team_name);
         if (!existing || t.points_current > existing.points_current) {
            teamsMap.set(t.team_name, t);
         }
      }
      
      const teams: ChampionshipStanding[] = Array.from(teamsMap.values())
        .sort((a, b) => b.points_current - a.points_current)
        .map((t: any, index: number) => ({
           position: index + 1,
           driverName: '', // N/A for teams
           teamName: t.team_name,
           points: t.points_current
        }));

      const result = { drivers, teams };
      await this.cache.set(cacheKey, result, 1800); // cache 30 mins
      return result;
    } catch (e) {
      console.error('[F1Provider] Error fetching standings', e);
      return { drivers: [], teams: [] };
    }
  }

  private async getJolpicaStandings(year: number): Promise<{ drivers: ChampionshipStanding[], teams: ChampionshipStanding[] }> {
      try {
        const [driversRes, teamsRes] = await Promise.all([
          fetch(`${this.JOLPICA_BASE_URL}/${year}/driverStandings.json`),
          fetch(`${this.JOLPICA_BASE_URL}/${year}/constructorStandings.json`)
        ]);
        
        const driversData = await driversRes.json();
        const teamsData = await teamsRes.json();
        
        let drivers: ChampionshipStanding[] = [];
        if (driversData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings) {
           drivers = driversData.MRData.StandingsTable.StandingsLists[0].DriverStandings.map((d: any) => ({
              position: parseInt(d.position, 10),
              driverName: `${d.Driver.givenName} ${d.Driver.familyName}`,
              teamName: d.Constructors?.[0]?.name || 'Unknown',
              points: parseFloat(d.points)
           }));
        }
        
        let teams: ChampionshipStanding[] = [];
        if (teamsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings) {
           teams = teamsData.MRData.StandingsTable.StandingsLists[0].ConstructorStandings.map((t: any) => ({
              position: parseInt(t.position, 10),
              driverName: '',
              teamName: t.Constructor.name,
              points: parseFloat(t.points)
           }));
        }
        
        return { drivers, teams };
      } catch (e) {
        return { drivers: [], teams: [] };
      }
  }

  private mapJolpicaRaceToEvent(race: any): F1Event {
    const sessions: F1Session[] = [];
    const now = new Date().getTime();

    const addSession = (id: string, name: string, type: F1Session['type'], sessionData: any, durationHours: number) => {
      if (sessionData && sessionData.date && sessionData.time) {
        const start = new Date(`${sessionData.date}T${sessionData.time}`);
        
        if (Number.isNaN(start.getTime())) {
          throw new Error(`Invalid event schedule date parsed for session ${name}`);
        }
        
        const end = new Date(start.getTime() + (durationHours * 3600000));
        
        const session: F1Session = {
          id, name, type,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          status: 'UPCOMING'
        };
        sessions.push(this.updateSessionStatus(session, now));
      }
    };

    addSession('fp1', 'Practice 1', 'Practice', race.FirstPractice, 1);
    
    if (race.Sprint) {
      addSession('sq', 'Sprint Qualifying', 'Sprint Qualifying', race.SprintQualifying || race.SecondPractice, 1);
      addSession('sprint', 'Sprint', 'Sprint', race.Sprint, 1);
    } else {
      addSession('fp2', 'Practice 2', 'Practice', race.SecondPractice, 1);
      addSession('fp3', 'Practice 3', 'Practice', race.ThirdPractice, 1);
    }
    
    addSession('q', 'Qualifying', 'Qualifying', race.Qualifying, 1);
    
    if (race.date && race.time) {
      const raceStart = new Date(`${race.date}T${race.time}`);
      if (Number.isNaN(raceStart.getTime())) {
        throw new Error("Invalid event schedule date parsed for Main Race");
      }
      
      const raceEnd = new Date(raceStart.getTime() + 7200000); 
      const session: F1Session = {
        id: 'race', name: 'Race', type: 'Race',
        startDate: raceStart.toISOString(),
        endDate: raceEnd.toISOString(),
        status: 'UPCOMING'
      };
      sessions.push(this.updateSessionStatus(session, now));
    }

    sessions.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return {
      id: race.Circuit.circuitId,
      name: race.raceName || 'Unknown Race',
      circuit: race.Circuit.circuitName || 'Unknown Circuit',
      country: race.Circuit.Location?.country || 'Unknown',
      sessions,
      round: parseInt(race.round || '0', 10)
    };
  }

  private updateSessionStatus(session: F1Session, now: number, eventStatus?: string): F1Session {
    if (eventStatus === 'CANCELLED' || eventStatus === 'POSTPONED') {
      return { ...session, status: eventStatus as any };
    }
    
    const startTime = new Date(session.startDate).getTime();
    const endTime = new Date(session.endDate).getTime();
    
    let status: F1Session['status'] = 'UPCOMING';
    if (now > endTime) {
      status = 'FINISHED';
    } else if (now >= startTime && now <= endTime) {
      status = 'LIVE';
    }
    
    return { ...session, status };
  }
}
