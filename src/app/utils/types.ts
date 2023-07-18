export type EditCompanyData = {
  id: string;
  company?: {
    name?: string;
    slug?: string;
    status?: `ACTIVE` | `INACTIVE`;
  };
  companyInfo?: {
    cnpj?: string;
    email?: string;
    phoneNumber?: string;
    deliveryPhoneNumber?: string;
  };
  companyAddress?: {
    zipCode?: string;
    address?: string;
  };
};

export type EditComplementsData = {
  id: string;
  name?: string;
  maxAmount?: number;
};

export type EditItemData = {
  id: string;
  name?: string;
  price?: number;
};

export type EditCategoryData = {
  id: string;
  name: string;
};
