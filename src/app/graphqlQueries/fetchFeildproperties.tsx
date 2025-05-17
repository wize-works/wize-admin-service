
export const fetchFieldproperties = (table: string) => `
  query {
    __type(name: "${table}") {
      name
      fields {
        name
        type {
          name
          kind
          ofType {
            name
            kind
          }
        }
      }
    }
  }
`;
