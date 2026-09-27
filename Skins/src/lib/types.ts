export type ActionResult<T = undefined> = {
  ok: boolean;
  message: string;
  data?: T;
};

export type OpenCaseResult = {
  ok: boolean;
  message: string;
  drop?: {
    skinId: number;
    title: string;
    rarity: string;
    exterior: string;
    price: number;
    image: string | null;
    chance: number;
  };
};
