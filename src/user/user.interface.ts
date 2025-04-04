export interface UserData {
  id: number;
  name: string;
  email: string;
}

export interface UserRO {
  user: UserData;
}
