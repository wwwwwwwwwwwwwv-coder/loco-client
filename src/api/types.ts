export interface OrderInfoModel {
  id: number;
  from_asset_id: number;
  from_amount: string;
  to_asset_id: number;
  to_amount: string;
  status: string;
  created_at: string;
  from_asset: {
    id: number;
    name: string;
    name_en: string;
    chain_name: string;
    unique_code: string;
    icon: string | null;
    browser_url: string;
    pre_create: number;
    done_block_number: number;
    last_block_size: number;
    created_at: string;
  };
  to_asset: {
    id: number;
    name: string;
    name_en: string;
    chain_name: string;
    unique_code: string;
    icon: string | null;
    browser_url: string;
    pre_create: number;
    done_block_number: number;
    last_block_size: number;
    created_at: string;
  };
  status_name: string;
  status_color: string;
}