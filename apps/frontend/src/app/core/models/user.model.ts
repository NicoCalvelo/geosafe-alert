export interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  locationAddress: string | null;
  locationLat: number | null;
  locationLng: number | null;
}
