const express = require('express');
const cors = require('cors');
const { connectToDb } = require('./utils/database');
const Category = require('./models/Category');
const Project = require('./models/Project')

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/', async (req, res) => {
    try{
        await connectToDb()
        res.send('Connexion à MongoDB réussie !');
    } catch (error) {
        console.error('Erreur de connexion à MongoDB :', error);
        res.status(500).send('Erreur de connexion à MongoDB.');
    }
})

app.get('/all-categories', async (req, res) => {
    await connectToDb();

    try {
        const allCategories = await Category.find();
        res.json(allCategories);
    } catch (error) {
        console.error(error);
        res.status(500).send('Une erreur est survenue lors de la récupération des catégories.');
    }
});

app.get('/get-categorie/:categorie', async (req, res) => {
    await connectToDb();
    console.log(req.params.categorie)

    try {
        const allCategories = await Category.find({name: req.params.categorie});
        res.json(allCategories);
    } catch (error) {
        console.error(error);
        res.status(500).send('Une erreur est survenue lors de la récupération des catégories.');
    }
});


app.post('/new-category', async (req, res) => {
    await connectToDb()
    const { nameCategory, imageCategory } = req.body;
    const allCategory = await Category.findOne({name: nameCategory})

    if (allCategory){
        res.send('La categorie existe déjà !')
    }else {
        const newCategory = new Category({
            name: nameCategory.toLowerCase(),
            image: imageCategory,
            content: []
        })

        try{
            await newCategory.save()
            res.send('Category crée !')
        }catch (e){
            console.log(e)
            res.send(e)
        }
    }
});

app.post('/new-project', async (req, res) => {
    await connectToDb();
    const { nameCategory, nameProject, imageProject, descriptionProject } = req.body;
    const allCategory = await Category.findOne({ name: nameCategory });
    const { dateProjet, isLarge, isTall } = req.body;


    if (allCategory) {
        // Vérifier si le projet existe déjà dans la liste content
        const projectExists = allCategory.content.some(project =>
            project.name === nameProject &&
            project.image === imageProject ||
            project.name === nameProject &&
            project.description === descriptionProject ||
            project.name === nameProject &&
            project.date === dateProjet
        );

        console.log(isLarge, isTall)

        if (projectExists) {
            res.send('Le projet existe déjà dans la catégorie !');
        }else if (isLarge === true && isTall === true){
            res.send("Le projet ne peux être large et grand, ne rien mettre si c'est le cas");
        } else {
            const newProject = new Project({
                name: nameProject,
                image: imageProject,
                description: descriptionProject,
                date: dateProjet ? dateProjet : new Date(),
                category: nameCategory,
                isLarge: isLarge,
                isTall: isTall
            });

            const arrayContent = allCategory.content;
            arrayContent.push(newProject);

            const updatedProject = await Category.findOneAndUpdate(
                { name: nameCategory },
                { $set: { content: arrayContent } },
                { new: true }
            );

            res.json(updatedProject);
        }
    } else {
        res.send('La categorie n\'existe pas !');
    }
});

app.delete('/delete-project', async (req, res) => {
    await connectToDb();
    const { nameCategory, nameProject, imageProject, descriptionProject } = req.body;
    const category = await Category.findOne({ name: nameCategory });

    if (category) {
        // Vérifier si le projet existe dans la liste content
        const projectIndex = category.content.findIndex(project =>
            project.name === nameProject &&
            project.image === imageProject &&
            project.description === descriptionProject
        );

        if (projectIndex !== -1) {
            // Supprimer le projet de la liste content
            category.content.splice(projectIndex, 1);

            // Mettre à jour la catégorie dans la base de données
            const updatedCategory = await Category.findOneAndUpdate(
                { name: nameCategory },
                { $set: { content: category.content } },
                { new: true }
            );

            res.json(updatedCategory);
        } else {
            res.send('Le projet n\'existe pas dans la catégorie !');
        }
    } else {
        res.send('La catégorie n\'existe pas !');
    }
});

app.delete('/delete-category', async (req, res) => {
    await connectToDb()
    const {nameCategory} = req.body
    const removeCategory = await Category.findOneAndDelete({name: nameCategory})
    console.log(req.body)

    if (removeCategory) {
        res.json({ message: 'Catégorie supprimée avec succès !', removeCategory });
    } else {
        res.send('La catégorie n\'existe pas !');
    }

})

app.put('/update-project', async (req, res) => {
    await connectToDb();
    const { nameCategory, oldProjectName, oldProjectImage, oldProjectDescription, oldProjectDate, oldProjetIsTall, oldProjetIsLarge, newProjectName, newProjectImage, newProjectDescription, newProjectDate, newProjetIsTall, newProjetIsLarge  } = req.body;

    const category = await Category.findOne({ name: nameCategory });
    console.log(req.body)

    if (category) {
        // Vérifier si le projet existant doit être mis à jour
        const projectIndex = category.content.findIndex(project =>
            project.name === oldProjectName &&
            project.image === oldProjectImage &&
            project.description === oldProjectDescription
        );

        console.log(category.content[projectIndex])

        if (projectIndex !== -1) {
            // Mettre à jour les détails du projet
            category.content[projectIndex].name = newProjectName;
            category.content[projectIndex].image = newProjectImage;
            category.content[projectIndex].description = newProjectDescription;
            category.content[projectIndex].date = newProjectDate;
            category.content[projectIndex].isLarge = newProjetIsLarge;
            category.content[projectIndex].isTall = newProjetIsTall;

            // Mettre à jour la catégorie dans la base de données
            const updatedCategory = await Category.findOneAndUpdate(
                { name: nameCategory },
                { $set: { content: category.content } },
                { new: true }
            );

            console.log(updatedCategory)

            res.json(updatedCategory);
        } else {
            res.status(300).send('Le projet à mettre à jour n\'existe pas dans la catégorie !');
        }
    } else {
        res.send('La catégorie n\'existe pas !');
    }
});

app.put('/update-category', async (req, res) => {
    await connectToDb();
    const { oldCategoryName, newCategoryName, newCategoryImage } = req.body;

    const updatedCategory = await Category.findOneAndUpdate(
        { name: oldCategoryName },
        { $set: { name: newCategoryName, image: newCategoryImage } },
        { new: true }
    );

    if (updatedCategory) {
        res.json(updatedCategory);
    } else {
        res.send('La catégorie à mettre à jour n\'existe pas !');
    }
});


app.use((req, res, next) => {
    res.status(404).send("Désolé, la page que vous recherchez n'existe pas.");
});

// Définir le port sur lequel le serveur écoutera
const port = 3001;
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
