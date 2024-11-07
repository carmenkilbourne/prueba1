//tipos

import type {ObjectId, OptionalId } from "mongodb";

export type ModelUser = OptionalId<{
    name: string;
    email:string;
    age:number;
    books:ObjectId[];
}>;
export type User = {
    id:string;
    name: string;
    email:string;
    age:number;
    books:Book[];
};
export type Book = {
    id:string;
    title: string;
    pages:number;
};
export type ModelBook = OptionalId<{
    title: string;
    pages:number;
}>;