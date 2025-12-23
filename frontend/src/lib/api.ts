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
}

export interface ManifestationResponse {
  status: string;
  message: string;
  data: {
    manifestation_text: string;
  };
}

export interface AudioRequest {
  text: string;
  gender: 'male' | 'female';
  username?: string;
}

export interface AudioResponse {
  audio_url: string;
  status: string;
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

  return response.json();
}
