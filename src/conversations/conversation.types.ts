export interface Option{
    id:number,
    value:string,
    action:string
}

export interface Menu{
    id:number,
    title:string,
    options:Option[]
}

export interface Message{
    id:number,
    message:string
}

export interface Question{
    id:number,
    question:string,
    response_type:string|number,
    error_message:string
}

export interface Validator{
    id:number,
    name:string,
    regex:string,
}

export interface Quiz{
    id:number,
    questions:Question[]
}

export interface Step{
   // id:number,
    order:number,
    action:string
    status:number|boolean,

}

export interface Redirect{
   // id:number,
   id:number,
    to:string

}

export interface Config{
    id:number,
    menus:Menu[],
    quizes:Quiz[],
    messages:Message[],
    steps:Step[],
    redirects:Redirect[]
}
