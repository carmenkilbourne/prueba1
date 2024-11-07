import { Collection, MongoClient, ObjectId } from 'mongodb'
import { ModelBook, ModelUser } from "./types.ts";
import { FromModelToUser } from "./utils.ts";
import { FromModelToBook } from "./utils.ts";

// Connection URL
const url = Deno.env.get("MONGO_URL");
if(!url){
    console.error("No se puede acceder a MONGO_URL");
    Deno.exit(1);
}
const client = new MongoClient(url);
await client.connect();

// Database Name
  const dbName = 'nebrijadb';
  console.info("Conexion exitosa");
  const db = client.db(dbName);
  const Usercollection = db.collection<ModelUser>('users');
  const Bookcollection = db.collection<ModelBook>('books');

  const handler= async (req:Request):Promise<Response> => {
     const method = req.method;
     const url = new URL(req.url);
     const PATH = url.pathname;
     if (method === "GET"){
        if (PATH === "/users"){
            const name = url.searchParams.get("name");
            if (name){
                const userdb = await Usercollection.find({name}).toArray();
                const users = await Promise.all (userdb.map((u) => FromModelToUser(u,Bookcollection)));
                return new Response(JSON.stringify(users));
            }
            const UserDb = await Usercollection.find().toArray();
            const users = await Promise.all(UserDb.map((u) => FromModelToUser(u,Bookcollection)));
                return new Response(JSON.stringify(users));
        }
        if(PATH === "/books"){
            const id  = url.searchParams.get("id");
            if(id){
            const booksbd = await Bookcollection.findOne({_id:new ObjectId(id)});
            if(booksbd){
            const books = FromModelToBook(booksbd);
            return new Response(JSON.stringify(books));
            }
            return new Response("Libro no encontrado",{status:400});

            }
            const booksbd = await Bookcollection.find().toArray();
            const books = await Promise.all(booksbd.map((b) => FromModelToBook(b)));
            return new Response(JSON.stringify(books));
        }
     }
     if (method === "POST"){
        if (PATH === "/user"){
            const user = await req.json();
            if (!user.name || !user.age || !user.email){
                return new Response("Bad Request",{status:400});
            }
            const userdb = await Usercollection.findOne({email:user.mail});
            if(userdb){
                return new Response("email ya existe",{status:409});
            }
            const {insertedId} = await Usercollection.insertOne({
                name:user.name,
                email:user.email,
                age:user.age,
                books:[],
            });
            return new Response(JSON.stringify({
                id:insertedId,
                name:user.name,
                email:user.email,
                age:user.age,
                books:[],
        }));
        }
        if (PATH === "/book"){
            const book = await req.json();
            if (!book.title || !book.pages){
                return new Response("Bad Request",{status:400});
            }
            const booksbd = await Bookcollection.findOne({_id:new ObjectId()});
            if(booksbd){
                return new Response("email ya existe",{status:409});
            }
            const {insertedId} = await Bookcollection.insertOne({
                title:book.title,
                pages:book.pages,
            });
            return new Response(JSON.stringify({
                title:book.title,
                pages:book.pages,
                id:insertedId,
            }));
        
        }
    }
    if (method === "PUT"){
        if (PATH === "/user"){
            const user = await req.json();
            if (!user.name || !user.age || !user.email){
                return new Response("Bad Request",{status:400});
            }
            if (user.books) {
                const books = await Bookcollection
                  .find({
                    _id: { $in: user.books.map((id: string) => new ObjectId(id)) },
                  })
                  .toArray();
                if (books.length !== user.books.length) {
                  return new Response("Book not found", { status: 404 });
                }
              }
                  // find by email and update
        const { modifiedCount } = await Usercollection.updateOne(
            { email: user.email },
            { $set: { name: user.name, age: user.age, books: user.books } }
        );

        if (modifiedCount === 0) {
            return new Response("User not found", { status: 404 });
        }

        return new Response("OK", { status: 200 });

        }
        if(PATH === "/book"){
            const book = await req.json();
            if (!book.pages || !book.title ){
                return new Response("Bad Request",{status:400});
            }
            const {modifiedCount} = await Bookcollection.updateOne(
                {_id: new ObjectId(book.id as string)},
                {$set:{pages:book.pages,title:book.title}}
            );
            if (modifiedCount === 0) {
                return new Response("Book not found", { status: 404 });
              }
        
              return new Response("OK", { status: 200 });
        }

    }
    if(method === "DELETE"){
        if(PATH === "/user"){
            const users = await req.json();
            
        }
    }

    return new Response("No endpoint",{status:404});

  }



  Deno.serve({ port: 3000 }, handler);