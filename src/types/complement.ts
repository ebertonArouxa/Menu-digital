export interface ComplementPayload {
  name: string;
  maxAmount: number;
  required: boolean;
}

export interface ComplementResponse {
  complementId: string;
}

export interface GetComplementReturn {
  complements: Complement[];
}

export interface GetComplementByIdReturn {
  complements: Complement;
}

export interface ComplementItemProp {
  id: string;
  name: string;
  price: string;
  complementId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Complement {
  id: string;
  name: string;
  required: boolean;
  maxAmount: number;
  createdAt: string;
  updatedAt: string;
  items: ComplementItemProp[];
}
