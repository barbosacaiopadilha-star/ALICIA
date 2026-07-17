import { MetodologiaAliCIA } from "@/types/alicia/metodologia";
import { metodologia } from "@/mocks/alicia/metodologia";

export async function getMetodologia(): Promise<MetodologiaAliCIA> {
  return metodologia;
}
