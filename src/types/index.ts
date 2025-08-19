export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'worker' | 'manager' | 'director' | 'admin';
  hourly_rate?: number;
  is_active?: boolean;
  passport_series?: string;
  passport_number?: string;
  passport_issue_date?: string;
  passport_issued_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'paused';
  assigned_to: string;
  created_by: string;
  estimated_hours?: number;
  start_location?: string;
  end_location?: string;
  target_location?: string;
  started_at?: string;
  completed_at?: string;
  paused_at?: string;
  total_pause_duration?: number;
  created_at: string;
  updated_at: string;
  assignee?: User;
  creator?: User;
  task_materials?: TaskMaterial[];
}

export interface TaskMaterial {
  id: string;
  task_id: string;
  material_id: string;
  quantity_needed: number;
  quantity_used?: number;
  material?: Material;
}

export interface WorkSession {
  id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  start_location?: string;
  end_location?: string;
  total_hours?: number;
  earnings?: number;
  created_at: string;
  user?: User;
}

export interface Material {
  id: string;
  name: string;
  default_unit: string;
  cost_per_unit: number;
  min_stock_quantity: number;
  category_id?: string;
  created_at: string;
  updated_at: string;
  category?: MaterialCategory;
  inventory?: MaterialInventory[];
  supplier_prices?: MaterialSupplierPrice[];
}

export interface MaterialCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MaterialInventory {
  id: string;
  material_id: string;
  warehouse_id?: string;
  task_id?: string;
  quantity: number;
  location_type: 'warehouse' | 'on_site';
  last_updated: string;
  notes?: string;
  warehouse?: Warehouse;
  task?: Task;
}

export interface MaterialSupplierPrice {
  id: string;
  material_id: string;
  supplier_id: string;
  price: number;
  unit: string;
  last_updated: string;
  notes?: string;
  supplier?: Supplier;
}

export interface MaterialUsage {
  id: string;
  task_id: string;
  material_id: string;
  quantity_used: number;
  used_by: string;
  used_at: string;
  task?: Task;
  material?: Material;
  user?: User;
}

export interface RoleChangeLog {
  id: string;
  user_id: string;
  old_role: string;
  new_role: string;
  changed_by: string;
  changed_at: string;
  user?: User;
  admin?: User;
}