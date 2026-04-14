export interface AlertType {
  code: string;
  label: string;
  icon: string | null;
  color: string | null;
}

export const ALERT_TYPES: AlertType[] = [
  { code: 'fire', label: 'Wildfire', icon: 'fire', color: '#ff4500' },
  { code: 'flood', label: 'Flood', icon: 'water', color: '#1e90ff' },
  { code: 'earthquake', label: 'Earthquake', icon: 'activity', color: '#ffa500' },
  { code: 'storm', label: 'Storm', icon: 'cloud-lightning', color: '#8b00ff' },
];
