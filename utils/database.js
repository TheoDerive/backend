const mongoose= require("mongoose");
require('dotenv').config();

let isConnected = false

const connectToDb = async () => {
    mongoose.set('strictQuery', true)

    if (isConnected){
        ('Déja Connecter')
        return
    }else{

        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                dbName: 'users',
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })

            isConnected = true

            ('Vous etes connecter')
        }catch (e) {
            console.error(e)
        }
    }
}

module.exports = {
    connectToDb
}