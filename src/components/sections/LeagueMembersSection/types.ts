


export type LeageMemberArmy = {
  id: number;
  name: string;
  is_primary: boolean;
}

export type LeageMember = {
  id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  profile_picture_url: string | null;
  armies: Array<LeageMemberArmy>;
}