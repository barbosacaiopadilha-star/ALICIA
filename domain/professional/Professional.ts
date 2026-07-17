import { Identity } from "./Identity";
import { Registration } from "./Registration";

export interface ProfessionalProps {
  id: string;
  identity: Identity;
  registrations?: Registration[];
}

export class Professional {
  readonly id: string;
  readonly identity: Identity;
  private readonly _registrations: ReadonlyArray<Registration>;

  private constructor(id: string, identity: Identity, registrations: Registration[]) {
    this.id = id;
    this.identity = identity;
    this._registrations = Object.freeze(registrations);
  }

  static create(props: ProfessionalProps): Professional {
    const id = props.id?.trim();
    if (!id) {
      throw new Error("Professional: id é obrigatório.");
    }
    if (!props.identity) {
      throw new Error("Professional: identity é obrigatória.");
    }

    const registrations: Registration[] = [];
    for (const registration of props.registrations ?? []) {
      const isDuplicate = registrations.some((existing) => existing.matches(registration));
      if (isDuplicate) {
        throw new Error(
          `Professional: registro duplicado (council=${registration.council}, number=${registration.number}, state=${registration.state}).`
        );
      }
      registrations.push(registration);
    }

    return new Professional(id, props.identity, registrations);
  }

  get registrations(): ReadonlyArray<Registration> {
    return this._registrations;
  }
}
