export interface UserData {
  id: number;
  name: string;
  email: string;
}

export interface UserRO {
  user: UserData;
}

export interface UserRegisterRO {
  user: UserData;
  token: string;
}
