export interface Track {
  title: string;
  url: string;
  mime: string; // MIME type of the audio file (e.g., 'audio/mp3', 'audio/wav')
  artist?: string;
  album?: string;
  duration?: number;
  cover?: string;
}
