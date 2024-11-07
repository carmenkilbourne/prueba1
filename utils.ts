import type { Collection } from "mongodb";
import type { Book, ModelBook, ModelUser, User } from "./types.ts";



export const FromModelToUser = async (
    model:ModelUser,
    bookcollection: Collection<ModelBook>,

):Promise<User> => {
    const books = await bookcollection.find({_id:{$in:model.books}}).toArray();
    return {
        id:model._id!.toString(),
        name:model.name,
        email:model.email,
        age:model.age,
        books: books.map((b) => FromModelToBook(b)),
    };
};

export const FromModelToBook = (model:ModelBook):Book =>({
    id:model._id!.toString(),
    title:model.title,
    pages:model.pages,
});