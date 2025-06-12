import { ApiProperty } from '@nestjs/swagger';

export class GetDebtDashboardDto {
  @ApiProperty({ example: 120.5, description: 'Total que otros miembros me deben a mí' })
  totalOwedToMe: number;

  @ApiProperty({ example: 75.0, description: 'Total que yo debo a otros miembros' })
  totalIOwe: number;

  @ApiProperty({
    example: 45.5,
    description: 'Balance general (positivo si te deben más de lo que tú debes)',
  })
  balance: number;

  @ApiProperty({
    description: 'Deudas creadas por mí como acreedor',
    example: [
      {
        id: 1,
        description: 'Compra del súper',
        total: 60.0,
        paid: 30.0,
        createdAt: '2025-06-12T19:30:00.000Z',
        affectedMembers: [
          {
            id: 2,
            name: 'Pepe',
            isPaid: false,
            amount: 30.0,
          },
          {
            id: 3,
            name: 'Ana',
            isPaid: true,
            amount: 30.0,
          },
        ],
      },
    ],
  })
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

  @ApiProperty({
    description: 'Deudas en las que yo soy uno de los afectados (debo dinero)',
    example: [
      {
        id: 5,
        description: 'Cena grupal',
        creditor: {
          id: 4,
          name: 'Laura',
        },
        amount: 20.0,
        isPaid: false,
        createdAt: '2025-06-10T18:00:00.000Z',
      },
    ],
  })
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
