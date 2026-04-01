export type Temperature = "ice" | "hot";

export type MilkOption = "regular" | "soy" | "oat";

export type MenuItem = {
  id: string;
  name: string;
  priceWon: number;
  temperature: Temperature;
  milkOption: MilkOption;
};

export type OrderSession = {
  id: string;
  title: string;
  menu: MenuItem[];
  createdAt: string;
};

export type ParticipantPick = {
  participantId: string;
  menuItemId: string;
  pickedAt: string;
};

export type OrderRow = {
  id: string;
  name: string;
  menu: string;
  created_at: string;
  session_id: string;
};
