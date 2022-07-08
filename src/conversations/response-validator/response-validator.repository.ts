interface Validator{
    id?:number,
    name:string,
    regex:string
}

export class ResponseValidatorRepository {
  public static validators:Validator[] = [
    {
      id: 1,
      name: 'Email',
      regex: '^([a-zA-Z0-9_\\.-]+)@([\\da-z\\.-]+)\\.([a-z\\.]{2,6})$'
    },
    {
      id: 2,
      name: 'URL',
      regex: '^https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)$' // cuando se guarden se tienen que remplazar \ po \\
    },
    {
      id: 3,
      name: 'Texto',
      regex: '(?:)'
    },
    {
      id: 4,
      name: 'Numero',
      regex: '[0-9]$'// '^9([0-9]){8}$'
    },
    {
      id: 5,
      name: 'DNI',
      regex: '^([0-9]){8}$'
    },
    {
      id: 6,
      name: 'Edad',
      regex: '^(1[0-9]{1}[0-9]{1})|^([0-9]{2})$'// '^9([0-9]){8}$'
    },

    {
      id: 7,
      name: 'Fecha (DD-MM-AAAA)',
      regex: '^([0-9]{1,2}\\-[0-9]{1,2}\\-[0-9]{4})$'
    },
    {
      id: 8,
      name: 'Fecha (DD/MM/AAAA)',
      regex: '^([0-9]{1,2}\\/[0-9]{1,2}\\/[0-9]{4})$'
    }
    // {
    //   id: 8,
    //   name: 'Fecha (DD/MM/AAAA) o (DD-MM-AAAA)',
    //   regex: '^([0-9]{1,2}\\/[0-9]{1,2}\\/[0-9]{4})|([0-9]{1,2}\\-[0-9]{1,2}\\-[0-9]{4})$'
    // }
  ]

  static findById(id:number) {
    return this.validators.find(v => v.id === id)
  }
}
