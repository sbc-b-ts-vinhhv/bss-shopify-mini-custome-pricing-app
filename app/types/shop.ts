export interface Shop {
  id: string;
  name: string;
  domain: string;
  email: string | null;
  ownerName: string | null;
  ownerFirstName: string | null;
  currencyCode: string;
}
