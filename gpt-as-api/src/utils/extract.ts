export const extractJSON = (input: string) => {
  console.log(input);
  const jsonRegex = /{(?:[^{}]|{(?:[^{}]|{[^{}]*})*})*}/g;
  const jsonMatches = input.match(jsonRegex);

  if (!jsonMatches) {
    throw new Error("No JSON found in the input string.");
  }

  const jsonArray = jsonMatches.map((jsonString) => JSON.parse(jsonString));
  return jsonArray.length === 1 ? jsonArray[0] : jsonArray;
};

export const extractSQL = (input: string): string[] => {
  const sqlRegex =
    /(?:SELECT|INSERT|UPDATE|DELETE)[\s\S]+?(?:FROM|INTO|SET|WHERE)[\s\S]+?(?:WHERE[\s\S]+?)?;/gi;
  const sqlMatches = input.match(sqlRegex);

  if (!sqlMatches) {
    throw new Error("No SQL found in the input string.");
  }

  return sqlMatches;
};

export const extractHTML = (input: string): string => {
  console.log(input);
  const htmlRegex = /<\s*html(?:\s[^>]*)?>[\s\S]*<\s*\/\s*html>/gi;
  const htmlMatches = input.match(htmlRegex);

  if (!htmlMatches) {
    throw new Error("No HTML found in the input string.");
  }

  return htmlMatches[0];
};
