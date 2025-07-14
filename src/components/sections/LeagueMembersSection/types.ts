


export type LeagueMemberArmy = {
  id: number;
  name: string;
  is_primary: boolean;
}

export type LeagueMember = {
  id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  profile_picture_url: string | null;
  armies: Array<LeagueMemberArmy>;
}