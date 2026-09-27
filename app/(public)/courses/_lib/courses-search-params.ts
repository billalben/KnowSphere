import { parseAsInteger, parseAsString, parseAsStringLiteral } from "nuqs";

import { LEVELS, SORTS } from "./courses-filters";

export const coursesSearchParams = {
  q: parseAsString.withDefault(""),
  level: parseAsStringLiteral(LEVELS).withDefault("All"),
  sort: parseAsStringLiteral(SORTS).withDefault("newest"),
  page: parseAsInteger.withDefault(1),
};
