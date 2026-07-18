export type ConsultationModeValue = "in-person" | "telemedicine" | "home-visit" | "hospital";

const VALID_CONSULTATION_MODES: ConsultationModeValue[] = [
  "in-person",
  "telemedicine",
  "home-visit",
  "hospital",
];

export interface ConsultationModeProps {
  value: ConsultationModeValue;
}

export class ConsultationMode {
  readonly value: ConsultationModeValue;

  private constructor(value: ConsultationModeValue) {
    this.value = value;
  }

  static create(props: ConsultationModeProps): ConsultationMode {
    if (!VALID_CONSULTATION_MODES.includes(props.value)) {
      throw new Error(`ConsultationMode: value inválido "${props.value}".`);
    }

    return new ConsultationMode(props.value);
  }
}
