export type NotificationSettingsRow = {
  id: string;
  order_confirmation_email: boolean;
  reservation_email: boolean;
  catering_email: boolean;
  catering_admin_notify: boolean;
  from_name: string | null;
  from_email: string | null;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_secure: boolean;
  smtp_user: string | null;
  smtp_password_set: boolean;
  is_smtp_configured: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type NotificationSettingsPayload = {
  id?: string;
  order_confirmation_email?: boolean;
  reservation_email?: boolean;
  catering_email?: boolean;
  catering_admin_notify?: boolean;
  from_name?: string | null;
  from_email?: string | null;
  smtp_host?: string | null;
  smtp_port?: number | null;
  smtp_secure?: boolean;
  smtp_user?: string | null;
  smtp_password?: string | null;
};
