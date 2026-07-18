export type EditorialStatusValue =
  | "draft"
  | "under-review"
  | "published"
  | "rejected"
  | "archived"
  | "outdated";

const VALID_EDITORIAL_STATUS_VALUES: EditorialStatusValue[] = [
  "draft",
  "under-review",
  "published",
  "rejected",
  "archived",
  "outdated",
];

export interface EditorialStatusProps {
  value: EditorialStatusValue;
  changedAt: Date;
  reason?: string;
}

function isValidDate(date: Date): boolean {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

export class EditorialStatus {
  readonly value: EditorialStatusValue;
  readonly reason?: string;
  private readonly _changedAt: Date;

  private constructor(props: { value: EditorialStatusValue; changedAt: Date; reason?: string }) {
    this.value = props.value;
    this.reason = props.reason;
    this._changedAt = props.changedAt;
  }

  get changedAt(): Date {
    return new Date(this._changedAt.getTime());
  }

  static create(props: EditorialStatusProps): EditorialStatus {
    const reason = props.reason?.trim();

    if (!VALID_EDITORIAL_STATUS_VALUES.includes(props.value)) {
      throw new Error(`EditorialStatus: value inválido "${props.value}".`);
    }
    if (!isValidDate(props.changedAt)) {
      throw new Error("EditorialStatus: changedAt precisa ser uma data válida.");
    }
    if (props.changedAt.getTime() > Date.now()) {
      throw new Error("EditorialStatus: changedAt não pode estar no futuro.");
    }
    if (props.reason !== undefined && !reason) {
      throw new Error("EditorialStatus: reason, quando informada, não pode ser vazia.");
    }

    return new EditorialStatus({
      value: props.value,
      changedAt: new Date(props.changedAt.getTime()),
      reason: reason || undefined,
    });
  }
}
