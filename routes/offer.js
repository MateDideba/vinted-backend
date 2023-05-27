const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const convertToBase64 = require("../utils/convertB64");
const isAuthenticated = require("../middlewares/isAuthenticated");
const cloudinary = require("cloudinary").v2;

const Offer = require("../models/Offer");

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      // console.log(req.body);
      const { title, description, price, condition, city, brand, color, size } =
        req.body;
      // console.log(req.files.picture);

      // on va pouvoir créer et upload l'image
      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          {
            MARQUE: brand,
          },
          {
            TAILLE: size,
          },
          {
            ÉTAT: condition,
          },
          {
            COULEUR: color,
          },
          {
            EMPLACEMENT: city,
          },
        ],
        owner: req.user,
      });
      // console.log(newOffer);
      // A ce stade, notre offre a son id mongoose, mais n'a pas encore enregistrée dans la BDD
      // Conversion de l'image en base 64 :
      if (req.files) {
        const pictureToUpload = convertToBase64(req.files.picture);
        console.log(pictureToUpload);
        const uploadResult = await cloudinary.uploader.upload(pictureToUpload, {
          // folder: `/correction/vinted/${newOffer._id}`
          folder: `/correction/vinted`,
        });
        console.log(uploadResult);
        newOffer.product_image = uploadResult;
      }

      await newOffer.save();
      return res.status(201).json(newOffer);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    // On défini un nombre de résultats par page :
    const limit = 5;
    // on défini une page par default (la page une):
    let currentPage = 1;
    // formule pour la pagination :
    // skip = (page - 1) * limit

    console.log(req.query); // { title: 'pantalon', priceMax: '60', priceMin: '25', sort: 'price-desc', page: '4' }
    const { title, priceMax, priceMin, sort, page } = req.query;
    // Faire un .find pour récupérer les offres :
    // on va créer un objet vide : filters
    const filters = {};
    // on va ensuite remplir cet objet selon que les filtres (donc les query) sont présents ou non
    if (title) {
      // si on a une query title, alors on crée la clef product_name dans l'objet filters, et lui assigne une valeur :
      filters.product_name = new RegExp(title, "i");
    }
    if (priceMax) {
      filters.product_price = { $lte: priceMax };
    }
    if (priceMin) {
      if (priceMax) {
        // si on a un priceMax, alors la clef product_price existe déjà dans l'objet filters : elle renvoie un objet, dans lequel on peut créer une nouvelle clef
        filters.product_price.$gte = priceMin;
      } else {
        filters.product_price = { $gte: priceMin };
      }
    }
    console.log("filters =>", filters);
    const sortObject = {};
    if (sort === "price-desc") {
      sortObject.product_price = "desc";
    } else if (sort === "price-asc") {
      sortObject.product_price = "asc";
    }

    // PAGINATION :
    // si on a une query page, alors on modifie la valeur de currentPage :
    currentPage = page;

    const offers = await Offer.find(filters)
      .sort(sortObject)
      .limit(limit)
      .skip((page - 1) * limit)
      .populate({ path: "owner", select: "account -_id" })
      .select("-__v");
    const count = await Offer.countDocuments(filters);
    console.log("count =>", count);
    return res.status(200).json({ count: count, offers: offers });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    const result = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account",
    });
    if (result) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json("Cette offre n'existe pas (ou plus) !");
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
