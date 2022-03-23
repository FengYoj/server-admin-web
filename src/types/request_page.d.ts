interface ResponsePage<T> {
    content: T[]
    last: boolean
}

interface RequestPageConstructor<T> {
    new(args?: RequestPageArgs<T>): RequestPageImp<T>
}