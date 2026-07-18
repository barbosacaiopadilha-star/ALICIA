import type { Condition } from "../Condition";
import type { ConditionType } from "../Condition";

export interface ConditionRepository {
  findById(id: string): Promise<Condition | null>;
  findByNormalizedName(normalizedName: string): Promise<Condition | null>;
  findByType(type: ConditionType): Promise<ReadonlyArray<Condition>>;
  findAll(): Promise<ReadonlyArray<Condition>>;
}
