const MATCH_HISTORY_KEY = 'match_history';
const TOURNAMENTS_KEY = 'tournaments';

export type Sport = 'basketball' | 'football' | 'volleyball' | 'badminton' | 'table-tennis' | 'boxing' | 'sepak-takraw';

export type Storage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

export type MatchResult = {
  id: string;
  sport: Sport;
  date: string;
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  events: any[];
  [key: string]: any;
};

export type Tournament = {
  id?: string;
  name: string;
  sport: Sport;
  teams: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
  startDate: string;
  matches?: any[];
  [key: string]: any;
};

export async function storeMatchResult(storage: Storage, result: MatchResult): Promise<void> {
  try {
    const existingHistory = await storage.getItem(MATCH_HISTORY_KEY);
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    
    history.push(result);
    await storage.setItem(MATCH_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to store match result', error);
    throw error;
  }
}

export async function getMatchHistory(storage: Storage): Promise<MatchResult[]> {
  try {
    const history = await storage.getItem(MATCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Failed to get match history', error);
    throw error;
  }
}

export async function clearMatchHistory(storage: Storage): Promise<void> {
  try {
    await storage.removeItem(MATCH_HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear match history', error);
    throw error;
  }
}

export async function storeTournament(storage: Storage, tournament: Tournament): Promise<Tournament> {
  try {
    // Generate a unique ID if one doesn't exist
    if (!tournament.id) {
      tournament.id = `tournament_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    // Get existing tournaments
    const existingTournamentsJSON = await storage.getItem(TOURNAMENTS_KEY);
    const tournaments = existingTournamentsJSON ? JSON.parse(existingTournamentsJSON) : [];
    
    // Check if this tournament already exists
    const existingIndex = tournaments.findIndex((t: Tournament) => t.id === tournament.id);
    
    if (existingIndex >= 0) {
      // Update existing tournament
      tournaments[existingIndex] = tournament;
    } else {
      // Add new tournament
      tournaments.push(tournament);
    }
    
    // Save updated tournaments
    await storage.setItem(TOURNAMENTS_KEY, JSON.stringify(tournaments));
    return tournament;
  } catch (error) {
    console.error('Failed to store tournament', error);
    throw error;
  }
}

export async function getTournaments(storage: Storage): Promise<Tournament[]> {
  try {
    const tournaments = await storage.getItem(TOURNAMENTS_KEY);
    return tournaments ? JSON.parse(tournaments) : [];
  } catch (error) {
    console.error('Failed to get tournaments', error);
    throw error;
  }
}

export async function getTournamentById(storage: Storage, id: string): Promise<Tournament | null> {
  try {
    const tournaments = await getTournaments(storage);
    return tournaments.find((t: Tournament) => t.id === id) || null;
  } catch (error) {
    console.error('Failed to get tournament by ID', error);
    throw error;
  }
}

export async function getTournamentHistory(storage: Storage): Promise<Tournament[]> {
  try {
    const tournaments = await storage.getItem(TOURNAMENTS_KEY);
    const allTournaments = tournaments ? JSON.parse(tournaments) : [];
    // Return all tournaments sorted by start date in descending order
    return allTournaments.sort((a: Tournament, b: Tournament) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  } catch (error) {
    console.error('Failed to get tournament history', error);
    throw error;
  }
}