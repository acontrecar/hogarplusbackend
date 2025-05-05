export class GetHomeMembersDto {
  id: number;
  name: string;
  invitationCode: string;
  members: {
    userId: number;
    memberId: number;
    name: string;
    email: string;
    avatar: string | undefined;
    isAdmin: boolean;
  }[];
}
