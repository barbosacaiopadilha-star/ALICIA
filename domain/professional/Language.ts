export type LanguageProficiency = "basic" | "conversational" | "professional" | "native";

const VALID_PROFICIENCIES: LanguageProficiency[] = [
  "basic",
  "conversational",
  "professional",
  "native",
];

const CODE_PATTERN = /^[a-zA-Z]{2,3}$/;

export interface LanguageProps {
  code: string;
  name: string;
  proficiency?: LanguageProficiency;
}

export class Language {
  readonly code: string;
  readonly name: string;
  readonly proficiency?: LanguageProficiency;

  private constructor(props: { code: string; name: string; proficiency?: LanguageProficiency }) {
    this.code = props.code;
    this.name = props.name;
    this.proficiency = props.proficiency;
  }

  static create(props: LanguageProps): Language {
    const code = props.code?.trim();
    const name = props.name?.trim();

    if (!code) {
      throw new Error("Language: code é obrigatório.");
    }
    if (!name) {
      throw new Error("Language: name é obrigatório.");
    }
    if (!CODE_PATTERN.test(code)) {
      throw new Error("Language: code deve conter apenas letras, com 2 ou 3 caracteres.");
    }
    if (props.proficiency !== undefined && !VALID_PROFICIENCIES.includes(props.proficiency)) {
      throw new Error(`Language: proficiency inválido "${props.proficiency}".`);
    }

    return new Language({
      code: code.toLowerCase(),
      name,
      proficiency: props.proficiency,
    });
  }
}
