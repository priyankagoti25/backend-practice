import {User} from "../models/user.model.js";
import bcrypt from "bcrypt";
const users = await import('../storage/users.json', {with: {type: 'json' }});

export async function seedUsers(){
    try {
        const hashedUsers = await Promise.all(users.default.map(async (user)=>{
            const hashedPassword = await bcrypt.hash(user.password, 10)
            return {...user, password: hashedPassword}
        }))
        await User.deleteMany()
        await User.insertMany(hashedUsers)
        console.log("Users seeded successfully")
    } catch (error){
        console.log("Failed to seed users")
        console.log("Error: ", error)
        process.exit(1)
    }
}