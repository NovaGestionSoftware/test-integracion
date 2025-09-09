export type QrImagePayload = {
  type: "image" | "image-url";
  src: string;
  alt: string;
  qrCodeText?: string;
};

export type QrTextPayload = {
  type: "text";
  text: string;
};

export type QrPayload = QrImagePayload | QrTextPayload | null;

export interface OrderPointConfig {
  terminal_id?: string;
  ticket_number?: string;
  print_on_terminal?: string | boolean;
}

export interface Order {
  id?: string;
  type?: string;
  currency?: string;
  status?: string;
  created_date?: string;
  last_updated_date?: string;
  config?: {
    point?: OrderPointConfig;
  };
}
