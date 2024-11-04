export interface Visitor {
  name: string;
  phone: string;
}

export interface Registration {
  memberName: string;
  assistanceGroup: string;
  visitors: Visitor[];
  timestamp: Date;
}