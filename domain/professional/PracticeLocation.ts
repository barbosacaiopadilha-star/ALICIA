export interface PracticeLocationProps {
  id: string;
  name: string;
  addressLine?: string;
  city: string;
  state: string;
  countryCode?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

function isValidLatitude(value: number): boolean {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

function isValidLongitude(value: number): boolean {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

export class PracticeLocation {
  readonly id: string;
  readonly name: string;
  readonly addressLine?: string;
  readonly city: string;
  readonly state: string;
  readonly countryCode?: string;
  readonly postalCode?: string;
  readonly latitude?: number;
  readonly longitude?: number;

  private constructor(props: {
    id: string;
    name: string;
    addressLine?: string;
    city: string;
    state: string;
    countryCode?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.addressLine = props.addressLine;
    this.city = props.city;
    this.state = props.state;
    this.countryCode = props.countryCode;
    this.postalCode = props.postalCode;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
  }

  static create(props: PracticeLocationProps): PracticeLocation {
    const id = props.id?.trim();
    const name = props.name?.trim();
    const city = props.city?.trim();
    const state = props.state?.trim().toUpperCase();
    const addressLine = props.addressLine?.trim();
    const postalCode = props.postalCode?.trim();
    const countryCode = props.countryCode?.trim().toUpperCase();

    if (!id) {
      throw new Error("PracticeLocation: id é obrigatório.");
    }
    if (!name) {
      throw new Error("PracticeLocation: name é obrigatório.");
    }
    if (!city) {
      throw new Error("PracticeLocation: city é obrigatório.");
    }
    if (!state || state.length !== 2) {
      throw new Error("PracticeLocation: state deve conter exatamente duas letras.");
    }
    if (props.countryCode !== undefined && (!countryCode || countryCode.length !== 2)) {
      throw new Error("PracticeLocation: countryCode deve conter exatamente duas letras.");
    }
    if (props.addressLine !== undefined && !addressLine) {
      throw new Error("PracticeLocation: addressLine, quando informado, não pode ser vazio.");
    }
    if (props.postalCode !== undefined && !postalCode) {
      throw new Error("PracticeLocation: postalCode, quando informado, não pode ser vazio.");
    }
    if (props.latitude !== undefined && !isValidLatitude(props.latitude)) {
      throw new Error("PracticeLocation: latitude deve ser finita e estar entre -90 e 90.");
    }
    if (props.longitude !== undefined && !isValidLongitude(props.longitude)) {
      throw new Error("PracticeLocation: longitude deve ser finita e estar entre -180 e 180.");
    }

    return new PracticeLocation({
      id,
      name,
      addressLine: addressLine || undefined,
      city,
      state,
      countryCode: countryCode || undefined,
      postalCode: postalCode || undefined,
      latitude: props.latitude,
      longitude: props.longitude,
    });
  }
}
