export interface Product {
  id: string
  nomenclature: string
  color_ral_code : string | null
  color_name : string | null
  color_hex : string | null
  client?: string | null
  series?: Series[]
}

export interface Series {
  id: string
  title?: string | null
  product_id?: string | null
  amount?: number | null
  shine_heated?: number | null
  conditional_viscosity?: number | null
  d_E?: number | null
  d_L?: number | null
  d_a?: number | null
  color_difference?: number | null
  d_b?: number | null
  drying_time?: number | null
  peak_temperature?: number | null
  thickness_for_soil?: number | null
  adhesion?: number | null
  solvent_resistance?: number | null
  visual_inspection?: string | null
  appearance?: string | null
  samples_amount?: number | null
  grinding_degree?: number | null
  solids_by_volume?: number | null
  priming?: string | null
  liquid_film_thickness?: number | null
  thickness_for_enamel?: number | null
  theoretical_consumption?: number | null
  bending_strength?: number | null
  resistance_to_kickback?: number | null
  pencil_hardness?: string | null
  eriksen_tensile_strength?: number | null
  shine?: number | null
  density?: number | null
  non_volatile?: number | null
}

export interface ProductFilters {
  nomenmclature?: string
  shine_heated?: {
    min?: number
    max?: number
  }
  per_page?: number
}

export interface SeriesFilters {
  title?: string
  amount?: {
    min?: number
    max?: number
  }
  shine_heated?: {
    min?: number
    max?: number
  }
  conditional_viscosity?: {
    min?: number
    max?: number
  }
  d_E?: {
    min?: number
    max?: number
  }
  d_L?: {
    min?: number
    max?: number
  }
  d_a?: {
    min?: number
    max?: number
  }
  color_difference?: {
    min?: number
    max?: number
  }
  d_b?: {
    min?: number
    max?: number
  }
  drying_time?: {
    min?: number
    max?: number
  }
  peak_temperature?: {
    min?: number
    max?: number
  }
  thickness_for_soil?: {
    min?: number
    max?: number
  }
  adhesion?: {
    min?: number
    max?: number
  }
  solvent_resistance?: {
    min?: number
    max?: number
  }
  samples_amount?: {
    min?: number
    max?: number
  }
  grinding_degree?: {
    min?: number
    max?: number
  }
  solids_by_volume?: {
    min?: number
    max?: number
  }
  liquid_film_thickness?: {
    min?: number
    max?: number
  }
  thickness_for_enamel?: {
    min?: number
    max?: number
  }
  theoretical_consumption?: {
    min?: number
    max?: number
  }
  bending_strength?: {
    min?: number
    max?: number
  }
  resistance_to_kickback?: {
    min?: number
    max?: number
  }
  eriksen_tensile_strength?: {
    min?: number
    max?: number
  }
  shine?: {
    min?: number
    max?: number
  }
  density?: {
    min?: number
    max?: number
  }
  non_volatile?: {
    min?: number
    max?: number
  }
  per_page?: number
}

export interface CreateProductData {
  nomenclature: string
}

export interface UpdateProductData {
  nomenclature: string
  client?: string | null
}

export interface CreateSeriesData {
  product_id?: string | null
  amount?: number | null
  title?: string | null
  shine_heated?: number | null
  conditional_viscosity?: number | null
  d_E?: number | null
  d_L?: number | null
  d_a?: number | null
  color_difference?: number | null
  d_b?: number | null
  drying_time?: number | null
  peak_temperature?: number | null
  thickness_for_soil?: number | null
  adhesion?: number | null
  solvent_resistance?: number | null
  visual_inspection?: string | null
  appearance?: string | null
  samples_amount?: number | null
  grinding_degree?: number | null
  solids_by_volume?: number | null
  priming?: string | null
  liquid_film_thickness?: number | null
  thickness_for_enamel?: number | null
  theoretical_consumption?: number | null
  bending_strength?: number | null
  resistance_to_kickback?: number | null
  pencil_hardness?: string | null
  eriksen_tensile_strength?: number | null
  shine?: number | null
  density?: number | null
  non_volatile?: number | null
}

export interface UpdateSeriesData {
  product_id?: string | null
  amount?: number | null
  title?: string | null
  shine_heated?: number | null
  conditional_viscosity?: number | null
  d_E?: number | null
  d_L?: number | null
  d_a?: number | null
  color_difference?: number | null
  d_b?: number | null
  drying_time?: number | null
  peak_temperature?: number | null
  thickness_for_soil?: number | null
  adhesion?: number | null
  solvent_resistance?: number | null
  visual_inspection?: string | null
  appearance?: string | null
  samples_amount?: number | null
  grinding_degree?: number | null
  solids_by_volume?: number | null
  priming?: string | null
  liquid_film_thickness?: number | null
  thickness_for_enamel?: number | null
  theoretical_consumption?: number | null
  bending_strength?: number | null
  resistance_to_kickback?: number | null
  pencil_hardness?: string | null
  eriksen_tensile_strength?: number | null
  shine?: number | null
  density?: number | null
  non_volatile?: number | null
}

export interface ProductsState {
  products: Product[]
  filters: ProductFilters
  pagination: {
    page: number
    perPage: number
    total: number
  }
  loading: boolean
}
