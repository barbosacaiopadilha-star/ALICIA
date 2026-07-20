import { CreateProfessionalPublicBiography } from "@/application/alicia/editorial/CreateProfessionalPublicBiography";
import { GetPublishedProfessionalBiography } from "@/application/alicia/editorial/GetPublishedProfessionalBiography";
import { InMemoryProfessionalPublicBiographyRepository } from "./InMemoryProfessionalPublicBiographyRepository";

export interface EditorialApplication {
  readonly createProfessionalPublicBiography: CreateProfessionalPublicBiography;
  readonly getPublishedProfessionalBiography: GetPublishedProfessionalBiography;
}

/**
 * Compõe a aplicação editorial: cria um único
 * InMemoryProfessionalPublicBiographyRepository e o compartilha entre os
 * dois casos de uso, para que uma biografia criada seja visível à
 * leitura dentro da mesma composição. Cada chamada produz uma
 * composição nova e isolada — nenhum singleton, estado global ou dado
 * inicial é criado; o repositório começa vazio.
 */
export function createEditorialApplication(): EditorialApplication {
  const biographyRepository = new InMemoryProfessionalPublicBiographyRepository();

  return {
    createProfessionalPublicBiography: new CreateProfessionalPublicBiography(biographyRepository),
    getPublishedProfessionalBiography: new GetPublishedProfessionalBiography(biographyRepository),
  };
}
