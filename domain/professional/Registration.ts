export type RegistrationStatus = "active" | "inactive" | "suspended";

const VALID_STATUSES: RegistrationStatus[] = ["active", "inactive", "suspended"];

export interface RegistrationProps {
  council: string;
  number: string;
  state: string;
  status: RegistrationStatus;
  lastVerifiedAt: Date;
}

export class Registration {
  readonly council: string;
  readonly number: string;
  readonly state: string;
  readonly status: RegistrationStatus;
  readonly lastVerifiedAt: Date;

  private constructor(props: RegistrationProps) {
    this.council = props.council;
    this.number = props.number;
    this.state = props.state;
    this.status = props.status;
    this.lastVerifiedAt = props.lastVerifiedAt;
  }

  static create(props: RegistrationProps): Registration {
    const council = props.council?.trim().toUpperCase();
    const number = props.number?.trim();
    const state = props.state?.trim().toUpperCase();

    if (!council) {
      throw new Error("Registration: council é obrigatório.");
    }
    if (!number) {
      throw new Error("Registration: number é obrigatório.");
    }
    if (!state || state.length !== 2) {
      throw new Error("Registration: state deve conter exatamente duas letras.");
    }
    if (!VALID_STATUSES.includes(props.status)) {
      throw new Error(`Registration: status inválido "${props.status}".`);
    }
    if (props.lastVerifiedAt.getTime() > Date.now()) {
      throw new Error("Registration: lastVerifiedAt não pode ser uma data futura.");
    }

    return new Registration({
      council,
      number,
      state,
      status: props.status,
      lastVerifiedAt: props.lastVerifiedAt,
    });
  }

  /** Duas Registration são consideradas o mesmo registro quando council + number + state coincidem. */
  matches(other: Registration): boolean {
    return (
      this.council === other.council &&
      this.number === other.number &&
      this.state === other.state
    );
  }
}
