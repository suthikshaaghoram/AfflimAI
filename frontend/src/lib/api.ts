const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export interface ManifestationRequest {
  preferred_name: string;
  birth_date: string;
  birth_time: string;
  birth_place: string;
  nakshatra: string;
  lagna: string;
  strengths: string;
  areas_of_improvement: string;
  greatest_achievement: string;
  recent_achievement: string;
  next_year_goals: string;
  life_goals: string;
  legacy: string;
  manifestation_focus: string;
  generation_mode?: "quick" | "deep";
}

export interface ManifestationResponse {
  status: string;
  message: string;
  data: {
    manifestation_text: string;
    generation_mode: string;
    word_count: number;
  };
}

export interface AudioRequest {
  text: string;
  gender: 'male' | 'female';
  language?: string; // Language code: en, ta, hi
  username?: string;
  voice_style?: "calm" | "balanced" | "uplifting";
}

export interface AudioResponse {
  audio_url: string;
  filename: string;
  status: string;
}

export interface BackgroundTrack {
  id: string;
  display_name: string;
  filename: string;
  is_default: boolean;
  url: string;
}

export async function generateManifestation(data: ManifestationRequest): Promise<ManifestationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/generate-manifestation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to generate manifestation' }));
    throw new Error(error.detail || 'Failed to generate manifestation');
  }

  return response.json();
}

export async function getLastSubmission(): Promise<ManifestationRequest> {
  const response = await fetch(`${API_BASE_URL}/api/v1/last-submission`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('No previous submission found');
    }
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch last submission' }));
    throw new Error(error.detail || 'Failed to fetch last submission');
  }

  return response.json();
}

export interface AudioResponse {
  audio_url: string;
  filename: string;
  status: string;
}

export async function generateAudio(data: AudioRequest): Promise<AudioResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/generate-audio`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to generate audio' }));
    throw new Error(error.detail || 'Failed to generate audio');
  }

  // Extract filename from Content-Disposition header
  const disposition = response.headers.get('content-disposition');
  let filename = '';
  if (disposition && disposition.indexOf('attachment') !== -1) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(disposition);
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, '');
    }
  }

  // If not found in header, fallback might be needed or let it be empty?
  // Backend sets it unless error.

  // Backend returns audio file, create a Blob URL
  const blob = await response.blob();
  const audio_url = URL.createObjectURL(blob);

  return {
    audio_url,
    filename,
    status: 'success'
  };
}

// Background Audio API
export async function getBackgroundTracks(): Promise<BackgroundTrack[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/background-tracks`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch background tracks' }));
    throw new Error(error.detail || 'Failed to fetch background tracks');
  }

  // Prepend API_BASE_URL to the relative URLs returned by backend if needed
  // But the backend returns /api/v1/..., so we just need to join with base
  const tracks: BackgroundTrack[] = await response.json();
  return tracks.map(track => ({
    ...track,
    url: `${API_BASE_URL}${track.url}`
  }));
}

export async function uploadBackgroundTrack(file: File): Promise<BackgroundTrack> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/v1/upload-background-track`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to upload background track' }));
    throw new Error(error.detail || 'Failed to upload background track');
  }

  const track: BackgroundTrack = await response.json();
  return {
    ...track,
    url: `${API_BASE_URL}${track.url}`
  };
}

// Translation API
export interface TranslationRequest {
  text: string;
  target_language: string;
  username?: string;
}

export interface TranslationResponse {
  status: string;
  language: string;
  language_code: string;
  translated_text: string;
}

export interface SupportedLanguage {
  name: string;
  native_name: string;
  instruction: string;
}

export interface SupportedLanguagesResponse {
  status: string;
  languages: Record<string, SupportedLanguage>;
}

export async function getSupportedLanguages(): Promise<SupportedLanguagesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/supported-languages`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch supported languages' }));
    throw new Error(error.detail || 'Failed to fetch supported languages');
  }

  return response.json();
}

export async function translateManifestation(data: TranslationRequest): Promise<TranslationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/translate-manifestation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to translate manifestation' }));
    throw new Error(error.detail || 'Failed to translate manifestation');
  }

  return response.json();
}

export interface FinalizeAudioRequest {
  voice_filename: string;
  background_track_id: string;
  bg_volume: number;
  voice_volume?: number;
  username: string;
}

export async function finalizeAudio(data: FinalizeAudioRequest): Promise<AudioResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/finalize-audio`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to finalize audio' }));
    throw new Error(error.detail || 'Failed to finalize audio');
  }

  // Extract filename
  const disposition = response.headers.get('content-disposition');
  let filename = '';
  if (disposition && disposition.indexOf('attachment') !== -1) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(disposition);
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, '');
    }
  }

  const blob = await response.blob();
  const audio_url = URL.createObjectURL(blob);

  return {
    audio_url,
    filename,
    status: 'success'
  };
}
