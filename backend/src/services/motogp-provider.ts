import { CacheService } from './cache-service.js';
import { ProviderLogger } from './provider-logger.js';

export interface MotoGPSession {
  id: string;
  name: string;
  type: 'Practice' | 'Qualifying' | 'Sprint' | 'Race';
  startDate: string;
  endDate: string;
  status: 'UPCOMING' | 'LIVE' | 'FINISHED';
}

export interface MotoGPEvent {
  id: string;
  name: string;
  circuit: string;
  country: string;
  sessions: MotoGPSession[];
  round: number;
}

const MotoGPTimezones: Record<string, string> = {
  TH: 'Asia/Bangkok',
  BR: 'America/Sao_Paulo',
  US: 'America/Chicago',
  ES: 'Europe/Madrid',
  FR: 'Europe/Paris',
  IT: 'Europe/Rome',
  HU: 'Europe/Budapest',
  CZ: 'Europe/Prague',
  NL: 'Europe/Amsterdam',
  DE: 'Europe/Berlin',
  GB: 'Europe/London',
  SM: 'Europe/Rome',
  AT: 'Europe/Vienna',
  JP: 'Asia/Tokyo',
  ID: 'Asia/Makassar',
  AU: 'Australia/Melbourne',
  MY: 'Asia/Kuala_Lumpur',
  QA: 'Asia/Qatar',
  PT: 'Europe/Lisbon',
  IN: 'Asia/Kolkata',
  AR: 'America/Argentina/Buenos_Aires',
  KZ: 'Asia/Almaty'
};

function resolveMotoGPUTC(localTimeStr: string, countryIso: string): string {
  const tz = MotoGPTimezones[countryIso] || 'UTC';
  
  const d = new Date(localTimeStr);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    timeZoneName: 'longOffset'
  });
  
  const parts = formatter.formatToParts(d);
  const offsetPart = parts.find(p => p.type === 'timeZoneName')?.value;
  
  let offsetMinutes = 0;
  if (offsetPart && offsetPart !== 'GMT') {
     const match = offsetPart.match(/GMT([+-])(\d{2}):(\d{2})/);
     if (match) {
        const sign = match[1] === '-' ? -1 : 1;
        const hrs = parseInt(match[2], 10);
        const mins = parseInt(match[3], 10);
        offsetMinutes = sign * ((hrs * 60) + mins);
     }
  }
  
  const trueUtcTime = d.getTime() - (offsetMinutes * 60000);
  return new Date(trueUtcTime).toISOString();
}

export class MotoGPProvider {
  private cache = new CacheService();
  private readonly API_BASE = 'https://api.motogp.pulselive.com/motogp/v1/results';

  private async fetchJson(endpoint: string): Promise<any> {
    const url = `${this.API_BASE}${endpoint}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
      return await res.json();
    } catch (e: any) {
      ProviderLogger.log('MotoGP_PulseLive', url, 500, 0, 'Error', e.message);
      throw e;
    }
  }

  private async getSeasonAndCategory(year: number): Promise<{ seasonUuid: string, categoryUuid: string } | null> {
    const cacheKey = `motogp:metadata:${year}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;

    try {
      const seasons = await this.fetchJson('/seasons');
      const season = seasons.find((s: any) => s.year === year);
      if (!season) return null;

      const categories = await this.fetchJson(`/categories?seasonUuid=${season.id}`);
      const category = categories.find((c: any) => c.name === 'MotoGP™' || c.name === 'MotoGP');
      if (!category) return null;

      const metadata = { seasonUuid: season.id, categoryUuid: category.id };
      await this.cache.set(cacheKey, metadata, 86400); // 1 day
      return metadata;
    } catch (e) {
      console.error('[MotoGPProvider] Error fetching season/category metadata:', e);
      return null;
    }
  }

  private mapSessionType(type: string, name: string): MotoGPSession['type'] {
    const upperType = type.toUpperCase();
    const upperName = name.toUpperCase();
    if (upperType === 'RAC' || upperType === 'RACE' || upperName.includes('RACE') || upperName === 'RAC') return 'Race';
    if (upperType === 'SPR' || upperName.includes('SPRINT')) return 'Sprint';
    if (upperType === 'Q' || upperType.startsWith('Q') || upperName.includes('QUALIFYING')) return 'Qualifying';
    return 'Practice';
  }

  private updateSessionStatus(startDate: string, type: string, now: number): MotoGPSession['status'] {
    const start = new Date(startDate).getTime();
    // Approximate durations
    let durationMinutes = 45; 
    if (type === 'Race') durationMinutes = 50;
    if (type === 'Sprint') durationMinutes = 25;
    if (type === 'Qualifying') durationMinutes = 15;
    
    const end = start + (durationMinutes * 60000);
    
    if (now > end) return 'FINISHED';
    if (now >= start && now <= end) return 'LIVE';
    return 'UPCOMING';
  }

  async getUpcomingEvent(): Promise<MotoGPEvent | null> {
    const calendar = await this.getCalendar();
    if (!calendar || calendar.length === 0) return null;

    const now = new Date().getTime();
    
    for (const event of calendar) {
      const mainRace = event.sessions.find(s => s.type === 'Race');
      if (mainRace) {
        // Look ahead for upcoming races, or currently live/recently finished
        const raceEndTime = new Date(mainRace.startDate).getTime() + 7200000; // ~2 hours padding
        if (raceEndTime > now) {
          event.sessions = event.sessions.map(session => ({
            ...session,
            status: this.updateSessionStatus(session.startDate, session.type, now)
          }));
          return event;
        }
      }
    }
    
    return null; 
  }

  async getCalendar(): Promise<MotoGPEvent[]> {
    const year = new Date().getFullYear(); // Currently 2026
    const cacheKey = `motogp:calendar:v2:${year}`;
    
    try {
      const cached = await this.cache.get<MotoGPEvent[]>(cacheKey);
      if (cached) return cached;

      const metadata = await this.getSeasonAndCategory(year);
      if (!metadata) throw new Error("Could not fetch season metadata");

      console.log(`[MotoGPProvider] Fetching MotoGP events for season ${metadata.seasonUuid}`);
      const eventsData = await this.fetchJson(`/events?seasonUuid=${metadata.seasonUuid}`);
      
      const races: MotoGPEvent[] = [];
      let roundCounter = 1;

      for (const event of eventsData) {
        // Verify it's a MotoGP event by checking if legacy_id categoryId === 1
        const isMotoGP = event.legacy_id?.some((l: any) => l.categoryId === 1);
        if (!isMotoGP && !event.name.toUpperCase().includes('GRAND PRIX')) continue;

        try {
          // Fetch sessions for this event
          const sessionsData = await this.fetchJson(`/sessions?eventUuid=${event.id}&categoryUuid=${metadata.categoryUuid}`);
          
          const sessions: MotoGPSession[] = sessionsData.map((s: any) => {
             const type = this.mapSessionType(s.type || '', s.name || '');
             const resolvedStartDate = resolveMotoGPUTC(s.date, event.country?.iso || '');
             return {
                id: s.id,
                name: s.name || (type === 'Race' ? 'Main Race' : type),
                type,
                startDate: resolvedStartDate,
                endDate: new Date(new Date(resolvedStartDate).getTime() + 3600000).toISOString(), // rough 1hr end
                status: 'UPCOMING'
             };
          });

          // Sort sessions chronologically
          sessions.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
          
          const now = new Date().getTime();
          races.push({
             id: event.id,
             name: event.name || event.sponsored_name,
             circuit: event.circuit?.name || '',
             country: event.country?.name || '',
             round: roundCounter++,
             sessions: sessions.map(s => ({
               ...s,
               status: this.updateSessionStatus(s.startDate, s.type, now)
             }))
          });
        } catch (sessionErr) {
          console.error(`[MotoGPProvider] Error fetching sessions for event ${event.id}:`, sessionErr);
        }
      }
      
      if (races.length > 0) {
        await this.cache.set(cacheKey, races, 3600); // 1 hour
      }
      return races;
    } catch (error: any) {
      console.error('[MotoGPProvider] Error fetching MotoGP calendar', error);
      throw new Error(`MotoGP provider error: ${error.message}`);
    }
  }
  
  async getEventBySlug(slug: string): Promise<MotoGPEvent | null> {
    const calendar = await this.getCalendar();
    return calendar.find(e => e.id === slug || e.round.toString() === slug) || null;
  }

  async getEventResults(eventId: string): Promise<{ raceResult: any, sprintResult: any }> {
    const event = await this.getEventBySlug(eventId);
    if (!event) return { raceResult: null, sprintResult: null };

    const raceResult: any = { status: 'UPCOMING', winner: null, classification: [] };
    const sprintResult: any = { available: false, status: 'UPCOMING', winner: null, classification: [] };
    
    const raceSession = event.sessions.find(s => s.type === 'Race');
    if (raceSession) raceResult.status = raceSession.status;
    
    const sprintSession = event.sessions.find(s => s.type === 'Sprint');
    if (sprintSession) {
      sprintResult.available = true;
      sprintResult.status = sprintSession.status;
    }

    const mapClassification = (classData: any[]) => {
       return classData.map((c: any) => {
          let status = c.status === 'INSTND' ? 'FINISHED' : (c.status || 'FINISHED');
          return {
             position: c.position,
             riderNumber: c.rider?.number || 0,
             riderName: c.rider?.full_name || 'Unknown',
             teamName: c.team?.name || 'Unknown',
             points: c.points || 0,
             gapToLeader: c.gap?.first || '--',
             status
          };
       });
    };

    if (raceResult.status === 'FINISHED' || raceResult.status === 'LIVE') {
       try {
           const classData = await this.fetchJson(`/session/${raceSession!.id}/classification`);
           const classifications = classData.classification || classData.classifications || classData;
           if (Array.isArray(classifications)) {
               raceResult.classification = mapClassification(classifications);
               if (raceResult.status === 'FINISHED') {
                   raceResult.winner = raceResult.classification.find((c: any) => c.position === 1) || null;
               }
           }
       } catch (e) {
           console.error(`[MotoGPProvider] Error fetching race classification for session ${raceSession!.id}`, e);
       }
    }

    if (sprintResult.status === 'FINISHED' || sprintResult.status === 'LIVE') {
       try {
           const classData = await this.fetchJson(`/session/${sprintSession!.id}/classification`);
           const classifications = classData.classification || classData.classifications || classData;
           if (Array.isArray(classifications)) {
               sprintResult.classification = mapClassification(classifications);
               if (sprintResult.status === 'FINISHED') {
                   sprintResult.winner = sprintResult.classification.find((c: any) => c.position === 1) || null;
               }
           }
       } catch (e) {
           console.error(`[MotoGPProvider] Error fetching sprint classification for session ${sprintSession!.id}`, e);
       }
    }

    return { raceResult, sprintResult };
  }

  async getStandings(year?: number): Promise<{ drivers: any[], teams: any[] }> {
    const targetYear = year || new Date().getFullYear();
    const cacheKey = `motogp:standings:${targetYear}`;
    
    try {
      const cached = await this.cache.get<any>(cacheKey);
      if (cached) return cached;
      
      const metadata = await this.getSeasonAndCategory(targetYear);
      if (!metadata) throw new Error("Could not fetch season metadata");

      const data = await this.fetchJson(`/standings?seasonUuid=${metadata.seasonUuid}&categoryUuid=${metadata.categoryUuid}`);
      const list = data.classification || data.classifications || data;
      
      const drivers: any[] = [];
      if (Array.isArray(list)) {
          for (const item of list) {
              drivers.push({
                 position: item.position || 0,
                 riderName: item.rider?.full_name || 'Unknown',
                 teamName: item.team?.name || 'Unknown',
                 points: item.points || 0
              });
          }
      }

      const result = { drivers, teams: [] };
      if (drivers.length > 0) {
         await this.cache.set(cacheKey, result, 1800);
      }
      return result;
    } catch (e) {
      console.error('[MotoGPProvider] Error fetching standings', e);
      return { drivers: [], teams: [] };
    }
  }
}
