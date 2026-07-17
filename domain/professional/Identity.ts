export interface IdentityProps {
  fullName: string;
  professionalName?: string;
  photoUrl?: string;
  languages?: string[];
}

export class Identity {
  readonly fullName: string;
  readonly professionalName?: string;
  readonly photoUrl?: string;
  readonly languages: ReadonlyArray<string>;

  private constructor(props: {
    fullName: string;
    professionalName?: string;
    photoUrl?: string;
    languages: string[];
  }) {
    this.fullName = props.fullName;
    this.professionalName = props.professionalName;
    this.photoUrl = props.photoUrl;
    this.languages = Object.freeze(props.languages);
  }

  static create(props: IdentityProps): Identity {
    const fullName = props.fullName?.trim();
    if (!fullName) {
      throw new Error("Identity: fullName é obrigatório e não pode ser vazio.");
    }

    const professionalName = props.professionalName?.trim() || undefined;
    const photoUrl = props.photoUrl?.trim() || undefined;

    const languages = Array.from(
      new Set(
        (props.languages ?? [])
          .map((language) => language.trim())
          .filter((language) => language.length > 0)
      )
    );

    return new Identity({ fullName, professionalName, photoUrl, languages });
  }
}
