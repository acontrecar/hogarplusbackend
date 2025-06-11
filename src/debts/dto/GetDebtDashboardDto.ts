export class GetDebtDashboardDto {
  totalOwedToMe: number;
  totalIOwe: number;
  balance: number;

  myCreatedDebts: {
    id: number;
    description: string;
    total: number;
    paid: number;
    createdAt: Date;
    affectedMembers: {
      id: number;
      name: string;
      isPaid: boolean;
      amount: number;
    }[];
  }[];

  debtsIAffect: {
    id: number;
    description: string;
    creditor: {
      id: number;
      name: string;
    };
    amount: number;
    isPaid: boolean;
    createdAt: Date;
  }[];
}
